import re, json, logging, httpx, resend
logger = logging.getLogger(__name__)
from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client
from app.core.config import settings
from app.models.domain import *
from app.models.enums import *
from app.services.email_templates import acknowledgement_html, auto_reply_html, owner_alert_html

def slugify(v:str)->str:
    v=re.sub(r'[^a-z0-9]+','-',v.lower().strip()); return re.sub(r'-+','-',v).strip('-') or 'business'
class BusinessService:
    def __init__(self,db:AsyncSession): self.db=db
    async def unique_slug(self,name):
        base=slugify(name); slug=base; n=2
        while (await self.db.execute(select(func.count()).select_from(Business).where(Business.slug==slug))).scalar_one(): slug=f'{base}-{n}'; n+=1
        return slug
    async def create_business(self,payload,actor_user_id:UUID):
        slug=await self.unique_slug(payload.name)
        b=Business(name=payload.name,slug=slug,industry=payload.industry,phone=payload.phone,contact_email=str(payload.contact_email) if payload.contact_email else None,address=payload.address,brand_color=payload.brand_color,created_by=actor_user_id)
        self.db.add(b); await self.db.flush()
        f=Form(business_id=b.id,slug=slug); self.db.add(f)
        self.db.add(AuditLog(actor_user_id=actor_user_id,business_id=b.id,action='business.created',entity_type='business',entity_id=str(b.id),details={'slug':slug,'owner_email':str(payload.owner.email)}))
        try:
            res=create_client(settings.SUPABASE_URL,settings.SUPABASE_SERVICE_ROLE_KEY).auth.admin.invite_user_by_email(str(payload.owner.email),{'redirect_to':f'{settings.FRONTEND_URL}/auth/callback?type=invite'})
            if res.user:
                owner_uid=UUID(str(res.user.id))
                if not await self.db.get(Profile,owner_uid):
                    self.db.add(Profile(id=owner_uid,email=str(payload.owner.email),full_name=payload.owner.full_name,role=ProfileRole.BUSINESS_OWNER))
                await self.db.flush()
                self.db.add(BusinessMember(business_id=b.id,user_id=owner_uid,role=MemberRole.OWNER,is_active=True))
                self.db.add(AuditLog(actor_user_id=actor_user_id,business_id=b.id,action='owner.invited',entity_type='profile',entity_id=str(owner_uid),details={'email':str(payload.owner.email)}))
        except Exception as exc:
            self.db.add(AuditLog(actor_user_id=actor_user_id,business_id=b.id,action='owner.invite.failed',details={'error':str(exc)}))
        await self.db.flush(); return b,f
import re as _re
def _build_from(display_name: str | None) -> str:
    """Build a From address like 'Business Name <addr@domain>'. The verified sending
    address is always taken from settings; only the display name is swapped out."""
    match = _re.search(r'<([^>]+)>', settings.RESEND_FROM_EMAIL)
    addr = match.group(1) if match else settings.RESEND_FROM_EMAIL
    if display_name:
        safe = display_name.replace('"', "'")
        return f'"{safe}" <{addr}>'
    return settings.RESEND_FROM_EMAIL

class EmailService:
    def __init__(self,db): self.db=db; resend.api_key=settings.RESEND_API_KEY if settings.RESEND_API_KEY else None
    async def send(self,to,subject,html,business_id=None,lead_id=None,from_name:str|None=None):
        from_addr = _build_from(from_name)
        ev=EmailEvent(business_id=business_id,lead_id=lead_id,to_email=to,from_email=from_addr,subject=subject,status=EmailStatus.QUEUED); self.db.add(ev); await self.db.flush()
        if not settings.RESEND_API_KEY: ev.status=EmailStatus.FAILED; ev.error_message='Missing RESEND_API_KEY'; return {'sent':False}
        try:
            res=resend.Emails.send({'from':from_addr,'to':[to],'subject':subject,'html':html}); ev.status=EmailStatus.SENT; ev.provider_message_id=res.get('id') if isinstance(res,dict) else None; return {'sent':True}
        except Exception as exc: ev.status=EmailStatus.FAILED; ev.error_message=str(exc); return {'sent':False,'error':str(exc)}
def _safety_gate(business, ai: dict) -> tuple[bool, str | None]:
    """Returns (auto_send_allowed, block_reason).
    Business-level conditions are hard gates. AI decision is trusted as the final arbiter
    rather than re-evaluating risk_level/blocked_topics here — that avoids over-blocking
    leads where the customer expressed urgency but the reply itself is safe."""
    if not business.smart_auto_reply:
        return False, 'smart_auto_reply_disabled'
    if business.owner_approval_required:
        return False, 'owner_approval_required'
    if business.status != BusinessStatus.ACTIVE:
        return False, 'business_not_active'
    if not ai.get('auto_send_allowed'):
        return False, 'ai_flagged_unsafe'
    return True, None

class DeepSeekService:
    _SYSTEM = (
        'You are a lead analysis assistant for a small business CRM. '
        'Analyse the incoming lead and return ONLY a valid JSON object with these exact keys:\n'
        '  summary (str), urgency ("high"|"normal"|"low"), intent (str), '
        '  suggested_reply (str — warm, professional, first-name greeting; MUST NOT include specific prices, '
        'confirmed booking dates/times, confirmed availability, refund/discount promises, or legal/medical/financial advice), '
        '  next_step (str), tags (list[str]),\n'
        '  risk_level ("low"|"medium"|"high" — rate the BUSINESS RISK of auto-sending the suggested_reply; '
        '"low" for normal service inquiries even if urgent; "high" only for complaints, threats, legal mentions, or highly ambiguous requests), '
        '  confidence_score (float 0-1 — how confident you are the suggested_reply is appropriate to auto-send), '
        '  blocked_topics (list[str] — list ONLY topics that the suggested_reply ITSELF would need to commit to '
        'in order to answer the lead properly; if the reply can stay warm and non-committal, leave this empty. '
        'Possible values: price_commitment, booking_confirmation, availability_promise, refund_or_discount, '
        'legal_advice, medical_advice, financial_advice), '
        '  auto_send_allowed (bool — true if risk_level is low, confidence >= 0.75, and blocked_topics is empty; '
        'a customer asking for urgent service or mentioning a specific day does NOT itself block auto-send — '
        'only block if the reply would require making a specific commitment the business cannot guarantee).\n'
        'Return strict JSON only. No markdown. No extra text.'
    )
    _FALLBACK = {
        'summary': '', 'urgency': 'normal', 'intent': 'inquiry',
        'suggested_reply': 'Thank you for reaching out. We have received your request and will follow up shortly.',
        'next_step': 'Review and respond.',
        'tags': [],
        'risk_level': 'medium', 'confidence_score': 0.5,
        'blocked_topics': [], 'auto_send_allowed': False,
    }
    async def summarize(self, business_name: str, lead) -> dict:
        fallback = {**self._FALLBACK, 'summary': f'{lead.customer_name} requested {lead.service_needed or "service"}.'}
        if not settings.DEEPSEEK_API_KEY:
            return fallback
        user_prompt = (
            f'Business: {business_name}\n'
            f'Customer name: {lead.customer_name}\n'
            f'Service requested: {lead.service_needed or "not specified"}\n'
            f'Message: {lead.message or "no message provided"}'
        )
        try:
            async with httpx.AsyncClient(timeout=25) as client:
                r = await client.post(
                    settings.DEEPSEEK_BASE_URL.rstrip('/') + '/chat/completions',
                    headers={'Authorization': f'Bearer {settings.DEEPSEEK_API_KEY}'},
                    json={
                        'model': settings.DEEPSEEK_MODEL,
                        'messages': [
                            {'role': 'system', 'content': self._SYSTEM},
                            {'role': 'user', 'content': user_prompt},
                        ],
                        'temperature': 0.2,
                    },
                )
                r.raise_for_status()
                txt = r.json()['choices'][0]['message']['content'].strip()
                if txt.startswith('```'):
                    txt = txt.split('```')[1].lstrip('json').strip()
            return json.loads(txt)
        except Exception as exc:
            logger.error('DeepSeek summarize failed: %s', exc)
            fallback['raw_ai_output'] = str(exc)
            return fallback
class LeadWorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.email = EmailService(db)
        self.ai = DeepSeekService()

    async def submit(self, slug: str, payload):
        # ── 1. Resolve form + business ──────────────────────────────────────
        form = (await self.db.execute(
            select(Form).where(Form.slug == slug, Form.is_active.is_(True))
        )).scalar_one_or_none()
        if not form:
            return None
        business = await self.db.get(Business, form.business_id)

        # ── 2. Save lead ────────────────────────────────────────────────────
        lead = Lead(
            business_id=business.id, form_id=form.id,
            customer_name=payload.customer_name,
            customer_email=str(payload.customer_email) if payload.customer_email else None,
            customer_phone=payload.customer_phone,
            service_needed=payload.service_needed,
            preferred_time=payload.preferred_time,
            message=payload.message,
            custom_fields=payload.custom_fields,
        )
        self.db.add(lead)
        await self.db.flush()

        # ── 3. Store inbound customer message ───────────────────────────────
        if payload.message:
            self.db.add(Message(
                business_id=business.id, lead_id=lead.id,
                direction=MessageDirection.INBOUND, channel=MessageChannel.FORM,
                message_type=MessageType.CUSTOMER_MESSAGE,
                subject='Public form submission', content=payload.message,
            ))

        # ── 4. AI analysis (run before any email decision) ──────────────────
        ai = await self.ai.summarize(business.name, lead)
        suggested_reply = ai.get('suggested_reply', '')

        # Store full AI decision data
        self.db.add(AIOutput(
            business_id=business.id, lead_id=lead.id,
            output_type=AIOutputType.LEAD_SUMMARY,
            model=settings.DEEPSEEK_MODEL,
            structured_output=ai,
        ))

        # ── 5. Always save AI reply as a draft for owner review ─────────────
        self.db.add(Message(
            business_id=business.id, lead_id=lead.id,
            direction=MessageDirection.INTERNAL, channel=MessageChannel.SYSTEM,
            message_type=MessageType.AI_DRAFT,
            subject='AI suggested reply', content=suggested_reply,
        ))

        # ── 6. Safety gate — personalized reply OR acknowledgement, never both
        auto_sent = False
        allowed, block_reason = _safety_gate(business, ai)
        if allowed and lead.customer_email and suggested_reply:
            # Gate passed: send personalized AI reply (this IS the acknowledgement)
            reply_subject = f'Re: Your {lead.service_needed or "service"} request — {business.name}'
            reply_html = auto_reply_html(business.name, lead.customer_name, suggested_reply, business.brand_color)
            await self.email.send(lead.customer_email, reply_subject, reply_html, business.id, lead.id, from_name=business.name)
            self.db.add(Message(
                business_id=business.id, lead_id=lead.id,
                direction=MessageDirection.OUTBOUND, channel=MessageChannel.EMAIL,
                message_type=MessageType.AUTO_REPLY,
                subject=reply_subject, content=suggested_reply,
            ))
            auto_sent = True
        elif lead.customer_email:
            # Gate failed: send safe generic acknowledgement instead
            ack_subject = f'We received your request — {business.name}'
            ack_content = f'Hi {lead.customer_name}, thank you for reaching out to {business.name}. We have received your request and will be in touch with you shortly.'
            ack_html = acknowledgement_html(business.name, lead.customer_name, business.brand_color)
            await self.email.send(lead.customer_email, ack_subject, ack_html, business.id, lead.id, from_name=business.name)
            # Store in thread so owner sees the customer already received an acknowledgement
            self.db.add(Message(
                business_id=business.id, lead_id=lead.id,
                direction=MessageDirection.OUTBOUND, channel=MessageChannel.EMAIL,
                message_type=MessageType.AUTO_REPLY,
                subject=ack_subject, content=ack_content,
            ))

        # ── 8. Owner notification (always ON) ───────────────────────────────
        if business.contact_email:
            alert_html = owner_alert_html(
                business.name, lead.customer_name,
                lead.customer_email, lead.customer_phone,
                lead.service_needed, lead.message,
                suggested_reply,
                f'{settings.FRONTEND_URL}/dashboard/leads',
                business.brand_color,
                auto_sent=auto_sent,
                block_reason=block_reason,
            )
            await self.email.send(
                business.contact_email,
                f'New lead: {lead.customer_name}',
                alert_html, business.id, lead.id,
            )

        # ── 9. Audit + follow-up ────────────────────────────────────────────
        self.db.add(AuditLog(
            business_id=business.id, action='lead.created',
            entity_type='lead', entity_id=str(lead.id),
            details={'source': 'public_form', 'auto_sent': auto_sent, 'block_reason': block_reason},
        ))
        self.db.add(FollowUp(
            business_id=business.id, lead_id=lead.id,
            scheduled_at=datetime.now(timezone.utc) + timedelta(hours=24),
            subject=f'Follow-up: {lead.customer_name}',
            content=(
                f'Hi {lead.customer_name}, just following up on your request for '
                f'{lead.service_needed or "our services"}. Are you still interested?'
            ),
        ))
        await self.db.flush()
        return lead, form, business

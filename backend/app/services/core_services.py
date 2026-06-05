import re, json, httpx, resend
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client
from app.core.config import settings
from app.models.domain import *
from app.models.enums import *

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
        self.db.add(b); await self.db.flush(); f=Form(business_id=b.id,slug=slug); self.db.add(f)
        self.db.add(AuditLog(actor_user_id=actor_user_id,business_id=b.id,action='business.created',entity_type='business',entity_id=str(b.id),details={'slug':slug,'owner_email':str(payload.owner.email)}))
        try: create_client(settings.SUPABASE_URL,settings.SUPABASE_SERVICE_ROLE_KEY).auth.admin.invite_user_by_email(str(payload.owner.email))
        except Exception as exc: self.db.add(AuditLog(actor_user_id=actor_user_id,business_id=b.id,action='owner.invite.failed',details={'error':str(exc)}))
        await self.db.flush(); return b,f
class EmailService:
    def __init__(self,db): self.db=db; resend.api_key=settings.RESEND_API_KEY if settings.RESEND_API_KEY else None
    async def send(self,to,subject,html,business_id=None,lead_id=None):
        ev=EmailEvent(business_id=business_id,lead_id=lead_id,to_email=to,from_email=settings.RESEND_FROM_EMAIL,subject=subject,status=EmailStatus.QUEUED); self.db.add(ev); await self.db.flush()
        if not settings.RESEND_API_KEY: ev.status=EmailStatus.FAILED; ev.error_message='Missing RESEND_API_KEY'; return {'sent':False}
        try:
            res=resend.Emails.send({'from':settings.RESEND_FROM_EMAIL,'to':[to],'subject':subject,'html':html}); ev.status=EmailStatus.SENT; ev.provider_message_id=res.get('id') if isinstance(res,dict) else None; return {'sent':True}
        except Exception as exc: ev.status=EmailStatus.FAILED; ev.error_message=str(exc); return {'sent':False,'error':str(exc)}
class DeepSeekService:
    async def summarize(self,business_name,lead):
        fallback={'summary':f'{lead.customer_name} requested {lead.service_needed or "service"}.','urgency':'normal','intent':'unknown','suggested_reply':'Thanks for reaching out. We received your request and will follow up soon.','next_step':'Review and respond.','tags':[]}
        if not settings.DEEPSEEK_API_KEY: return fallback
        async with httpx.AsyncClient(timeout=20) as client:
            prompt=f'Business: {business_name}\nLead: {lead.customer_name}, {lead.service_needed}, {lead.message}. Return summary, urgency, intent, suggested_reply, next_step, tags.'
            r=await client.post(settings.DEEPSEEK_BASE_URL.rstrip('/')+'/chat/completions',headers={'Authorization':f'Bearer {settings.DEEPSEEK_API_KEY}'},json={'model':settings.DEEPSEEK_MODEL,'messages':[{'role':'system','content':'Return strict JSON only.'},{'role':'user','content':prompt}],'temperature':0.2})
            r.raise_for_status(); txt=r.json()['choices'][0]['message']['content']
        try: return json.loads(txt)
        except Exception: fallback['raw_ai_output']=txt; return fallback
class LeadWorkflowService:
    def __init__(self,db): self.db=db; self.email=EmailService(db); self.ai=DeepSeekService()
    async def submit(self,slug,payload):
        form=(await self.db.execute(select(Form).where(Form.slug==slug,Form.is_active.is_(True)))).scalar_one_or_none()
        if not form: return None
        business=await self.db.get(Business,form.business_id)
        lead=Lead(business_id=business.id,form_id=form.id,customer_name=payload.customer_name,customer_email=str(payload.customer_email) if payload.customer_email else None,customer_phone=payload.customer_phone,service_needed=payload.service_needed,preferred_time=payload.preferred_time,message=payload.message,custom_fields=payload.custom_fields)
        self.db.add(lead); await self.db.flush()
        if payload.message: self.db.add(Message(business_id=business.id,lead_id=lead.id,direction=MessageDirection.INBOUND,channel=MessageChannel.FORM,message_type=MessageType.CUSTOMER_MESSAGE,subject='Public form submission',content=payload.message))
        ai=await self.ai.summarize(business.name,lead); self.db.add(AIOutput(business_id=business.id,lead_id=lead.id,output_type=AIOutputType.LEAD_SUMMARY,model=settings.DEEPSEEK_MODEL,structured_output=ai)); self.db.add(Message(business_id=business.id,lead_id=lead.id,direction=MessageDirection.INTERNAL,channel=MessageChannel.SYSTEM,message_type=MessageType.AI_DRAFT,subject='AI suggested reply',content=ai.get('suggested_reply','')))
        if lead.customer_email: await self.email.send(lead.customer_email,f'Thanks for contacting {business.name}',f'<p>Hi {lead.customer_name}, thanks for contacting {business.name}. We received your request.</p>',business.id,lead.id)
        if business.contact_email: await self.email.send(business.contact_email,f'New lead: {lead.customer_name}',f'<p>New lead for {business.name}: {lead.message or lead.service_needed}</p>',business.id,lead.id)
        self.db.add(AuditLog(business_id=business.id,action='lead.created',entity_type='lead',entity_id=str(lead.id),details={'source':'public_form'})); await self.db.flush(); return lead,form,business

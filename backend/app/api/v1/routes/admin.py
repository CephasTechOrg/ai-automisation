import time
from uuid import UUID
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.core.security import AuthUser, require_super_admin
from pydantic import BaseModel
from app.models.domain import Business, BusinessMember, Profile, Lead, AuditLog, Form, EmailEvent
from app.models.enums import BusinessStatus, ProfileRole, EmailStatus, LeadStatus
from app.schemas.common import APIResponse
from app.schemas.business import BusinessCreate, BusinessUpdate, BusinessRead
from app.services.core_services import BusinessService

router = APIRouter()

async def _log(db: AsyncSession, actor_id: UUID, action: str, business_id: UUID | None = None, details: dict | None = None):
    db.add(AuditLog(actor_user_id=actor_id, business_id=business_id, action=action, details=details or {}))

LOGO_BUCKET = 'business-logos'
ALLOWED_MIME = {'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'}
MAX_LOGO_BYTES = 5 * 1024 * 1024  # 5 MB


def _sb():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def _ensure_bucket(sb) -> None:
    try:
        sb.storage.create_bucket(
            LOGO_BUCKET,
            options={
                'public': True,
                'file_size_limit': MAX_LOGO_BYTES,
                'allowed_mime_types': list(ALLOWED_MIME),
            },
        )
    except Exception:
        pass  # bucket already exists


@router.get('/metrics', response_model=APIResponse[dict])
async def admin_metrics(user: AuthUser = Depends(require_super_admin), db: AsyncSession = Depends(get_db)):
    today = date.today(); week_start = today - timedelta(days=6); chart_start = today - timedelta(days=13)
    total_biz = (await db.execute(select(func.count()).select_from(Business))).scalar_one()
    active_biz = (await db.execute(select(func.count()).select_from(Business).where(Business.status == BusinessStatus.ACTIVE))).scalar_one()
    leads_today = (await db.execute(select(func.count()).select_from(Lead).where(cast(Lead.created_at, Date) == today))).scalar_one()
    leads_week = (await db.execute(select(func.count()).select_from(Lead).where(cast(Lead.created_at, Date) >= week_start))).scalar_one()
    chart_rows = (await db.execute(
        select(cast(Lead.created_at, Date).label('day'), func.count().label('cnt'))
        .where(cast(Lead.created_at, Date) >= chart_start)
        .group_by('day').order_by('day')
    )).all()
    counts = {r.day: r.cnt for r in chart_rows}
    chart = [{'label': (chart_start + timedelta(days=i)).strftime('%b %-d'), 'v': counts.get(chart_start + timedelta(days=i), 0)} for i in range(14)]
    return APIResponse(data={'total_businesses': total_biz, 'active_businesses': active_biz, 'leads_today': leads_today, 'leads_this_week': leads_week, 'chart': chart})

@router.patch('/businesses/{business_id}/status', response_model=APIResponse[BusinessRead])
async def set_business_status(
    business_id: UUID,
    payload: dict,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    from pydantic import BaseModel
    status_val = payload.get('status')
    if status_val not in [s.value for s in BusinessStatus]:
        raise HTTPException(status_code=422, detail=f'Invalid status. Must be one of: {[s.value for s in BusinessStatus]}')
    business = await db.get(Business, business_id)
    if not business:
        raise NotFoundError('Business not found')
    old_status = business.status
    business.status = BusinessStatus(status_val)
    await _log(db, user.id, 'business_status_changed', business_id, {'from': str(old_status), 'to': status_val, 'name': business.name})
    await db.commit()
    await db.refresh(business)
    return APIResponse(data=BusinessRead.model_validate(business))

@router.post('/businesses', response_model=APIResponse[dict])
async def create_business(
    payload: BusinessCreate,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    business, form = await BusinessService(db).create_business(payload, user.id)
    await _log(db, user.id, 'business_created', business.id, {'name': business.name, 'owner_email': payload.owner.email})
    await db.commit()
    return APIResponse(data={
        'business': BusinessRead.model_validate(business).model_dump(mode='json'),
        'form_link': f'/forms/{form.slug}',
    })


@router.get('/businesses', response_model=APIResponse[list[BusinessRead]])
async def list_businesses(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
):
    rows = (await db.execute(
        select(Business).order_by(Business.created_at.desc()).limit(limit).offset(offset)
    )).scalars().all()
    return APIResponse(data=[BusinessRead.model_validate(x) for x in rows])


@router.get('/businesses/{business_id}', response_model=APIResponse[BusinessRead])
async def get_business(
    business_id: UUID,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    business = await db.get(Business, business_id)
    if not business:
        raise NotFoundError('Business not found')
    return APIResponse(data=BusinessRead.model_validate(business))


@router.patch('/businesses/{business_id}', response_model=APIResponse[BusinessRead])
async def update_business(
    business_id: UUID,
    payload: BusinessUpdate,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    business = await db.get(Business, business_id)
    if not business:
        raise NotFoundError('Business not found')
    changed = payload.model_dump(exclude_unset=True)
    for field, value in changed.items():
        setattr(business, field, value)
    await _log(db, user.id, 'business_updated', business_id, {'fields': list(changed.keys()), 'name': business.name})
    await db.commit()
    await db.refresh(business)
    return APIResponse(data=BusinessRead.model_validate(business))


@router.post('/businesses/{business_id}/logo', response_model=APIResponse[dict])
async def upload_logo(
    business_id: UUID,
    file: UploadFile = File(...),
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail='Invalid file type. Use PNG, JPG, WebP, or SVG.')

    content = await file.read()
    if len(content) > MAX_LOGO_BYTES:
        raise HTTPException(status_code=400, detail='File too large. Maximum size is 5 MB.')

    business = await db.get(Business, business_id)
    if not business:
        raise NotFoundError('Business not found')

    ext = (file.filename or 'logo').rsplit('.', 1)[-1].lower()
    if ext not in ('png', 'jpg', 'jpeg', 'webp', 'svg'):
        ext = 'jpg'

    sb = _sb()
    _ensure_bucket(sb)

    path = f'logos/{business_id}/{int(time.time())}.{ext}'
    sb.storage.from_(LOGO_BUCKET).upload(
        path, content, {'content-type': file.content_type or 'image/jpeg'}
    )
    public_url = sb.storage.from_(LOGO_BUCKET).get_public_url(path)

    business.logo_url = public_url
    await db.commit()

    return APIResponse(data={'logo_url': public_url})


@router.post('/businesses/{business_id}/resend-invite', response_model=APIResponse[dict])
async def resend_invite(
    business_id: UUID,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    business = await db.get(Business, business_id)
    if not business:
        raise NotFoundError('Business not found')

    email = None
    member = (await db.execute(
        select(BusinessMember).where(
            BusinessMember.business_id == business_id,
            BusinessMember.is_active.is_(True),
        )
    )).scalars().first()

    if member:
        profile = await db.get(Profile, member.user_id)
        if profile:
            email = profile.email

    if not email:
        if not business.contact_email:
            raise NotFoundError('No owner email found for this business')
        email = business.contact_email

    redirect_to = f'{settings.FRONTEND_URL}/auth/callback?type=invite'
    try:
        sb = _sb()
        try:
            res = sb.auth.admin.invite_user_by_email(email, {'redirect_to': redirect_to})
            if not member and res.user:
                from uuid import UUID as _UUID
                owner_uid = _UUID(str(res.user.id))
                if not await db.get(Profile, owner_uid):
                    from app.models.domain import Profile as _Profile
                    from app.models.enums import ProfileRole as _PR
                    db.add(_Profile(id=owner_uid, email=email, role=_PR.BUSINESS_OWNER))
                await db.flush()
                from app.models.domain import BusinessMember as _BM
                from app.models.enums import MemberRole as _MR
                db.add(_BM(business_id=business_id, user_id=owner_uid, role=_MR.OWNER, is_active=True))
                await db.commit()
        except Exception as invite_exc:
            if any(k in str(invite_exc).lower() for k in ('already registered', 'user already', 'already been')):
                sb.auth.sign_in_with_otp({
                    'email': email,
                    'options': {'email_redirect_to': redirect_to, 'should_create_user': False},
                })
                if not member:
                    existing_profile = (await db.execute(
                        select(Profile).where(Profile.email == email)
                    )).scalar_one_or_none()
                    if existing_profile:
                        from app.models.domain import BusinessMember as _BM
                        from app.models.enums import MemberRole as _MR
                        db.add(_BM(business_id=business_id, user_id=existing_profile.id, role=_MR.OWNER, is_active=True))
                        await db.commit()
            else:
                raise
    except Exception as exc:
        return APIResponse(data={'sent': False, 'error': str(exc)})

    await _log(db, user.id, 'invite_resent', business_id, {'email': email, 'business_name': business.name})
    await db.commit()
    return APIResponse(data={'sent': True, 'email': email})


@router.get('/businesses/{business_id}/form', response_model=APIResponse[dict])
async def get_business_form(business_id: UUID, user: AuthUser = Depends(require_super_admin), db: AsyncSession = Depends(get_db)):
    form = (await db.execute(select(Form).where(Form.business_id == business_id, Form.is_active.is_(True)))).scalars().first()
    if not form:
        raise NotFoundError('No active form for this business')
    return APIResponse(data={'id': str(form.id), 'slug': form.slug, 'title': form.title, 'description': form.description, 'success_message': form.success_message, 'services': form.services or []})

@router.patch('/businesses/{business_id}/form', response_model=APIResponse[dict])
async def update_business_form(business_id: UUID, payload: dict, user: AuthUser = Depends(require_super_admin), db: AsyncSession = Depends(get_db)):
    form = (await db.execute(select(Form).where(Form.business_id == business_id, Form.is_active.is_(True)))).scalars().first()
    if not form:
        raise NotFoundError('No active form for this business')
    if 'services' in payload:
        form.services = payload['services'] or None
    if 'title' in payload:
        form.title = payload['title']
    if 'description' in payload:
        form.description = payload['description'] or None
    if 'success_message' in payload:
        form.success_message = payload['success_message']
    await _log(db, user.id, 'form_updated', business_id, {'slug': form.slug})
    await db.commit()
    return APIResponse(data={'id': str(form.id), 'slug': form.slug, 'title': form.title, 'description': form.description, 'success_message': form.success_message, 'services': form.services or []})

@router.get('/audit-logs', response_model=APIResponse[list[dict]])
async def audit_logs(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    rows = (await db.execute(
        select(AuditLog, Profile.email)
        .outerjoin(Profile, AuditLog.actor_user_id == Profile.id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit).offset(offset)
    )).all()
    biz_ids = {r.AuditLog.business_id for r in rows if r.AuditLog.business_id}
    bizzes = {}
    if biz_ids:
        biz_rows = (await db.execute(select(Business).where(Business.id.in_(biz_ids)))).scalars().all()
        bizzes = {b.id: b.name for b in biz_rows}
    return APIResponse(data=[{
        'id': str(r.AuditLog.id),
        'action': r.AuditLog.action,
        'actor_email': r.email or 'System',
        'business_name': bizzes.get(r.AuditLog.business_id, '—') if r.AuditLog.business_id else '—',
        'details': r.AuditLog.details or {},
        'created_at': r.AuditLog.created_at.isoformat(),
    } for r in rows])


# ── Owners ───────────────────────────────────────────────────────────────────

@router.get('/owners', response_model=APIResponse[list[dict]])
async def list_owners(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(
        select(Profile, Business.name.label('biz_name'), Business.id.label('biz_id'),
               BusinessMember.role.label('mem_role'), BusinessMember.is_active.label('mem_active'))
        .outerjoin(BusinessMember, BusinessMember.user_id == Profile.id)
        .outerjoin(Business, Business.id == BusinessMember.business_id)
        .where(Profile.role == ProfileRole.BUSINESS_OWNER)
        .order_by(Profile.created_at.desc())
    )).all()
    return APIResponse(data=[{
        'id': str(r.Profile.id),
        'email': r.Profile.email,
        'full_name': r.Profile.full_name or '',
        'created_at': r.Profile.created_at.isoformat(),
        'business_name': r.biz_name,
        'business_id': str(r.biz_id) if r.biz_id else None,
        'member_role': str(r.mem_role) if r.mem_role else None,
        'is_active': r.mem_active if r.mem_active is not None else True,
    } for r in rows])


# ── Cross-business Leads ──────────────────────────────────────────────────────

@router.get('/leads', response_model=APIResponse[list[dict]])
async def admin_leads(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
    business_id: UUID | None = Query(None),
    status: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
):
    q = select(Lead, Business.name.label('biz_name')).join(Business, Business.id == Lead.business_id)
    if business_id:
        q = q.where(Lead.business_id == business_id)
    if status:
        try:
            q = q.where(Lead.status == LeadStatus(status))
        except ValueError:
            raise HTTPException(status_code=400, detail=f'Invalid status: {status}')
    q = q.order_by(Lead.created_at.desc()).limit(limit).offset(offset)
    rows = (await db.execute(q)).all()
    total = (await db.execute(select(func.count()).select_from(Lead))).scalar_one()
    return APIResponse(data=[{
        'id': str(r.Lead.id),
        'customer_name': r.Lead.customer_name,
        'customer_email': r.Lead.customer_email,
        'customer_phone': r.Lead.customer_phone,
        'service_needed': r.Lead.service_needed,
        'status': str(r.Lead.status),
        'source': r.Lead.source,
        'business_name': r.biz_name,
        'business_id': str(r.Lead.business_id),
        'created_at': r.Lead.created_at.isoformat(),
    } for r in rows], meta={'total': total})


# ── Automations ───────────────────────────────────────────────────────────────

class AutomationUpdate(BaseModel):
    smart_auto_reply: bool | None = None
    owner_approval_required: bool | None = None

@router.get('/automations', response_model=APIResponse[list[dict]])
async def list_automations(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    biz_rows = (await db.execute(
        select(Business).where(Business.status != BusinessStatus.ARCHIVED).order_by(Business.name)
    )).scalars().all()
    biz_ids = [b.id for b in biz_rows]
    forms_map: dict = {}
    if biz_ids:
        frows = (await db.execute(select(Form).where(Form.business_id.in_(biz_ids)))).scalars().all()
        forms_map = {f.business_id: f for f in frows}
    lead_counts_rows = (await db.execute(
        select(Lead.business_id, func.count(Lead.id).label('cnt'))
        .where(Lead.business_id.in_(biz_ids))
        .group_by(Lead.business_id)
    )).all()
    lead_counts = {r.business_id: r.cnt for r in lead_counts_rows}
    return APIResponse(data=[{
        'business_id': str(b.id),
        'business_name': b.name,
        'business_status': str(b.status),
        'smart_auto_reply': b.smart_auto_reply,
        'owner_approval_required': b.owner_approval_required,
        'form_active': forms_map[b.id].is_active if b.id in forms_map else False,
        'lead_count': lead_counts.get(b.id, 0),
    } for b in biz_rows])

@router.patch('/automations/{business_id}', response_model=APIResponse[dict])
async def update_automation(
    business_id: UUID,
    payload: AutomationUpdate,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    biz = await db.get(Business, business_id)
    if not biz:
        raise NotFoundError('Business not found')
    changed = {}
    if payload.smart_auto_reply is not None:
        biz.smart_auto_reply = payload.smart_auto_reply
        changed['smart_auto_reply'] = payload.smart_auto_reply
    if payload.owner_approval_required is not None:
        biz.owner_approval_required = payload.owner_approval_required
        changed['owner_approval_required'] = payload.owner_approval_required
    if changed:
        await _log(db, user.id, 'automation_updated', biz.id, {'fields': list(changed.keys()), 'name': biz.name})
        await db.commit()
        await db.refresh(biz)
    return APIResponse(data={
        'business_id': str(biz.id),
        'smart_auto_reply': biz.smart_auto_reply,
        'owner_approval_required': biz.owner_approval_required,
    })


# ── Emails ────────────────────────────────────────────────────────────────────

@router.get('/emails', response_model=APIResponse[list[dict]])
async def admin_emails(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
    status: str | None = Query(None),
    limit: int = Query(100, le=500),
):
    q = (select(EmailEvent, Business.name.label('biz_name'), Lead.customer_name.label('lead_name'))
         .outerjoin(Business, Business.id == EmailEvent.business_id)
         .outerjoin(Lead, Lead.id == EmailEvent.lead_id))
    if status:
        q = q.where(cast(EmailEvent.status, func.text('text')) == status)
    q = q.order_by(EmailEvent.created_at.desc()).limit(limit)
    rows = (await db.execute(q)).all()
    total_sent = (await db.execute(
        select(func.count()).select_from(EmailEvent).where(EmailEvent.status == EmailStatus.SENT)
    )).scalar_one()
    total_failed = (await db.execute(
        select(func.count()).select_from(EmailEvent).where(EmailEvent.status == EmailStatus.FAILED)
    )).scalar_one()
    return APIResponse(data=[{
        'id': str(r.EmailEvent.id),
        'to_email': r.EmailEvent.to_email,
        'from_email': r.EmailEvent.from_email,
        'subject': r.EmailEvent.subject,
        'status': str(r.EmailEvent.status),
        'provider': r.EmailEvent.provider,
        'error_message': r.EmailEvent.error_message,
        'business_name': r.biz_name or '—',
        'lead_name': r.lead_name or '—',
        'created_at': r.EmailEvent.created_at.isoformat(),
    } for r in rows], meta={'total_sent': total_sent, 'total_failed': total_failed})


# ── Platform Settings ─────────────────────────────────────────────────────────

@router.get('/settings', response_model=APIResponse[dict])
async def admin_settings_get(
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    total_leads = (await db.execute(select(func.count()).select_from(Lead))).scalar_one()
    total_emails = (await db.execute(select(func.count()).select_from(EmailEvent))).scalar_one()
    emails_sent = (await db.execute(
        select(func.count()).select_from(EmailEvent).where(EmailEvent.status == EmailStatus.SENT)
    )).scalar_one()
    total_biz = (await db.execute(select(func.count()).select_from(Business))).scalar_one()
    active_biz = (await db.execute(
        select(func.count()).select_from(Business).where(Business.status == BusinessStatus.ACTIVE)
    )).scalar_one()
    return APIResponse(data={
        'ai_model': settings.DEEPSEEK_MODEL,
        'email_provider': 'Resend',
        'resend_configured': bool(settings.RESEND_API_KEY),
        'deepseek_configured': bool(settings.DEEPSEEK_API_KEY),
        'resend_from': settings.RESEND_FROM_EMAIL,
        'platform_name': 'LeadFlow Pro',
        'total_businesses': total_biz,
        'active_businesses': active_biz,
        'total_leads': total_leads,
        'total_emails_sent': emails_sent,
        'emails_failed': total_emails - emails_sent,
    })

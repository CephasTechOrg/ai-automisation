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
from app.models.domain import Business, BusinessMember, Profile, Lead, AuditLog
from app.models.enums import BusinessStatus
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

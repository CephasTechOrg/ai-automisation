import time
from uuid import UUID
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.core.security import AuthUser, require_super_admin
from app.models.domain import Business, BusinessMember, Profile
from app.schemas.common import APIResponse
from app.schemas.business import BusinessCreate, BusinessUpdate, BusinessRead
from app.services.core_services import BusinessService

router = APIRouter()

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


@router.post('/businesses', response_model=APIResponse[dict])
async def create_business(
    payload: BusinessCreate,
    user: AuthUser = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    business, form = await BusinessService(db).create_business(payload, user.id)
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
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(business, field, value)
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

    return APIResponse(data={'sent': True, 'email': email})

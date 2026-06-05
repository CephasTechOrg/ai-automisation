from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.core.security import AuthUser, require_super_admin
from app.models.domain import Business, BusinessMember, Profile
from app.schemas.common import APIResponse
from app.schemas.business import BusinessCreate, BusinessRead
from app.services.core_services import BusinessService
router=APIRouter()
@router.post('/businesses',response_model=APIResponse[dict])
async def create_business(payload:BusinessCreate,user:AuthUser=Depends(require_super_admin),db:AsyncSession=Depends(get_db)):
    business,form=await BusinessService(db).create_business(payload,user.id); await db.commit(); return APIResponse(data={'business':BusinessRead.model_validate(business).model_dump(mode='json'),'form_link':f'/forms/{form.slug}'})
@router.get('/businesses',response_model=APIResponse[list[BusinessRead]])
async def businesses(user:AuthUser=Depends(require_super_admin),db:AsyncSession=Depends(get_db),limit:int=Query(50,le=100),offset:int=Query(0,ge=0)):
    rows=(await db.execute(select(Business).order_by(Business.created_at.desc()).limit(limit).offset(offset))).scalars().all(); return APIResponse(data=[BusinessRead.model_validate(x) for x in rows])
@router.post('/businesses/{business_id}/resend-invite',response_model=APIResponse[dict])
async def resend_invite(business_id:UUID,user:AuthUser=Depends(require_super_admin),db:AsyncSession=Depends(get_db)):
    business=await db.get(Business,business_id)
    if not business: raise NotFoundError('Business not found')
    # Try to get email from existing member profile first
    email=None
    member=(await db.execute(select(BusinessMember).where(BusinessMember.business_id==business_id,BusinessMember.is_active.is_(True)))).scalars().first()
    if member:
        profile=await db.get(Profile,member.user_id)
        if profile: email=profile.email
    # Fall back to business contact_email for businesses created before the member-creation fix
    if not email:
        if not business.contact_email: raise NotFoundError('No owner email found for this business')
        email=business.contact_email
    redirect_to=f'{settings.FRONTEND_URL}/auth/callback?type=invite'
    try:
        sb=create_client(settings.SUPABASE_URL,settings.SUPABASE_SERVICE_ROLE_KEY)
        try:
            res=sb.auth.admin.invite_user_by_email(email,{'redirect_to':redirect_to})
            # New user — create profile + member from invite response
            if not member and res.user:
                from uuid import UUID as _UUID
                owner_uid=_UUID(str(res.user.id))
                if not await db.get(Profile,owner_uid):
                    from app.models.domain import Profile as _Profile
                    from app.models.enums import ProfileRole as _PR
                    db.add(_Profile(id=owner_uid,email=email,role=_PR.BUSINESS_OWNER))
                await db.flush()
                from app.models.domain import BusinessMember as _BM
                from app.models.enums import MemberRole as _MR
                db.add(_BM(business_id=business_id,user_id=owner_uid,role=_MR.OWNER,is_active=True))
                await db.commit()
        except Exception as invite_exc:
            # User already exists in Supabase but never set a password —
            # send a magic link (OTP) so they can authenticate and reach /auth/set-password
            if any(k in str(invite_exc).lower() for k in ('already registered','user already','already been')):
                sb.auth.sign_in_with_otp({'email':email,'options':{'email_redirect_to':redirect_to,'should_create_user':False}})
                # Ensure BusinessMember row exists — look up Profile by email in our DB
                if not member:
                    existing_profile=(await db.execute(select(Profile).where(Profile.email==email))).scalar_one_or_none()
                    if existing_profile:
                        from app.models.domain import BusinessMember as _BM
                        from app.models.enums import MemberRole as _MR
                        db.add(_BM(business_id=business_id,user_id=existing_profile.id,role=_MR.OWNER,is_active=True))
                        await db.commit()
            else:
                raise
    except Exception as exc:
        return APIResponse(data={'sent':False,'error':str(exc)})
    return APIResponse(data={'sent':True,'email':email})

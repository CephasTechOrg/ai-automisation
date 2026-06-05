from dataclasses import dataclass
from uuid import UUID
import jwt
from jwt import PyJWKClient
from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.errors import UnauthorizedError, ForbiddenError
from app.models.domain import Profile, BusinessMember
from app.models.enums import ProfileRole
@dataclass(frozen=True)
class AuthUser: id:UUID; email:str|None; claims:dict
_jwks=PyJWKClient(settings.SUPABASE_JWKS_URL)
async def get_current_user(authorization:str|None=Header(default=None))->AuthUser:
    if not authorization or not authorization.lower().startswith('bearer '): raise UnauthorizedError('Missing bearer token')
    token=authorization.split(' ',1)[1]
    try: claims=jwt.decode(token,_jwks.get_signing_key_from_jwt(token).key,algorithms=['RS256','HS256'],audience=settings.SUPABASE_JWT_AUDIENCE,options={'verify_exp':True})
    except Exception as exc: raise UnauthorizedError('Invalid or expired Supabase token') from exc
    return AuthUser(id=UUID(claims['sub']),email=claims.get('email'),claims=claims)
async def require_super_admin(user:AuthUser=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    profile=await db.get(Profile,user.id)
    if not profile or profile.role!=ProfileRole.SUPER_ADMIN: raise ForbiddenError('Super admin access required')
    return user
async def require_owner_or_staff(user:AuthUser=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    m=(await db.execute(select(BusinessMember).where(BusinessMember.user_id==user.id,BusinessMember.is_active.is_(True)))).scalar_one_or_none()
    if not m: raise ForbiddenError('Business membership required')
    return user

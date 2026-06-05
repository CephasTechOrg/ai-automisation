from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import AuthUser, require_super_admin
from app.models.domain import Business
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

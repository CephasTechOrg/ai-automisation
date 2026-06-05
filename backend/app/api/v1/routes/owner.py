from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.errors import NotFoundError, ForbiddenError
from app.core.security import AuthUser, require_owner_or_staff
from app.models.domain import BusinessMember, Lead, Message
from app.schemas.common import APIResponse
from app.schemas.lead import LeadRead, LeadStatusUpdate
router=APIRouter()
async def business_id(db,user_id):
    m=(await db.execute(select(BusinessMember).where(BusinessMember.user_id==user_id,BusinessMember.is_active.is_(True)))).scalar_one(); return m.business_id
@router.get('/leads',response_model=APIResponse[list[LeadRead]])
async def leads(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db),limit:int=Query(50,le=100),offset:int=Query(0,ge=0)):
    bid=await business_id(db,user.id); rows=(await db.execute(select(Lead).where(Lead.business_id==bid).order_by(Lead.created_at.desc()).limit(limit).offset(offset))).scalars().all(); return APIResponse(data=[LeadRead.model_validate(x) for x in rows])
@router.patch('/leads/{lead_id}/status',response_model=APIResponse[LeadRead])
async def status(lead_id:UUID,payload:LeadStatusUpdate,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    lead=await db.get(Lead,lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id != await business_id(db,user.id): raise ForbiddenError('Wrong business')
    lead.status=payload.status; await db.commit(); return APIResponse(data=LeadRead.model_validate(lead))
@router.get('/leads/{lead_id}/messages')
async def messages(lead_id:UUID,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    lead=await db.get(Lead,lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id != await business_id(db,user.id): raise ForbiddenError('Wrong business')
    rows=(await db.execute(select(Message).where(Message.lead_id==lead_id).order_by(Message.created_at.asc()))).scalars().all(); return APIResponse(data=[{'id':str(x.id),'type':x.message_type,'direction':x.direction,'content':x.content,'created_at':x.created_at.isoformat()} for x in rows])

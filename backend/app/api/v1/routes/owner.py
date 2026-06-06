from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.errors import NotFoundError, ForbiddenError
from app.core.security import AuthUser, require_owner_or_staff
from app.models.domain import BusinessMember, Lead, Message, Form, Business, MessageDirection, MessageChannel, MessageType
from app.schemas.common import APIResponse
from app.schemas.lead import LeadRead, LeadStatusUpdate, OwnerReplyCreate
from app.models.domain import AIOutput
from app.schemas.business import BusinessRead, OwnerBusinessUpdate
router=APIRouter()
async def get_membership(db,user_id):
    m=(await db.execute(select(BusinessMember).where(BusinessMember.user_id==user_id,BusinessMember.is_active.is_(True)))).scalar_one_or_none()
    if not m: raise ForbiddenError('No active business membership found')
    return m
async def business_id(db,user_id):
    return (await get_membership(db,user_id)).business_id
@router.get('/leads',response_model=APIResponse[list[LeadRead]])
async def leads(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db),limit:int=Query(50,le=100),offset:int=Query(0,ge=0)):
    bid=await business_id(db,user.id); rows=(await db.execute(select(Lead).where(Lead.business_id==bid).order_by(Lead.created_at.desc()).limit(limit).offset(offset))).scalars().all(); return APIResponse(data=[LeadRead.model_validate(x) for x in rows])
@router.get('/leads/{lead_id}',response_model=APIResponse[dict])
async def lead_detail(lead_id:UUID,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    lead=await db.get(Lead,lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id!=bid: raise ForbiddenError('Wrong business')
    ai=(await db.execute(select(AIOutput).where(AIOutput.lead_id==lead_id))).scalars().first()
    return APIResponse(data={'lead':LeadRead.model_validate(lead).model_dump(mode='json'),'ai':ai.structured_output if ai else None})
@router.post('/leads/{lead_id}/messages',response_model=APIResponse[dict])
async def send_reply(lead_id:UUID,payload:OwnerReplyCreate,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    lead=await db.get(Lead,lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id!=bid: raise ForbiddenError('Wrong business')
    msg=Message(lead_id=lead_id,business_id=bid,direction=MessageDirection.OUTBOUND,channel=MessageChannel.EMAIL,message_type=MessageType.OWNER_REPLY,content=payload.content)
    db.add(msg); await db.commit(); await db.refresh(msg)
    return APIResponse(data={'id':str(msg.id),'type':msg.message_type.value,'direction':msg.direction.value,'content':msg.content,'created_at':msg.created_at.isoformat()})
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
@router.get('/business',response_model=APIResponse[BusinessRead])
async def owner_business(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    b=await db.get(Business,bid)
    if not b: raise NotFoundError('Business not found')
    return APIResponse(data=BusinessRead.model_validate(b))
@router.patch('/business',response_model=APIResponse[BusinessRead])
async def update_owner_business(payload:OwnerBusinessUpdate,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    b=await db.get(Business,bid)
    if not b: raise NotFoundError('Business not found')
    for k,v in payload.model_dump(exclude_unset=True).items():
        setattr(b,k,v)
    await db.commit(); await db.refresh(b)
    return APIResponse(data=BusinessRead.model_validate(b))
@router.get('/form',response_model=APIResponse[dict])
async def owner_form(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    form=(await db.execute(select(Form).where(Form.business_id==bid,Form.is_active.is_(True)))).scalars().first()
    if not form: raise NotFoundError('No active form found for this business')
    return APIResponse(data={'form_id':str(form.id),'slug':form.slug,'title':form.title,'is_active':form.is_active})

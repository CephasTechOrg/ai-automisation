from uuid import UUID
from datetime import date, timedelta, datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.errors import NotFoundError, ForbiddenError
from app.core.security import AuthUser, require_owner_or_staff
from app.models.domain import BusinessMember, Lead, Message, Form, Business, MessageDirection, MessageChannel, MessageType, FollowUp, AIOutput
from app.models.enums import FollowUpStatus
from app.schemas.common import APIResponse
from app.schemas.lead import LeadRead, LeadStatusUpdate, OwnerReplyCreate
from app.schemas.business import BusinessRead, OwnerBusinessUpdate
from app.services.core_services import EmailService
from app.services.email_templates import owner_reply_html, followup_html

class FollowUpUpdate(BaseModel):
    status: str | None = None
    scheduled_at: datetime | None = None

class OwnerFormUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=180)
    description: str | None = Field(None, max_length=600)
    success_message: str | None = Field(None, max_length=600)
    services: list[str] | None = None
    is_active: bool | None = None
    slug: str | None = Field(None, min_length=2, max_length=220, pattern=r'^[a-z0-9][a-z0-9-]*[a-z0-9]$')
router=APIRouter()
async def get_membership(db,user_id):
    m=(await db.execute(select(BusinessMember).where(BusinessMember.user_id==user_id,BusinessMember.is_active.is_(True)))).scalar_one_or_none()
    if not m: raise ForbiddenError('No active business membership found')
    return m
async def business_id(db,user_id):
    return (await get_membership(db,user_id)).business_id
@router.get('/leads',response_model=APIResponse[list[LeadRead]])
async def leads(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db),limit:int=Query(50,le=100),offset:int=Query(0,ge=0)):
    bid=await business_id(db,user.id)
    rows=(await db.execute(select(Lead).where(Lead.business_id==bid).order_by(Lead.created_at.desc()).limit(limit).offset(offset))).scalars().all()
    auto_ids=set(r[0] for r in (await db.execute(select(Message.lead_id).where(Message.business_id==bid,Message.message_type==MessageType.AUTO_REPLY).distinct())).all())
    owner_ids=set(r[0] for r in (await db.execute(select(Message.lead_id).where(Message.business_id==bid,Message.message_type==MessageType.OWNER_REPLY).distinct())).all())
    result=[]
    for row in rows:
        lr=LeadRead.model_validate(row)
        cs='ai_replied' if row.id in auto_ids else ('owner_replied' if row.id in owner_ids else 'acknowledged')
        result.append(lr.model_copy(update={'comm_status':cs}))
    return APIResponse(data=result)
@router.get('/leads/{lead_id}',response_model=APIResponse[dict])
async def lead_detail(lead_id:UUID,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    lead=await db.get(Lead,lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id!=bid: raise ForbiddenError('Wrong business')
    ai=(await db.execute(select(AIOutput).where(AIOutput.lead_id==lead_id))).scalars().first()
    auto_sent=(await db.execute(select(Message.id).where(Message.lead_id==lead_id,Message.message_type==MessageType.AUTO_REPLY).limit(1))).scalar_one_or_none() is not None
    return APIResponse(data={'lead':LeadRead.model_validate(lead).model_dump(mode='json'),'ai':ai.structured_output if ai else None,'auto_sent':auto_sent})
@router.post('/leads/{lead_id}/messages',response_model=APIResponse[dict])
async def send_reply(lead_id:UUID,payload:OwnerReplyCreate,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    lead=await db.get(Lead,lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id!=bid: raise ForbiddenError('Wrong business')
    msg=Message(lead_id=lead_id,business_id=bid,direction=MessageDirection.OUTBOUND,channel=MessageChannel.EMAIL,message_type=MessageType.OWNER_REPLY,content=payload.content)
    db.add(msg)
    await db.flush()
    if lead.customer_email:
        business=await db.get(Business,bid)
        html=owner_reply_html(business.name,lead.customer_name,payload.content,business.brand_color)
        subject=f"Re: Your {lead.service_needed or 'service'} request — {business.name}"
        await EmailService(db).send(lead.customer_email,subject,html,business_id=bid,lead_id=lead_id,from_name=business.name)
    await db.commit()
    await db.refresh(msg)
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
@router.get('/metrics',response_model=APIResponse[list[dict]])
async def owner_metrics(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    today=date.today(); start=today-timedelta(days=13)
    rows=(await db.execute(
        select(cast(Lead.created_at,Date).label('day'),func.count().label('cnt'))
        .where(Lead.business_id==bid, cast(Lead.created_at,Date)>=start)
        .group_by('day').order_by('day')
    )).all()
    counts={r.day:r.cnt for r in rows}
    data=[{'label':(start+timedelta(days=i)).strftime('%b %-d'),'v':counts.get(start+timedelta(days=i),0)} for i in range(14)]
    return APIResponse(data=data)
@router.get('/followups',response_model=APIResponse[list[dict]])
async def list_followups(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    now=datetime.now(timezone.utc)
    rows=(await db.execute(
        select(FollowUp,Lead.customer_name,Lead.service_needed,Lead.status.label('lead_status'))
        .join(Lead,FollowUp.lead_id==Lead.id)
        .where(FollowUp.business_id==bid)
        .order_by(FollowUp.scheduled_at.asc())
    )).all()
    result=[]
    for r in rows:
        fu=r.FollowUp
        if fu.status==FollowUpStatus.SCHEDULED:
            if fu.scheduled_at<now: state='overdue' if (now-fu.scheduled_at).total_seconds()>86400 else 'due'
            else: state='scheduled'
        else: state=fu.status.value
        result.append({'id':str(fu.id),'lead_id':str(fu.lead_id),'customer_name':r.customer_name,'service_needed':r.service_needed,'lead_status':r.lead_status,'state':state,'scheduled_at':fu.scheduled_at.isoformat(),'sent_at':fu.sent_at.isoformat() if fu.sent_at else None,'subject':fu.subject,'content':fu.content})
    return APIResponse(data=result)

@router.patch('/followups/{followup_id}',response_model=APIResponse[dict])
async def update_followup(followup_id:UUID,payload:FollowUpUpdate,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    fu=await db.get(FollowUp,followup_id)
    if not fu: raise NotFoundError('Follow-up not found')
    if fu.business_id!=bid: raise ForbiddenError('Wrong business')
    if payload.status:
        if payload.status not in [s.value for s in FollowUpStatus]: raise ForbiddenError('Invalid status')
        fu.status=FollowUpStatus(payload.status)
        if payload.status=='sent':
            fu.sent_at=datetime.now(timezone.utc)
            lead=await db.get(Lead,fu.lead_id)
            if lead and lead.customer_email:
                business=await db.get(Business,bid)
                content=fu.content or f'Hi {lead.customer_name}, just following up on your recent request. Are you still interested?'
                html=followup_html(business.name,lead.customer_name,content,business.brand_color)
                subject=fu.subject or f'Following up — {business.name}'
                await EmailService(db).send(lead.customer_email,subject,html,business_id=bid,lead_id=lead.id,from_name=business.name)
    if payload.scheduled_at: fu.scheduled_at=payload.scheduled_at
    await db.commit()
    return APIResponse(data={'id':str(fu.id),'status':fu.status.value,'scheduled_at':fu.scheduled_at.isoformat(),'sent_at':fu.sent_at.isoformat() if fu.sent_at else None})

def _form_dict(form) -> dict:
    return {'form_id':str(form.id),'slug':form.slug,'title':form.title,'description':form.description,'success_message':form.success_message,'services':form.services,'is_active':form.is_active}

@router.get('/form',response_model=APIResponse[dict])
async def owner_form(user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    form=(await db.execute(select(Form).where(Form.business_id==bid))).scalars().first()
    if not form: raise NotFoundError('No form found for this business')
    return APIResponse(data=_form_dict(form))

@router.patch('/form',response_model=APIResponse[dict])
async def update_owner_form(payload:OwnerFormUpdate,user:AuthUser=Depends(require_owner_or_staff),db:AsyncSession=Depends(get_db)):
    bid=await business_id(db,user.id)
    form=(await db.execute(select(Form).where(Form.business_id==bid))).scalars().first()
    if not form: raise NotFoundError('No form found for this business')
    if payload.slug and payload.slug!=form.slug:
        taken=(await db.execute(select(Form.id).where(Form.slug==payload.slug,Form.id!=form.id).limit(1))).scalar_one_or_none()
        if taken: raise HTTPException(status_code=409,detail='That URL is already in use by another form. Choose a different one.')
        form.slug=payload.slug
    for k,v in payload.model_dump(exclude_unset=True,exclude={'slug'}).items():
        setattr(form,k,v)
    await db.commit(); await db.refresh(form)
    return APIResponse(data=_form_dict(form))

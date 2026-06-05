from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.core.limiter import limiter
from app.core.config import settings
from app.models.domain import Form, Business
from app.schemas.common import APIResponse
from app.schemas.form import PublicFormRead, PublicLeadSubmit
from app.schemas.lead import LeadRead
from app.services.core_services import LeadWorkflowService
router=APIRouter()
@router.get('/forms/{slug}',response_model=APIResponse[PublicFormRead])
async def get_form(slug:str,db:AsyncSession=Depends(get_db)):
    form=(await db.execute(select(Form).where(Form.slug==slug,Form.is_active.is_(True)))).scalar_one_or_none()
    if not form: raise NotFoundError('Form not found')
    b=await db.get(Business,form.business_id)
    return APIResponse(data=PublicFormRead(form_id=form.id,business_id=b.id,business_name=b.name,business_slug=b.slug,logo_url=b.logo_url,brand_color=b.brand_color,title=form.title,description=form.description,success_message=form.success_message))
@router.post('/forms/{slug}/submit',response_model=APIResponse[dict])
@limiter.limit(lambda:f'{settings.PUBLIC_FORM_RATE_LIMIT_PER_MINUTE}/minute')
async def submit(request:Request,slug:str,payload:PublicLeadSubmit,db:AsyncSession=Depends(get_db)):
    result=await LeadWorkflowService(db).submit(slug,payload)
    if not result: raise NotFoundError('Form not found')
    lead,form,business=result; await db.commit(); return APIResponse(data={'lead':LeadRead.model_validate(lead).model_dump(mode='json'),'message':form.success_message})

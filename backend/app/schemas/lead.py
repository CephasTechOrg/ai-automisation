from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from app.models.enums import LeadStatus
class LeadRead(BaseModel):
    id:UUID; business_id:UUID; customer_name:str; customer_email:str|None; customer_phone:str|None; service_needed:str|None; preferred_time:str|None; message:str|None; status:str; source:str; created_at:datetime
    model_config={'from_attributes':True}
class LeadStatusUpdate(BaseModel): status:LeadStatus
class OwnerReplyCreate(BaseModel): content: str = Field(min_length=1, max_length=5000)

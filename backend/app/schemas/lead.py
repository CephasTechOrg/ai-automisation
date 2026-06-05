from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.enums import LeadStatus
class LeadRead(BaseModel):
    id:UUID; business_id:UUID; customer_name:str; customer_email:str|None; customer_phone:str|None; service_needed:str|None; preferred_time:str|None; message:str|None; status:str; source:str; created_at:datetime
    model_config={'from_attributes':True}
class LeadStatusUpdate(BaseModel): status:LeadStatus

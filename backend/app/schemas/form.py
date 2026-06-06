from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
class PublicFormRead(BaseModel): form_id:UUID; business_id:UUID; business_name:str; business_slug:str; logo_url:str|None; brand_color:str; title:str; description:str|None; success_message:str; services:list[str]|None=None
class PublicLeadSubmit(BaseModel): customer_name:str=Field(min_length=2,max_length=160); customer_email:EmailStr|None=None; customer_phone:str|None=None; service_needed:str|None=None; preferred_time:str|None=None; message:str|None=Field(default=None,max_length=3000); custom_fields:dict|None=None

from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from app.models.enums import BusinessStatus

class OwnerInviteCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = None

class BusinessCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    industry: str | None = None
    phone: str | None = None
    contact_email: EmailStr | None = None
    address: str | None = None
    brand_color: str = '#2563EB'
    owner: OwnerInviteCreate

class OwnerBusinessUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=180)
    contact_email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    brand_color: str | None = None
    smart_auto_reply: bool | None = None
    owner_approval_required: bool | None = None

class BusinessUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=180)
    industry: str | None = None
    phone: str | None = None
    contact_email: EmailStr | None = None
    address: str | None = None
    brand_color: str | None = None
    status: BusinessStatus | None = None
    smart_auto_reply: bool | None = None
    owner_approval_required: bool | None = None

class BusinessRead(BaseModel):
    id: UUID
    name: str
    slug: str
    industry: str | None
    phone: str | None
    contact_email: str | None
    address: str | None
    brand_color: str
    status: str
    logo_url: str | None
    smart_auto_reply: bool
    owner_approval_required: bool
    created_at: datetime
    model_config = {'from_attributes': True}

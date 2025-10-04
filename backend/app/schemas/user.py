from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.db.models import UserRole
from app.schemas.profile import (
    StudentProfileCreate, 
    FacultyProfileCreate, 
    IndustryProfileCreate, 
    ProfileRead, 
    IndustryProfileRead,
    ProfileUpdate,
    IndustryProfileUpdate
)


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole
    college_id: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    university: Optional[str] = Field(None, max_length=255)
    
    # Role-specific profile data
    student_profile: Optional[StudentProfileCreate] = None
    faculty_profile: Optional[FacultyProfileCreate] = None
    industry_profile: Optional[IndustryProfileCreate] = None


class UserRead(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str]
    university: Optional[str]
    college_id: Optional[str]
    email_verified: bool
    is_active: bool
    created_at: datetime
    
    # Role-specific profile data
    profile: Optional[ProfileRead] = None
    industry_profile: Optional[IndustryProfileRead] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    university: Optional[str] = Field(None, max_length=255)
    college_id: Optional[str] = None
    is_active: Optional[bool] = None
    
    # Role-specific profile updates
    profile: Optional[ProfileUpdate] = None
    industry_profile: Optional[IndustryProfileUpdate] = None

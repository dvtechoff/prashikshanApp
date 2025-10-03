from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.db.models import UserRole


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole
    college_id: Optional[str] = None


class UserRead(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    college_id: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    college_id: Optional[str] = None

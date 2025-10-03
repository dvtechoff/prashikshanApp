from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CreditBase(BaseModel):
    student_id: str = Field(..., description="Student receiving the credits")
    internship_id: str = Field(..., description="Internship the credit is associated with")
    credits_awarded: int = Field(..., ge=0)


class CreditCreate(CreditBase):
    faculty_signed_at: Optional[datetime] = None


class CreditUpdate(BaseModel):
    credits_awarded: Optional[int] = Field(default=None, ge=0)
    faculty_signed_at: Optional[datetime] = None


class CreditRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    student_id: str
    internship_id: str
    credits_awarded: int
    faculty_signed_at: Optional[datetime]

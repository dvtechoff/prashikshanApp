from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ApplicationDecision(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# Minimal nested schemas for student and internship info
class StudentInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    email: str


class InternshipInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    remote: bool = False
    stipend: Optional[int] = None
    duration_weeks: Optional[int] = None
    credits: Optional[int] = None
    start_date: Optional[datetime] = None
    status: str = "OPEN"


class ApplicationBase(BaseModel):
    internship_id: str = Field(..., description="Internship to apply for")
    resume_snapshot_url: Optional[str] = Field(default=None, max_length=512)


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    resume_snapshot_url: Optional[str] = Field(default=None, max_length=512)
    industry_status: Optional[ApplicationDecision] = None
    faculty_status: Optional[ApplicationDecision] = None


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    internship_id: str
    student_id: str
    applied_at: datetime
    industry_status: ApplicationDecision
    faculty_status: ApplicationDecision
    resume_snapshot_url: Optional[str]
    
    # Nested relations
    student: Optional[StudentInfo] = None
    internship: Optional[InternshipInfo] = None

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class InternshipBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    stipend: Optional[float] = Field(default=None, ge=0)
    location: Optional[str] = Field(default=None, max_length=255)
    remote: bool = False
    start_date: Optional[date] = None
    duration_weeks: Optional[int] = Field(default=None, ge=0)
    credits: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default="OPEN", max_length=50)


class InternshipCreate(InternshipBase):
    pass


class InternshipUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    skills: Optional[List[str]] = None
    stipend: Optional[float] = Field(default=None, ge=0)
    location: Optional[str] = Field(default=None, max_length=255)
    remote: Optional[bool] = None
    start_date: Optional[date] = None
    duration_weeks: Optional[int] = Field(default=None, ge=0)
    credits: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, max_length=50)


class InternshipRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str]
    skills: Optional[List[str]]
    stipend: Optional[float]
    location: Optional[str]
    remote: bool
    start_date: Optional[date]
    duration_weeks: Optional[int]
    credits: Optional[int]
    status: str
    posted_by: str
    created_at: datetime

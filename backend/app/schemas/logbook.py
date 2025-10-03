from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class Attachment(BaseModel):
    name: str = Field(..., max_length=255)
    url: str = Field(..., max_length=512)


class LogbookEntryBase(BaseModel):
    application_id: str = Field(..., description="Application linked to this logbook entry")
    entry_date: date
    hours: float = Field(..., gt=0)
    description: str = Field(..., min_length=1)
    attachments: Optional[List[Attachment]] = None


class LogbookEntryCreate(LogbookEntryBase):
    pass


class LogbookEntryUpdate(BaseModel):
    entry_date: Optional[date] = None
    hours: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = Field(default=None, min_length=1)
    attachments: Optional[List[Attachment]] = None
    approved: Optional[bool] = None
    faculty_comments: Optional[str] = Field(default=None, max_length=1000)


class LogbookEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    application_id: str
    student_id: str
    entry_date: date
    hours: float
    description: str
    attachments: Optional[List[Attachment]]
    faculty_comments: Optional[str]
    approved: bool
    created_at: datetime

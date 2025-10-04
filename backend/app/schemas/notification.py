from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    body: Optional[str] = None
    payload: Optional[dict] = None


class NotificationCreate(NotificationBase):
    user_id: str = Field(..., description="Target user to receive the notification")


class NotificationBulkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    body: Optional[str] = None
    payload: Optional[dict] = None
    target_role: Optional[str] = Field(None, description="Send to all users of this role (STUDENT, FACULTY, INDUSTRY)")
    user_ids: Optional[list[str]] = Field(None, description="Send to specific user IDs")


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    body: Optional[str]
    payload: Optional[dict]
    read: bool
    created_at: datetime


class NotificationUpdate(BaseModel):
    read: Optional[bool] = None

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ReportCreate(BaseModel):
    application_id: str = Field(..., description="Application associated with the report")
    pdf_url: HttpUrl


class ReportUpdate(BaseModel):
    pdf_url: Optional[HttpUrl] = None


class ReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    application_id: str
    pdf_url: HttpUrl
    generated_at: datetime
    qr_code_token: str

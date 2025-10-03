from typing import Optional

from pydantic import BaseModel, Field


class CollegeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    address: Optional[str] = None
    coordinator_user_id: Optional[str] = None


class CollegeCreate(CollegeBase):
    pass


class CollegeRead(CollegeBase):
    id: str

    model_config = {
        "from_attributes": True,
    }

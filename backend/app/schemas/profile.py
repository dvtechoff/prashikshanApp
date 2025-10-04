from typing import Optional, List

from pydantic import BaseModel, Field, HttpUrl, field_validator, ConfigDict


class StudentProfileCreate(BaseModel):
    """Student-specific profile fields for signup"""
    phone: Optional[str] = Field(None, max_length=20)
    university: Optional[str] = Field(None, max_length=255)
    college: Optional[str] = Field(None, max_length=255)
    enrollment_no: Optional[str] = Field(None, max_length=100)
    course: Optional[str] = Field(None, max_length=255)
    year: Optional[str] = Field(None, max_length=50)
    skills: Optional[List[str]] = None
    
    @field_validator('skills', mode='before')
    @classmethod
    def validate_skills(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return [s.strip() for s in v.split(',') if s.strip()]
        return v


class ProfileRead(BaseModel):
    """Profile data for reading (Student/Faculty)"""
    user_id: str
    college: Optional[str] = None
    enrollment_no: Optional[str] = None
    course: Optional[str] = None
    year: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    faculty_id: Optional[str] = None
    skills: Optional[dict] = None
    resume_url: Optional[str] = None
    verified: bool = False
    
    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    """Profile data for updating"""
    college: Optional[str] = Field(None, max_length=255)
    enrollment_no: Optional[str] = Field(None, max_length=100)
    course: Optional[str] = Field(None, max_length=255)
    year: Optional[str] = Field(None, max_length=50)
    designation: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=255)
    faculty_id: Optional[str] = Field(None, max_length=100)
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = Field(None, max_length=512)
    
    @field_validator('skills', mode='before')
    @classmethod
    def validate_skills(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return [s.strip() for s in v.split(',') if s.strip()]
        return v


class FacultyProfileCreate(BaseModel):
    """Faculty-specific profile fields for signup"""
    phone: str = Field(..., min_length=10, max_length=20)
    university: Optional[str] = Field(None, max_length=255)
    college: Optional[str] = Field(None, max_length=255)
    designation: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=255)
    faculty_id: Optional[str] = Field(None, max_length=100)


class IndustryProfileCreate(BaseModel):
    """Industry-specific profile fields for signup"""
    company_name: str = Field(..., min_length=2, max_length=255)
    company_website: Optional[str] = Field(None, max_length=255)
    contact_person_name: str = Field(..., min_length=2, max_length=255)
    contact_number: str = Field(..., min_length=10, max_length=20)
    designation: Optional[str] = Field(None, max_length=255)
    company_address: Optional[str] = Field(None, max_length=512)
    
    @field_validator('company_website')
    @classmethod
    def validate_website(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            return f'https://{v}'
        return v


class IndustryProfileRead(BaseModel):
    """Industry profile data for reading"""
    user_id: str
    company_name: str
    company_website: Optional[str] = None
    contact_person_name: str
    contact_number: str
    designation: Optional[str] = None
    company_address: Optional[str] = None
    verified: bool = False
    
    model_config = ConfigDict(from_attributes=True)


class IndustryProfileUpdate(BaseModel):
    """Industry profile data for updating"""
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    company_website: Optional[str] = Field(None, max_length=255)
    contact_person_name: Optional[str] = Field(None, min_length=2, max_length=255)
    contact_number: Optional[str] = Field(None, min_length=10, max_length=20)
    designation: Optional[str] = Field(None, max_length=255)
    company_address: Optional[str] = Field(None, max_length=512)
    
    @field_validator('company_website')
    @classmethod
    def validate_website(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            return f'https://{v}'
        return v

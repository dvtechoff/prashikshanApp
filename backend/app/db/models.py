import uuid
from datetime import datetime, date
from enum import Enum
from typing import List, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import GUID, JSONType


class UserRole(str, Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    INDUSTRY = "INDUSTRY"
    ADMIN = "ADMIN"


class College(Base):
    __tablename__ = "colleges"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    coordinator_user_id: Mapped[Optional[str]] = mapped_column(
        GUID, sa.ForeignKey("users.id"), nullable=True
    )

    coordinator: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="coordinator_for_college",
        foreign_keys=[coordinator_user_id],
    )
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="college",
        foreign_keys="User.college_id",
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    email: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(sa.Enum(UserRole, name="userrole"), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(20), nullable=True)
    university: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    college_id: Mapped[Optional[str]] = mapped_column(GUID, sa.ForeignKey("colleges.id"), nullable=True)
    email_verified: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    college: Mapped[Optional[College]] = relationship(
        "College",
        back_populates="users",
        foreign_keys=[college_id],
    )
    coordinator_for_college: Mapped[Optional[College]] = relationship(
        "College",
        back_populates="coordinator",
        foreign_keys="College.coordinator_user_id",
        uselist=False,
    )
    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False)
    industry_profile: Mapped[Optional["IndustryProfile"]] = relationship(
        "IndustryProfile", back_populates="user", uselist=False
    )


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"), primary_key=True)
    college: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    enrollment_no: Mapped[Optional[str]] = mapped_column(sa.String(100))
    course: Mapped[Optional[str]] = mapped_column(sa.String(255))
    year: Mapped[Optional[str]] = mapped_column(sa.String(50))
    designation: Mapped[Optional[str]] = mapped_column(sa.String(255))
    department: Mapped[Optional[str]] = mapped_column(sa.String(255))
    faculty_id: Mapped[Optional[str]] = mapped_column(sa.String(100))
    skills: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    resume_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    verified: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="profile")


class IndustryProfile(Base):
    __tablename__ = "industry_profiles"

    user_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"), primary_key=True)
    company_name: Mapped[str] = mapped_column(sa.String(255))
    company_website: Mapped[Optional[str]] = mapped_column(sa.String(255))
    contact_person_name: Mapped[str] = mapped_column(sa.String(255))
    contact_number: Mapped[str] = mapped_column(sa.String(20))
    designation: Mapped[Optional[str]] = mapped_column(sa.String(255))
    company_address: Mapped[Optional[str]] = mapped_column(sa.String(512))
    verified: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="industry_profile")


class Internship(Base):
    __tablename__ = "internships"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text)
    skills: Mapped[Optional[dict]] = mapped_column(JSONType)
    stipend: Mapped[Optional[float]] = mapped_column(sa.Numeric(10, 2))
    location: Mapped[Optional[str]] = mapped_column(sa.String(255))
    remote: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date)
    duration_weeks: Mapped[Optional[int]] = mapped_column(sa.Integer)
    credits: Mapped[Optional[int]] = mapped_column(sa.Integer)
    posted_by: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(sa.String(50), default="OPEN", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    internship_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("internships.id"))
    student_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"))
    applied_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    industry_status: Mapped[str] = mapped_column(sa.String(50), default="PENDING", nullable=False)
    faculty_status: Mapped[str] = mapped_column(sa.String(50), default="PENDING", nullable=False)
    resume_snapshot_url: Mapped[Optional[str]] = mapped_column(sa.String(512))


class LogbookEntry(Base):
    __tablename__ = "logbook_entries"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    application_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("applications.id"))
    student_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"))
    entry_date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    hours: Mapped[float] = mapped_column(sa.Float, nullable=False)
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)
    attachments: Mapped[Optional[dict]] = mapped_column(JSONType)
    faculty_comments: Mapped[Optional[str]] = mapped_column(sa.Text)
    approved: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )


class Credit(Base):
    __tablename__ = "credits"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    student_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"))
    internship_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("internships.id"))
    credits_awarded: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    faculty_signed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True))


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    application_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("applications.id"), nullable=False)
    pdf_url: Mapped[str] = mapped_column(sa.String(512), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    qr_code_token: Mapped[str] = mapped_column(sa.String(255), unique=True, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(GUID, sa.ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(sa.Text)
    payload: Mapped[Optional[dict]] = mapped_column(JSONType)
    read: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[str]] = mapped_column(GUID, sa.ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    target_type: Mapped[Optional[str]] = mapped_column(sa.String(255))
    target_id: Mapped[Optional[str]] = mapped_column(sa.String(255))
    meta: Mapped[Optional[dict]] = mapped_column(JSONType)
    timestamp: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

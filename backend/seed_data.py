"""Seed the database with demo data covering all roles and features.

Usage:
  # From backend dir with venv active
  python seed_data.py

Idempotent: running again updates existing rows (matched by name/email keys) without duplicating.
"""
import asyncio
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.security import get_password_hash
from app.db import models
from app.db.session import AsyncSessionLocal


async def upsert_college(session, *, name: str, address: str | None, coordinator_user_id: str | None):
    result = await session.execute(select(models.College).where(models.College.name == name))
    college = result.scalars().first()
    if college is None:
        college = models.College(name=name, address=address, coordinator_user_id=coordinator_user_id)
        session.add(college)
    else:
        college.address = address
        college.coordinator_user_id = coordinator_user_id or college.coordinator_user_id
    await session.commit()
    await session.refresh(college)
    return college


async def upsert_user(
    session,
    *,
    email: str,
    name: str,
    password: str,
    role: models.UserRole,
    phone: str | None = None,
    university: str | None = None,
    college_id: str | None = None,
    is_active: bool = True,
    email_verified: bool = True,
):
    result = await session.execute(select(models.User).where(models.User.email == email.lower()))
    user = result.scalars().first()
    if user is None:
        user = models.User(
            name=name,
            email=email.lower(),
            role=role,
            password_hash=get_password_hash(password),
            phone=phone,
            university=university,
            college_id=college_id,
            is_active=is_active,
            email_verified=email_verified,
        )
        session.add(user)
    else:
        user.name = name
        user.role = role
        user.password_hash = get_password_hash(password)
        user.phone = phone
        user.university = university
        user.college_id = college_id
        user.is_active = is_active
        user.email_verified = email_verified
    await session.commit()
    await session.refresh(user)
    return user


async def upsert_profile(session, *, user_id: str, data: dict):
    profile = await session.get(models.Profile, user_id)
    if profile is None:
        profile = models.Profile(user_id=user_id, **data)
        session.add(profile)
    else:
        for field, value in data.items():
            setattr(profile, field, value)
    await session.commit()
    await session.refresh(profile)
    return profile


async def upsert_industry_profile(session, *, user_id: str, data: dict):
    profile = await session.get(models.IndustryProfile, user_id)
    if profile is None:
        profile = models.IndustryProfile(user_id=user_id, **data)
        session.add(profile)
    else:
        for field, value in data.items():
            setattr(profile, field, value)
    await session.commit()
    await session.refresh(profile)
    return profile


async def upsert_internship(session, *, title: str, posted_by: str, **fields):
    result = await session.execute(
        select(models.Internship).where(models.Internship.title == title, models.Internship.posted_by == posted_by)
    )
    internship = result.scalars().first()
    if internship is None:
        internship = models.Internship(title=title, posted_by=posted_by, **fields)
        session.add(internship)
    else:
        for field, value in fields.items():
            setattr(internship, field, value)
    await session.commit()
    await session.refresh(internship)
    return internship


async def upsert_application(session, *, internship_id: str, student_id: str, **fields):
    result = await session.execute(
        select(models.Application).where(
            models.Application.internship_id == internship_id, models.Application.student_id == student_id
        )
    )
    application = result.scalars().first()
    if application is None:
        application = models.Application(internship_id=internship_id, student_id=student_id, **fields)
        session.add(application)
    else:
        for field, value in fields.items():
            setattr(application, field, value)
    await session.commit()
    await session.refresh(application)
    return application


async def upsert_logbook_entry(session, *, application_id: str, student_id: str, entry_date: date, description: str, **fields):
    result = await session.execute(
        select(models.LogbookEntry).where(
            models.LogbookEntry.application_id == application_id,
            models.LogbookEntry.student_id == student_id,
            models.LogbookEntry.entry_date == entry_date,
            models.LogbookEntry.description == description,
        )
    )
    entry = result.scalars().first()
    if entry is None:
        entry = models.LogbookEntry(
            application_id=application_id,
            student_id=student_id,
            entry_date=entry_date,
            description=description,
            **fields,
        )
        session.add(entry)
    else:
        for field, value in fields.items():
            setattr(entry, field, value)
    await session.commit()
    await session.refresh(entry)
    return entry


async def upsert_credit(session, *, student_id: str, internship_id: str, credits_awarded: int, faculty_signed_at: datetime | None):
    result = await session.execute(
        select(models.Credit).where(
            models.Credit.student_id == student_id, models.Credit.internship_id == internship_id
        )
    )
    credit = result.scalars().first()
    if credit is None:
        credit = models.Credit(
            student_id=student_id,
            internship_id=internship_id,
            credits_awarded=credits_awarded,
            faculty_signed_at=faculty_signed_at,
        )
        session.add(credit)
    else:
        credit.credits_awarded = credits_awarded
        credit.faculty_signed_at = faculty_signed_at
    await session.commit()
    await session.refresh(credit)
    return credit


async def upsert_report(session, *, application_id: str, pdf_url: str, qr_code_token: str):
    result = await session.execute(
        select(models.Report).where(models.Report.application_id == application_id)
    )
    report = result.scalars().first()
    if report is None:
        report = models.Report(application_id=application_id, pdf_url=pdf_url, qr_code_token=qr_code_token)
        session.add(report)
    else:
        report.pdf_url = pdf_url
        report.qr_code_token = qr_code_token
    await session.commit()
    await session.refresh(report)
    return report


async def upsert_notification(session, *, user_id: str, title: str, body: str, payload: dict | None = None):
    result = await session.execute(
        select(models.Notification).where(
            models.Notification.user_id == user_id, models.Notification.title == title, models.Notification.body == body
        )
    )
    note = result.scalars().first()
    if note is None:
        note = models.Notification(user_id=user_id, title=title, body=body, payload=payload)
        session.add(note)
    else:
        note.payload = payload
    await session.commit()
    await session.refresh(note)
    return note


async def upsert_audit_log(session, *, user_id: str | None, action: str, target_type: str | None, target_id: str | None, meta: dict | None):
    result = await session.execute(
        select(models.AuditLog).where(
            models.AuditLog.user_id == user_id,
            models.AuditLog.action == action,
            models.AuditLog.target_type == target_type,
            models.AuditLog.target_id == target_id,
        )
    )
    log = result.scalars().first()
    if log is None:
        log = models.AuditLog(user_id=user_id, action=action, target_type=target_type, target_id=target_id, meta=meta)
        session.add(log)
    else:
        log.meta = meta
    await session.commit()
    await session.refresh(log)
    return log


async def seed():
    async with AsyncSessionLocal() as session:
        try:
            college_alpha = await upsert_college(
                session,
                name="Alpha Engineering College",
                address="123 Alpha St, Tech City",
                coordinator_user_id=None,
            )
            college_beta = await upsert_college(
                session,
                name="Beta Institute of Technology",
                address="456 Beta Ave, Innovation Park",
                coordinator_user_id=None,
            )

            admin = await upsert_user(
                session,
                email="admin@prashikshan.com",
                name="Platform Admin",
                password="admin@123",
                role=models.UserRole.ADMIN,
            )

            faculty_active = await upsert_user(
                session,
                email="faculty.active@prashikshan.com",
                name="Dr. Active Faculty",
                password="Password123!",
                role=models.UserRole.FACULTY,
                university="Alpha University",
                college_id=college_alpha.id,
                is_active=True,
                email_verified=True,
            )
            await upsert_profile(
                session,
                user_id=faculty_active.id,
                data={
                    "college": "Alpha Engineering College",
                    "designation": "Professor",
                    "department": "Computer Science",
                    "faculty_id": "FAC-001",
                    "verified": True,
                },
            )

            faculty_pending = await upsert_user(
                session,
                email="faculty.pending@prashikshan.com",
                name="Dr. Pending Faculty",
                password="Password123!",
                role=models.UserRole.FACULTY,
                university="Beta University",
                college_id=college_beta.id,
                is_active=False,
                email_verified=False,
            )
            await upsert_profile(
                session,
                user_id=faculty_pending.id,
                data={
                    "college": "Beta Institute of Technology",
                    "designation": "Assistant Professor",
                    "department": "Electronics",
                    "faculty_id": "FAC-002",
                    "verified": False,
                },
            )

            industry_verified = await upsert_user(
                session,
                email="industry.verified@prashikshan.com",
                name="InnovaTech HR",
                password="Password123!",
                role=models.UserRole.INDUSTRY,
                phone="+1-555-1234",
                is_active=True,
                email_verified=True,
            )
            await upsert_industry_profile(
                session,
                user_id=industry_verified.id,
                data={
                    "company_name": "InnovaTech Solutions",
                    "company_website": "https://innovatech.example.com",
                    "contact_person_name": "Alex HR",
                    "contact_number": "+1-555-1234",
                    "designation": "HR Manager",
                    "company_address": "789 Innovation Blvd, Suite 100",
                    "verified": True,
                },
            )

            industry_pending = await upsert_user(
                session,
                email="industry.pending@prashikshan.com",
                name="FutureWorks Talent",
                password="Password123!",
                role=models.UserRole.INDUSTRY,
                phone="+1-555-5678",
                is_active=False,
                email_verified=False,
            )
            await upsert_industry_profile(
                session,
                user_id=industry_pending.id,
                data={
                    "company_name": "FutureWorks Labs",
                    "company_website": "https://futureworks.example.com",
                    "contact_person_name": "Taylor Recruiter",
                    "contact_number": "+1-555-5678",
                    "designation": "Recruiter",
                    "company_address": "321 Future Rd, Floor 5",
                    "verified": False,
                },
            )

            student_anna = await upsert_user(
                session,
                email="anna.student@prashikshan.com",
                name="Anna Student",
                password="Password123!",
                role=models.UserRole.STUDENT,
                university="Alpha University",
                college_id=college_alpha.id,
            )
            await upsert_profile(
                session,
                user_id=student_anna.id,
                data={
                    "college": "Alpha Engineering College",
                    "enrollment_no": "ALPHA-2021-001",
                    "course": "B.Tech CSE",
                    "year": "3",
                    "skills": {"skills": ["Python", "FastAPI", "SQL"]},
                    "verified": True,
                },
            )

            student_ben = await upsert_user(
                session,
                email="ben.student@prashikshan.com",
                name="Ben Student",
                password="Password123!",
                role=models.UserRole.STUDENT,
                university="Alpha University",
                college_id=college_alpha.id,
            )
            await upsert_profile(
                session,
                user_id=student_ben.id,
                data={
                    "college": "Alpha Engineering College",
                    "enrollment_no": "ALPHA-2021-002",
                    "course": "B.Tech CSE",
                    "year": "3",
                    "skills": {"skills": ["React", "Node", "Docker"]},
                    "verified": True,
                },
            )

            student_cara = await upsert_user(
                session,
                email="cara.student@prashikshan.com",
                name="Cara Student",
                password="Password123!",
                role=models.UserRole.STUDENT,
                university="Beta University",
                college_id=college_beta.id,
            )
            await upsert_profile(
                session,
                user_id=student_cara.id,
                data={
                    "college": "Beta Institute of Technology",
                    "enrollment_no": "BETA-2022-003",
                    "course": "B.Tech ECE",
                    "year": "2",
                    "skills": {"skills": ["Embedded", "C", "MATLAB"]},
                    "verified": False,
                },
            )

            student_david = await upsert_user(
                session,
                email="david.student@prashikshan.com",
                name="David Student",
                password="Password123!",
                role=models.UserRole.STUDENT,
                university="Alpha University",
                college_id=college_alpha.id,
            )
            await upsert_profile(
                session,
                user_id=student_david.id,
                data={
                    "college": "Alpha Engineering College",
                    "enrollment_no": "ALPHA-2021-004",
                    "course": "B.Tech CSE",
                    "year": "4",
                    "skills": {"skills": ["DevOps", "CI/CD", "Docker"]},
                    "verified": True,
                },
            )

            student_eva = await upsert_user(
                session,
                email="eva.student@prashikshan.com",
                name="Eva Student",
                password="Password123!",
                role=models.UserRole.STUDENT,
                university="Beta University",
                college_id=college_beta.id,
            )
            await upsert_profile(
                session,
                user_id=student_eva.id,
                data={
                    "college": "Beta Institute of Technology",
                    "enrollment_no": "BETA-2022-005",
                    "course": "B.Tech IT",
                    "year": "2",
                    "skills": {"skills": ["UI/UX", "Figma", "HTML/CSS"]},
                    "verified": False,
                },
            )

            # Set coordinators after faculty creation
            college_alpha.coordinator_user_id = faculty_active.id
            college_beta.coordinator_user_id = faculty_pending.id
            await session.commit()

            internship_ai = await upsert_internship(
                session,
                title="AI Research Internship",
                posted_by=industry_verified.id,
                description="Work on NLP pipelines and deploy microservices.",
                skills=["Python", "FastAPI", "Transformers"],
                stipend=15000,
                location="Remote",
                remote=True,
                start_date=date.today() + timedelta(days=15),
                duration_weeks=12,
                credits=4,
                status="OPEN",
            )

            internship_iot = await upsert_internship(
                session,
                title="IoT Device Internship",
                posted_by=industry_pending.id,
                description="Prototype device firmware and dashboards.",
                skills=["Embedded", "C", "MQTT"],
                stipend=12000,
                location="Tech City",
                remote=False,
                start_date=date.today() + timedelta(days=30),
                duration_weeks=16,
                credits=3,
                status="OPEN",
            )

            internship_running = await upsert_internship(
                session,
                title="Web Dashboard Revamp",
                posted_by=industry_verified.id,
                description="Refactor the frontend dashboard, build analytics widgets, and harden auth flows.",
                skills=["React", "TypeScript", "Tailwind", "API Integration"],
                stipend=14000,
                location="Hybrid - Tech City",
                remote=False,
                start_date=date.today() - timedelta(days=21),
                duration_weeks=10,
                credits=3,
                status="IN_PROGRESS",
            )

            internship_completed = await upsert_internship(
                session,
                title="Cloud Migration Sprint",
                posted_by=industry_verified.id,
                description="Migrate services to containers, set up CI, and deploy to cloud.",
                skills=["Docker", "CI/CD", "Postgres", "Monitoring"],
                stipend=16000,
                location="Remote",
                remote=True,
                start_date=date.today() - timedelta(days=120),
                duration_weeks=8,
                credits=4,
                status="COMPLETED",
            )

            app_anna_ai = await upsert_application(
                session,
                internship_id=internship_ai.id,
                student_id=student_anna.id,
                resume_snapshot_url="https://example.com/resumes/anna.pdf",
                industry_status="APPROVED",
                faculty_status="APPROVED",
            )

            app_ben_ai = await upsert_application(
                session,
                internship_id=internship_ai.id,
                student_id=student_ben.id,
                resume_snapshot_url="https://example.com/resumes/ben.pdf",
                industry_status="PENDING",
                faculty_status="PENDING",
            )

            app_cara_iot = await upsert_application(
                session,
                internship_id=internship_iot.id,
                student_id=student_cara.id,
                resume_snapshot_url="https://example.com/resumes/cara.pdf",
                industry_status="PENDING",
                faculty_status="PENDING",
            )

            app_david_ai = await upsert_application(
                session,
                internship_id=internship_ai.id,
                student_id=student_david.id,
                resume_snapshot_url="https://example.com/resumes/david.pdf",
                industry_status="APPROVED",
                faculty_status="APPROVED",
            )

            app_eva_iot = await upsert_application(
                session,
                internship_id=internship_iot.id,
                student_id=student_eva.id,
                resume_snapshot_url="https://example.com/resumes/eva.pdf",
                industry_status="PENDING",
                faculty_status="PENDING",
            )

            app_ben_running = await upsert_application(
                session,
                internship_id=internship_running.id,
                student_id=student_ben.id,
                resume_snapshot_url="https://example.com/resumes/ben-dashboard.pdf",
                industry_status="APPROVED",
                faculty_status="APPROVED",
            )

            app_cara_running = await upsert_application(
                session,
                internship_id=internship_running.id,
                student_id=student_cara.id,
                resume_snapshot_url="https://example.com/resumes/cara-dashboard.pdf",
                industry_status="PENDING",
                faculty_status="APPROVED",
            )

            app_anna_completed = await upsert_application(
                session,
                internship_id=internship_completed.id,
                student_id=student_anna.id,
                resume_snapshot_url="https://example.com/resumes/anna-cloud.pdf",
                industry_status="APPROVED",
                faculty_status="APPROVED",
            )

            await upsert_logbook_entry(
                session,
                application_id=app_anna_ai.id,
                student_id=student_anna.id,
                entry_date=date.today() - timedelta(days=7),
                hours=6.0,
                description="Set up data pipeline and trained baseline model",
                attachments={"links": ["https://example.com/work/anna-day1"]},
                faculty_comments="Great start",
                approved=True,
            )
            await upsert_logbook_entry(
                session,
                application_id=app_anna_ai.id,
                student_id=student_anna.id,
                entry_date=date.today() - timedelta(days=5),
                hours=5.0,
                description="Implemented inference service and unit tests",
                attachments=None,
                faculty_comments="Approved",
                approved=True,
            )

            await upsert_logbook_entry(
                session,
                application_id=app_anna_ai.id,
                student_id=student_anna.id,
                entry_date=date.today() - timedelta(days=3),
                hours=4.0,
                description="Optimized model inference and updated docs",
                attachments=None,
                faculty_comments="Nice optimization",
                approved=True,
            )

            await upsert_logbook_entry(
                session,
                application_id=app_david_ai.id,
                student_id=student_david.id,
                entry_date=date.today() - timedelta(days=2),
                hours=5.0,
                description="Set up CI pipeline and Dockerized microservices",
                attachments={"links": ["https://example.com/work/david-ci"]},
                faculty_comments="Good DevOps hygiene",
                approved=True,
            )

            await upsert_credit(
                session,
                student_id=student_anna.id,
                internship_id=internship_ai.id,
                credits_awarded=4,
                faculty_signed_at=datetime.now(timezone.utc),
            )

            await upsert_credit(
                session,
                student_id=student_david.id,
                internship_id=internship_ai.id,
                credits_awarded=3,
                faculty_signed_at=datetime.now(timezone.utc),
            )

            # Running internship logbooks
            await upsert_logbook_entry(
                session,
                application_id=app_ben_running.id,
                student_id=student_ben.id,
                entry_date=date.today() - timedelta(days=3),
                hours=4.5,
                description="Built analytics widget with charting library and API integration",
                attachments={"links": ["https://example.com/work/ben-dashboard"]},
                faculty_comments="Looks good, keep iterating",
                approved=True,
            )
            await upsert_logbook_entry(
                session,
                application_id=app_cara_running.id,
                student_id=student_cara.id,
                entry_date=date.today() - timedelta(days=2),
                hours=3.5,
                description="Drafted responsive layout and accessibility fixes",
                attachments=None,
                faculty_comments="Pending review",
                approved=False,
            )

            await upsert_logbook_entry(
                session,
                application_id=app_cara_running.id,
                student_id=student_cara.id,
                entry_date=date.today() - timedelta(days=1),
                hours=3.0,
                description="Implemented feedback on layout and added tests",
                attachments=None,
                faculty_comments="Looks better",
                approved=True,
            )

            await upsert_logbook_entry(
                session,
                application_id=app_cara_iot.id,
                student_id=student_cara.id,
                entry_date=date.today() - timedelta(days=4),
                hours=2.5,
                description="Drafted sensor data parser for IoT device",
                attachments=None,
                faculty_comments="Pending industry review",
                approved=False,
            )

            await upsert_logbook_entry(
                session,
                application_id=app_cara_iot.id,
                student_id=student_cara.id,
                entry_date=date.today() - timedelta(days=2),
                hours=3.0,
                description="Integrated MQTT client and basic dashboard",
                attachments=None,
                faculty_comments="Awaiting approval",
                approved=False,
            )

            # Completed internship credits + report
            await upsert_credit(
                session,
                student_id=student_anna.id,
                internship_id=internship_completed.id,
                credits_awarded=4,
                faculty_signed_at=datetime.now(timezone.utc) - timedelta(days=30),
            )

            await upsert_report(
                session,
                application_id=app_anna_completed.id,
                pdf_url="https://example.com/reports/anna-cloud.pdf",
                qr_code_token=str(uuid.uuid4()),
            )

            await upsert_report(
                session,
                application_id=app_anna_ai.id,
                pdf_url="https://example.com/reports/anna-ai.pdf",
                qr_code_token=str(uuid.uuid4()),
            )

            await upsert_report(
                session,
                application_id=app_david_ai.id,
                pdf_url="https://example.com/reports/david-ai.pdf",
                qr_code_token=str(uuid.uuid4()),
            )

            await upsert_notification(
                session,
                user_id=student_anna.id,
                title="Application approved",
                body="Your AI Research Internship application was approved by industry and faculty.",
                payload={"application_id": app_anna_ai.id},
            )
            await upsert_notification(
                session,
                user_id=student_ben.id,
                title="Application received",
                body="Your AI Research Internship application is under review.",
                payload={"application_id": app_ben_ai.id},
            )
            await upsert_notification(
                session,
                user_id=faculty_active.id,
                title="New logbook entry",
                body="Anna submitted a new logbook entry for AI Research Internship.",
                payload={"application_id": app_anna_ai.id},
            )

            await upsert_notification(
                session,
                user_id=student_ben.id,
                title="Logbook feedback",
                body="Your dashboard widget entry was approved by faculty.",
                payload={"application_id": app_ben_running.id},
            )

            await upsert_notification(
                session,
                user_id=student_anna.id,
                title="Internship completed",
                body="Cloud Migration Sprint marked as completed and credits awarded.",
                payload={"internship_id": internship_completed.id},
            )

            await upsert_notification(
                session,
                user_id=student_david.id,
                title="Credits awarded",
                body="You received credits for AI Research Internship.",
                payload={"internship_id": internship_ai.id},
            )

            await upsert_notification(
                session,
                user_id=student_cara.id,
                title="Logbook pending",
                body="Your IoT logbook entries await approval.",
                payload={"application_id": app_cara_iot.id},
            )

            await upsert_audit_log(
                session,
                user_id=admin.id,
                action="seeded-demo-data",
                target_type="seed",
                target_id="demo",
                meta={"timestamp": datetime.now(timezone.utc).isoformat()},
            )

            print("Seed data inserted/updated successfully.")
            print("Users:")
            for u in [admin, faculty_active, faculty_pending, industry_verified, industry_pending, student_anna, student_ben, student_cara, student_david, student_eva]:
                print(f" - {u.role.value}: {u.name} ({u.email})")
        except IntegrityError as exc:
            await session.rollback()
            raise RuntimeError(f"Seeding failed: {exc}") from exc


def main():
    asyncio.run(seed())


if __name__ == "__main__":
    main()

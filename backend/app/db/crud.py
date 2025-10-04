from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db import models
from app.schemas.user import UserCreate
from app.schemas.college import CollegeCreate
from app.schemas.internship import InternshipCreate, InternshipUpdate
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.schemas.logbook import LogbookEntryCreate, LogbookEntryUpdate
from app.schemas.credit import CreditCreate, CreditUpdate
from app.schemas.report import ReportCreate, ReportUpdate


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[models.User]:
    result = await session.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()


async def get_user_by_id(session: AsyncSession, user_id: str) -> Optional[models.User]:
    return await session.get(models.User, user_id)


async def create_user(session: AsyncSession, user_in: UserCreate) -> models.User:
    user = models.User(
        name=user_in.name,
        email=user_in.email.lower(),
        role=user_in.role,
        password_hash=get_password_hash(user_in.password),
        phone=user_in.phone,
        university=user_in.university,
        college_id=user_in.college_id,
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise
    await session.refresh(user)
    
    # Create role-specific profile
    if user_in.role == models.UserRole.STUDENT and user_in.student_profile:
        profile = models.Profile(
            user_id=user.id,
            college=user_in.student_profile.college,
            enrollment_no=user_in.student_profile.enrollment_no,
            course=user_in.student_profile.course,
            year=user_in.student_profile.year,
            skills={"skills": user_in.student_profile.skills} if user_in.student_profile.skills else None,
        )
        session.add(profile)
    
    elif user_in.role == models.UserRole.FACULTY and user_in.faculty_profile:
        profile = models.Profile(
            user_id=user.id,
            college=user_in.faculty_profile.college,
            designation=user_in.faculty_profile.designation,
            department=user_in.faculty_profile.department,
            faculty_id=user_in.faculty_profile.faculty_id,
            verified=False,  # Faculty requires admin verification
        )
        session.add(profile)
    
    elif user_in.role == models.UserRole.INDUSTRY and user_in.industry_profile:
        industry_profile = models.IndustryProfile(
            user_id=user.id,
            company_name=user_in.industry_profile.company_name,
            company_website=user_in.industry_profile.company_website,
            contact_person_name=user_in.industry_profile.contact_person_name,
            contact_number=user_in.industry_profile.contact_number,
            designation=user_in.industry_profile.designation,
            company_address=user_in.industry_profile.company_address,
            verified=False,  # Industry requires admin verification
        )
        session.add(industry_profile)
    
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise
    
    return user


async def list_colleges(session: AsyncSession) -> List[models.College]:
    result = await session.execute(select(models.College).order_by(models.College.name))
    return list(result.scalars().all())


async def create_college(session: AsyncSession, college_in: CollegeCreate) -> models.College:
    college = models.College(
        name=college_in.name,
        address=college_in.address,
        coordinator_user_id=college_in.coordinator_user_id,
    )
    session.add(college)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise
    await session.refresh(college)
    return college


async def create_internship(
    session: AsyncSession, internship_in: InternshipCreate, posted_by: str
) -> models.Internship:
    internship = models.Internship(
        title=internship_in.title,
        description=internship_in.description,
        skills=internship_in.skills,
        stipend=internship_in.stipend,
        location=internship_in.location,
        remote=internship_in.remote,
        start_date=internship_in.start_date,
        duration_weeks=internship_in.duration_weeks,
        credits=internship_in.credits,
        status=internship_in.status or "OPEN",
        posted_by=posted_by,
    )
    session.add(internship)
    await session.commit()
    await session.refresh(internship)
    return internship


async def list_internships(
    session: AsyncSession,
    *,
    remote: Optional[bool] = None,
    min_credits: Optional[int] = None,
    location: Optional[str] = None,
    skills: Optional[List[str]] = None,
) -> List[models.Internship]:
    query = select(models.Internship).order_by(models.Internship.created_at.desc())

    if remote is not None:
        query = query.where(models.Internship.remote == remote)
    if min_credits is not None:
        query = query.where(models.Internship.credits >= min_credits)

    result = await session.execute(query)
    internships: List[models.Internship] = list(result.scalars().all())

    if skills:
        lowered = {skill.strip().lower() for skill in skills if skill.strip()}
        if lowered:
            internships = [
                internship
                for internship in internships
                if lowered.issubset({str(skill).lower() for skill in (internship.skills or [])})
            ]

    if location:
        location_term = location.strip().lower()
        if location_term:
            internships = [
                internship
                for internship in internships
                if internship.location and location_term in internship.location.lower()
            ]

    return internships


async def get_internship(session: AsyncSession, internship_id: str) -> Optional[models.Internship]:
    return await session.get(models.Internship, internship_id)


async def update_internship(
    session: AsyncSession, internship: models.Internship, internship_in: InternshipUpdate
) -> models.Internship:
    update_data = internship_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(internship, field, value)

    await session.commit()
    await session.refresh(internship)
    return internship


async def get_application_by_student_and_internship(
    session: AsyncSession, internship_id: str, student_id: str
) -> Optional[models.Application]:
    result = await session.execute(
        select(models.Application)
        .where(models.Application.internship_id == internship_id)
        .where(models.Application.student_id == student_id)
    )
    return result.scalars().first()


async def create_application(
    session: AsyncSession, application_in: ApplicationCreate, student_id: str
) -> models.Application:
    application = models.Application(
        internship_id=application_in.internship_id,
        student_id=student_id,
        resume_snapshot_url=application_in.resume_snapshot_url,
    )
    session.add(application)
    await session.commit()
    await session.refresh(application)
    return application


async def get_application(session: AsyncSession, application_id: str) -> Optional[models.Application]:
    return await session.get(models.Application, application_id)


async def list_applications_for_student(
    session: AsyncSession, student_id: str
) -> List[models.Application]:
    result = await session.execute(
        select(models.Application)
        .where(models.Application.student_id == student_id)
        .order_by(models.Application.applied_at.desc())
    )
    return list(result.scalars().all())


async def list_applications_for_industry(
    session: AsyncSession, industry_user_id: str
) -> List[models.Application]:
    result = await session.execute(
        select(models.Application)
        .join(models.Internship, models.Application.internship_id == models.Internship.id)
        .where(models.Internship.posted_by == industry_user_id)
        .order_by(models.Application.applied_at.desc())
    )
    return list(result.scalars().all())


async def list_applications(
    session: AsyncSession,
    *,
    internship_id: Optional[str] = None,
) -> List[models.Application]:
    query = select(models.Application).order_by(models.Application.applied_at.desc())
    if internship_id:
        query = query.where(models.Application.internship_id == internship_id)
    result = await session.execute(query)
    return list(result.scalars().unique().all())


async def update_application(
    session: AsyncSession,
    application: models.Application,
    application_in: ApplicationUpdate,
) -> models.Application:
    update_data = application_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)

    await session.commit()
    await session.refresh(application)
    return application


async def create_logbook_entry(
    session: AsyncSession,
    logbook_in: LogbookEntryCreate,
    student_id: str,
) -> models.LogbookEntry:
    data = logbook_in.model_dump()
    logbook_entry = models.LogbookEntry(student_id=student_id, **data)
    session.add(logbook_entry)
    await session.commit()
    await session.refresh(logbook_entry)
    return logbook_entry


async def get_logbook_entry(
    session: AsyncSession, logbook_entry_id: str
) -> Optional[models.LogbookEntry]:
    return await session.get(models.LogbookEntry, logbook_entry_id)


async def list_logbook_entries_for_student(
    session: AsyncSession,
    student_id: str,
    *,
    application_id: Optional[str] = None,
) -> List[models.LogbookEntry]:
    query = select(models.LogbookEntry).where(models.LogbookEntry.student_id == student_id)
    if application_id:
        query = query.where(models.LogbookEntry.application_id == application_id)
    query = query.order_by(models.LogbookEntry.entry_date.desc(), models.LogbookEntry.created_at.desc())
    result = await session.execute(query)
    return list(result.scalars().unique().all())


async def list_logbook_entries_for_application(
    session: AsyncSession,
    application_id: str,
) -> List[models.LogbookEntry]:
    result = await session.execute(
        select(models.LogbookEntry)
        .where(models.LogbookEntry.application_id == application_id)
        .order_by(models.LogbookEntry.entry_date.desc(), models.LogbookEntry.created_at.desc())
    )
    return list(result.scalars().all())


async def list_logbook_entries_for_industry(
    session: AsyncSession,
    industry_user_id: str,
    *,
    application_id: Optional[str] = None,
) -> List[models.LogbookEntry]:
    query = (
        select(models.LogbookEntry)
        .join(models.Application, models.LogbookEntry.application_id == models.Application.id)
        .join(models.Internship, models.Application.internship_id == models.Internship.id)
        .where(models.Internship.posted_by == industry_user_id)
    )
    if application_id:
        query = query.where(models.LogbookEntry.application_id == application_id)
    query = query.order_by(models.LogbookEntry.entry_date.desc(), models.LogbookEntry.created_at.desc())
    result = await session.execute(query)
    return list(result.scalars().unique().all())


async def list_logbook_entries(
    session: AsyncSession,
    *,
    application_id: Optional[str] = None,
) -> List[models.LogbookEntry]:
    query = select(models.LogbookEntry)
    if application_id:
        query = query.where(models.LogbookEntry.application_id == application_id)
    query = query.order_by(models.LogbookEntry.entry_date.desc(), models.LogbookEntry.created_at.desc())
    result = await session.execute(query)
    return list(result.scalars().unique().all())


async def update_logbook_entry(
    session: AsyncSession,
    logbook_entry: models.LogbookEntry,
    logbook_in: LogbookEntryUpdate,
) -> models.LogbookEntry:
    update_data = logbook_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(logbook_entry, field, value)

    await session.commit()
    await session.refresh(logbook_entry)
    return logbook_entry


async def get_credit_by_student_and_internship(
    session: AsyncSession,
    student_id: str,
    internship_id: str,
) -> Optional[models.Credit]:
    result = await session.execute(
        select(models.Credit)
        .where(models.Credit.student_id == student_id)
        .where(models.Credit.internship_id == internship_id)
    )
    return result.scalars().first()


async def create_credit(
    session: AsyncSession,
    credit_in: CreditCreate,
) -> models.Credit:
    credit = models.Credit(
        student_id=credit_in.student_id,
        internship_id=credit_in.internship_id,
        credits_awarded=credit_in.credits_awarded,
        faculty_signed_at=credit_in.faculty_signed_at,
    )
    session.add(credit)
    await session.commit()
    await session.refresh(credit)
    return credit


async def get_credit(session: AsyncSession, credit_id: str) -> Optional[models.Credit]:
    return await session.get(models.Credit, credit_id)


async def list_credits_for_student(
    session: AsyncSession,
    student_id: str,
) -> List[models.Credit]:
    result = await session.execute(
        select(models.Credit)
        .where(models.Credit.student_id == student_id)
        .order_by(
            models.Credit.faculty_signed_at.is_(None),
            models.Credit.faculty_signed_at.desc(),
            models.Credit.id,
        )
    )
    return list(result.scalars().all())


async def list_credits_for_industry(
    session: AsyncSession,
    industry_user_id: str,
) -> List[models.Credit]:
    result = await session.execute(
        select(models.Credit)
        .join(models.Internship, models.Credit.internship_id == models.Internship.id)
        .where(models.Internship.posted_by == industry_user_id)
        .order_by(
            models.Credit.faculty_signed_at.is_(None),
            models.Credit.faculty_signed_at.desc(),
            models.Credit.id,
        )
    )
    return list(result.scalars().all())


async def list_credits(
    session: AsyncSession,
    *,
    student_id: Optional[str] = None,
    internship_id: Optional[str] = None,
) -> List[models.Credit]:
    query = select(models.Credit)
    if student_id:
        query = query.where(models.Credit.student_id == student_id)
    if internship_id:
        query = query.where(models.Credit.internship_id == internship_id)
    query = query.order_by(
        models.Credit.faculty_signed_at.is_(None),
        models.Credit.faculty_signed_at.desc(),
        models.Credit.id,
    )
    result = await session.execute(query)
    return list(result.scalars().unique().all())


async def update_credit(
    session: AsyncSession,
    credit: models.Credit,
    credit_in: CreditUpdate,
) -> models.Credit:
    update_data = credit_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(credit, field, value)

    await session.commit()
    await session.refresh(credit)
    return credit


async def create_report(
    session: AsyncSession,
    report_in: ReportCreate,
    *,
    qr_code_token: str,
) -> models.Report:
    report = models.Report(
        application_id=report_in.application_id,
        pdf_url=str(report_in.pdf_url),
        qr_code_token=qr_code_token,
    )
    session.add(report)
    await session.commit()
    await session.refresh(report)
    return report


async def get_report(session: AsyncSession, report_id: str) -> Optional[models.Report]:
    return await session.get(models.Report, report_id)


async def list_reports_for_student(
    session: AsyncSession,
    student_id: str,
    *, 
    application_id: Optional[str] = None,
) -> List[models.Report]:
    query = (
        select(models.Report)
        .join(models.Application, models.Report.application_id == models.Application.id)
        .where(models.Application.student_id == student_id)
    )
    if application_id:
        query = query.where(models.Report.application_id == application_id)
    query = query.order_by(models.Report.generated_at.desc())
    result = await session.execute(query)
    return list(result.scalars().all())


async def list_reports_for_industry(
    session: AsyncSession,
    industry_user_id: str,
    *,
    student_id: Optional[str] = None,
    internship_id: Optional[str] = None,
    application_id: Optional[str] = None,
) -> List[models.Report]:
    query = (
        select(models.Report)
        .join(models.Application, models.Report.application_id == models.Application.id)
        .join(models.Internship, models.Application.internship_id == models.Internship.id)
        .where(models.Internship.posted_by == industry_user_id)
    )
    if student_id:
        query = query.where(models.Application.student_id == student_id)
    if internship_id:
        query = query.where(models.Application.internship_id == internship_id)
    if application_id:
        query = query.where(models.Report.application_id == application_id)
    query = query.order_by(models.Report.generated_at.desc())
    result = await session.execute(query)
    return list(result.scalars().all())


async def list_reports(
    session: AsyncSession,
    *,
    student_id: Optional[str] = None,
    internship_id: Optional[str] = None,
    application_id: Optional[str] = None,
) -> List[models.Report]:
    query = select(models.Report).join(
        models.Application, models.Report.application_id == models.Application.id
    )
    if student_id:
        query = query.where(models.Application.student_id == student_id)
    if internship_id:
        query = query.where(models.Application.internship_id == internship_id)
    if application_id:
        query = query.where(models.Report.application_id == application_id)
    query = query.order_by(models.Report.generated_at.desc())
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_report_by_token(session: AsyncSession, token: str) -> Optional[models.Report]:
    result = await session.execute(
        select(models.Report).where(models.Report.qr_code_token == token)
    )
    return result.scalars().first()


async def update_report(
    session: AsyncSession,
    report: models.Report,
    report_in: ReportUpdate,
) -> models.Report:
    update_data = report_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "pdf_url" and value is not None:
            setattr(report, field, str(value))
        else:
            setattr(report, field, value)

    await session.commit()
    await session.refresh(report)
    return report

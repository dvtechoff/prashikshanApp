import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, role_required
from app.db import crud, models
from app.schemas.report import ReportCreate, ReportRead, ReportUpdate

router = APIRouter(prefix="/reports", tags=["reports"])


def _generate_qr_token() -> str:
    return uuid.uuid4().hex


@router.post("", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_in: ReportCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.FACULTY, models.UserRole.ADMIN)),
) -> ReportRead:
    application = await crud.get_application(session, report_in.application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if application.industry_status != "APPROVED" or application.faculty_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application must be fully approved before generating a report",
        )

    report = await crud.create_report(session, report_in, qr_code_token=_generate_qr_token())
    return ReportRead.model_validate(report)


@router.get("", response_model=List[ReportRead])
async def list_reports(
    student_id: Optional[str] = Query(default=None, description="Filter by student ID"),
    internship_id: Optional[str] = Query(default=None, description="Filter by internship ID"),
    application_id: Optional[str] = Query(default=None, description="Filter by application ID"),
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[ReportRead]:
    if current_user.role == models.UserRole.STUDENT:
        reports = await crud.list_reports_for_student(
            session, current_user.id, application_id=application_id
        )
    elif current_user.role == models.UserRole.INDUSTRY:
        reports = await crud.list_reports_for_industry(
            session,
            current_user.id,
            student_id=student_id,
            internship_id=internship_id,
            application_id=application_id,
        )
    elif current_user.role in (models.UserRole.FACULTY, models.UserRole.ADMIN):
        reports = await crud.list_reports(
            session,
            student_id=student_id,
            internship_id=internship_id,
            application_id=application_id,
        )
    else:
        reports = []

    return [ReportRead.model_validate(report) for report in reports]


@router.get("/{report_id}", response_model=ReportRead)
async def get_report(
    report_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> ReportRead:
    report = await crud.get_report(session, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    application = await crud.get_application(session, report.application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if current_user.role == models.UserRole.STUDENT and application.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if current_user.role == models.UserRole.INDUSTRY:
        internship = await crud.get_internship(session, application.internship_id)
        if internship is None or internship.posted_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return ReportRead.model_validate(report)


@router.get("/qr/{qr_token}", response_model=ReportRead)
async def get_report_by_qr_token(
    qr_token: str,
    session: AsyncSession = Depends(get_db),
) -> ReportRead:
    report = await crud.get_report_by_token(session, qr_token)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return ReportRead.model_validate(report)


@router.patch("/{report_id}", response_model=ReportRead)
async def update_report(
    report_id: str,
    report_in: ReportUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.FACULTY, models.UserRole.ADMIN)),
) -> ReportRead:
    report = await crud.get_report(session, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    updated = await crud.update_report(session, report, report_in)
    return ReportRead.model_validate(updated)

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, role_required
from app.db import crud, models
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def apply_for_internship(
    application_in: ApplicationCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.STUDENT)),
) -> ApplicationRead:
    internship = await crud.get_internship(session, application_in.internship_id)
    if internship is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    if internship.status != "OPEN":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Internship is not open for applications")

    existing = await crud.get_application_by_student_and_internship(
        session, application_in.internship_id, current_user.id
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application already submitted")

    application = await crud.create_application(session, application_in, current_user.id)
    return ApplicationRead.model_validate(application)


@router.get("", response_model=List[ApplicationRead])
async def list_applications(
    internship_id: Optional[str] = Query(default=None, description="Filter applications for a specific internship"),
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[ApplicationRead]:
    if current_user.role == models.UserRole.STUDENT:
        applications = await crud.list_applications_for_student(session, current_user.id)
    elif current_user.role == models.UserRole.INDUSTRY:
        applications = await crud.list_applications_for_industry(session, current_user.id)
    else:
        applications = await crud.list_applications(session, internship_id=internship_id)

    if internship_id:
        applications = [app for app in applications if app.internship_id == internship_id]

    return [ApplicationRead.model_validate(application) for application in applications]


@router.get("/{application_id}", response_model=ApplicationRead)
async def get_application(
    application_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> ApplicationRead:
    application = await crud.get_application(session, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if current_user.role == models.UserRole.STUDENT and application.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if current_user.role == models.UserRole.INDUSTRY:
        internship = await crud.get_internship(session, application.internship_id)
        if internship is None or internship.posted_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return ApplicationRead.model_validate(application)


@router.patch("/{application_id}", response_model=ApplicationRead)
async def update_application(
    application_id: str,
    application_in: ApplicationUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> ApplicationRead:
    application = await crud.get_application(session, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    allowed_fields: List[str] = []

    if current_user.role == models.UserRole.STUDENT:
        if application.student_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        allowed_fields.append("resume_snapshot_url")
    elif current_user.role == models.UserRole.INDUSTRY:
        internship = await crud.get_internship(session, application.internship_id)
        if internship is None or internship.posted_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        allowed_fields.append("industry_status")
    elif current_user.role == models.UserRole.FACULTY:
        allowed_fields.append("faculty_status")
    elif current_user.role == models.UserRole.ADMIN:
        allowed_fields.extend(["resume_snapshot_url", "industry_status", "faculty_status"])
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    update_data = application_in.model_dump(exclude_unset=True)
    sanitized = {key: value for key, value in update_data.items() if key in allowed_fields}
    if not sanitized:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No permitted fields to update")

    updated = await crud.update_application(session, application, ApplicationUpdate(**sanitized))
    return ApplicationRead.model_validate(updated)

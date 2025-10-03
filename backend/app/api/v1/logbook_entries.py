from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, role_required
from app.db import crud, models
from app.schemas.logbook import LogbookEntryCreate, LogbookEntryRead, LogbookEntryUpdate

router = APIRouter(prefix="/logbook-entries", tags=["logbook"])


@router.post("", response_model=LogbookEntryRead, status_code=status.HTTP_201_CREATED)
async def create_logbook_entry(
    logbook_in: LogbookEntryCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.STUDENT)),
) -> LogbookEntryRead:
    application = await crud.get_application(session, logbook_in.application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot add entries to this application")
    if application.industry_status == "REJECTED" or application.faculty_status == "REJECTED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application is no longer active")

    entry = await crud.create_logbook_entry(session, logbook_in, current_user.id)
    return LogbookEntryRead.model_validate(entry)


@router.get("", response_model=List[LogbookEntryRead])
async def list_logbook_entries(
    application_id: Optional[str] = Query(default=None, description="Filter by application ID"),
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[LogbookEntryRead]:
    if current_user.role == models.UserRole.STUDENT:
        entries = await crud.list_logbook_entries_for_student(
            session, current_user.id, application_id=application_id
        )
    elif current_user.role == models.UserRole.INDUSTRY:
        entries = await crud.list_logbook_entries_for_industry(
            session, current_user.id, application_id=application_id
        )
    elif current_user.role in (models.UserRole.FACULTY, models.UserRole.ADMIN):
        entries = await crud.list_logbook_entries(session, application_id=application_id)
    else:
        entries = []

    return [LogbookEntryRead.model_validate(entry) for entry in entries]


@router.get("/{logbook_entry_id}", response_model=LogbookEntryRead)
async def get_logbook_entry(
    logbook_entry_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> LogbookEntryRead:
    entry = await crud.get_logbook_entry(session, logbook_entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Logbook entry not found")

    if current_user.role == models.UserRole.STUDENT and entry.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if current_user.role == models.UserRole.INDUSTRY:
        application = await crud.get_application(session, entry.application_id)
        internship = await crud.get_internship(session, application.internship_id) if application else None
        if internship is None or internship.posted_by != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return LogbookEntryRead.model_validate(entry)


@router.patch("/{logbook_entry_id}", response_model=LogbookEntryRead)
async def update_logbook_entry(
    logbook_entry_id: str,
    logbook_in: LogbookEntryUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> LogbookEntryRead:
    entry = await crud.get_logbook_entry(session, logbook_entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Logbook entry not found")

    allowed_fields: List[str] = []

    if current_user.role == models.UserRole.STUDENT:
        if entry.student_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        allowed_fields.extend(["entry_date", "hours", "description", "attachments"])
    elif current_user.role == models.UserRole.FACULTY:
        allowed_fields.extend(["approved", "faculty_comments"])
    elif current_user.role == models.UserRole.ADMIN:
        allowed_fields.extend(["entry_date", "hours", "description", "attachments", "approved", "faculty_comments"])
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    update_data = logbook_in.model_dump(exclude_unset=True)
    sanitized = {field: value for field, value in update_data.items() if field in allowed_fields}
    if not sanitized:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No permitted fields to update")

    updated = await crud.update_logbook_entry(session, entry, LogbookEntryUpdate(**sanitized))
    return LogbookEntryRead.model_validate(updated)

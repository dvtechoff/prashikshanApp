from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, role_required
from app.db import crud, models
from app.schemas.internship import InternshipCreate, InternshipRead, InternshipUpdate

router = APIRouter(prefix="/internships", tags=["internships"])


@router.get("", response_model=List[InternshipRead])
async def list_internships(
    skills: Optional[List[str]] = Query(
        default=None,
        description="Filter internships that include all provided skills",
    ),
    remote: Optional[bool] = Query(default=None, description="Filter by remote availability"),
    min_credits: Optional[int] = Query(
        default=None,
        ge=0,
        description="Only include internships with credits greater than or equal to this value",
    ),
    location: Optional[str] = Query(
        default=None,
        description="Case-insensitive match against internship location",
    ),
    status: Optional[str] = Query(
        default="OPEN",
        description="Filter by status (OPEN, CLOSED). Defaults to OPEN to show only active internships to students.",
    ),
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[InternshipRead]:
    # Default to OPEN for students, allow admins/industry to see all if they pass status=None
    filter_status = status
    if current_user.role == models.UserRole.STUDENT and status is None:
        filter_status = "OPEN"
    
    internships = await crud.list_internships(
        session,
        skills=skills,
        remote=remote,
        min_credits=min_credits,
        location=location,
        status=filter_status,
    )
    return [InternshipRead.model_validate(internship) for internship in internships]


@router.post(
    "",
    response_model=InternshipRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_internship(
    internship_in: InternshipCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.INDUSTRY, models.UserRole.ADMIN)),
) -> InternshipRead:
    internship = await crud.create_internship(session, internship_in, posted_by=current_user.id)
    return InternshipRead.model_validate(internship)


@router.get("/{internship_id}", response_model=InternshipRead)
async def get_internship(
    internship_id: str,
    session: AsyncSession = Depends(get_db),
) -> InternshipRead:
    internship = await crud.get_internship(session, internship_id)
    if internship is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")
    return InternshipRead.model_validate(internship)


@router.patch("/{internship_id}", response_model=InternshipRead)
async def update_internship(
    internship_id: str,
    internship_in: InternshipUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> InternshipRead:
    internship = await crud.get_internship(session, internship_id)
    if internship is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")

    if current_user.role not in (models.UserRole.ADMIN, models.UserRole.INDUSTRY):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if current_user.role == models.UserRole.INDUSTRY and internship.posted_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify another provider's posting")

    updated = await crud.update_internship(session, internship, internship_in)
    return InternshipRead.model_validate(updated)


@router.delete("/{internship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_internship(
    internship_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> None:
    internship = await crud.get_internship(session, internship_id)
    if internship is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Internship not found")

    if current_user.role not in (models.UserRole.ADMIN, models.UserRole.INDUSTRY):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if current_user.role == models.UserRole.INDUSTRY and internship.posted_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another provider's posting")

    await crud.delete_internship(session, internship)

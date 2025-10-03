from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, role_required
from app.db import crud, models
from app.schemas.credit import CreditCreate, CreditRead, CreditUpdate

router = APIRouter(prefix="/credits", tags=["credits"])


@router.post("", response_model=CreditRead, status_code=status.HTTP_201_CREATED)
async def award_credit(
    credit_in: CreditCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.FACULTY, models.UserRole.ADMIN)),
) -> CreditRead:
    application = await crud.get_application_by_student_and_internship(
        session, credit_in.internship_id, credit_in.student_id
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No application found for student")

    if application.industry_status != "APPROVED" or application.faculty_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application must be approved before awarding credits",
        )

    existing = await crud.get_credit_by_student_and_internship(
        session, credit_in.student_id, credit_in.internship_id
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Credits already awarded")

    credit = await crud.create_credit(session, credit_in)
    return CreditRead.model_validate(credit)


@router.get("", response_model=List[CreditRead])
async def list_credits(
    student_id: Optional[str] = Query(default=None, description="Filter by student ID (admin/faculty only)"),
    internship_id: Optional[str] = Query(default=None, description="Filter by internship ID"),
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[CreditRead]:
    if current_user.role == models.UserRole.STUDENT:
        credits = await crud.list_credits_for_student(session, current_user.id)
    elif current_user.role == models.UserRole.INDUSTRY:
        credits = await crud.list_credits_for_industry(session, current_user.id)
        if student_id:
            credits = [credit for credit in credits if credit.student_id == student_id]
        if internship_id:
            credits = [credit for credit in credits if credit.internship_id == internship_id]
    elif current_user.role in (models.UserRole.FACULTY, models.UserRole.ADMIN):
        credits = await crud.list_credits(
            session,
            student_id=student_id,
            internship_id=internship_id,
        )
    else:
        credits = []

    return [CreditRead.model_validate(credit) for credit in credits]


@router.get("/{credit_id}", response_model=CreditRead)
async def get_credit(
    credit_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> CreditRead:
    credit = await crud.get_credit(session, credit_id)
    if credit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")

    if current_user.role == models.UserRole.STUDENT and credit.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    if current_user.role == models.UserRole.INDUSTRY:
        internships = await crud.list_credits_for_industry(session, current_user.id)
        if credit_id not in {item.id for item in internships}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return CreditRead.model_validate(credit)


@router.patch("/{credit_id}", response_model=CreditRead)
async def update_credit(
    credit_id: str,
    credit_in: CreditUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(role_required(models.UserRole.FACULTY, models.UserRole.ADMIN)),
) -> CreditRead:
    credit = await crud.get_credit(session, credit_id)
    if credit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit not found")

    updated = await crud.update_credit(session, credit, credit_in)
    return CreditRead.model_validate(updated)

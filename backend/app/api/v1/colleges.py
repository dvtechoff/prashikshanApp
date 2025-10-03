from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, role_required
from app.db import crud, models
from app.schemas.college import CollegeCreate, CollegeRead

router = APIRouter(prefix="/colleges", tags=["colleges"])


@router.get("", response_model=List[CollegeRead])
async def list_colleges(session: AsyncSession = Depends(get_db)) -> List[CollegeRead]:
    colleges = await crud.list_colleges(session)
    return [CollegeRead.model_validate(college) for college in colleges]


@router.post("", response_model=CollegeRead, status_code=status.HTTP_201_CREATED)
async def create_college(
    college_in: CollegeCreate,
    session: AsyncSession = Depends(get_db),
    _: models.User = Depends(role_required(models.UserRole.ADMIN)),
) -> CollegeRead:
    if college_in.coordinator_user_id:
        coordinator = await crud.get_user_by_id(session, college_in.coordinator_user_id)
        if coordinator is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coordinator not found")
        if coordinator.role != models.UserRole.FACULTY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinator must be a faculty user",
            )

    try:
        college = await crud.create_college(session, college_in)
    except IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to create college") from exc

    return CollegeRead.model_validate(college)

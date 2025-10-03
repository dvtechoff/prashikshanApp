from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db import models
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: models.User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
async def update_current_user(
    payload: UserUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> UserRead:
    updated = False
    if payload.name is not None:
        current_user.name = payload.name
        updated = True
    if payload.college_id is not None:
        current_user.college_id = payload.college_id
        updated = True

    if updated:
        session.add(current_user)
        await session.commit()
        await session.refresh(current_user)

    return UserRead.model_validate(current_user)

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import crud, models
from app.api.deps import get_db, get_current_user
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/admin")


@router.get("/users", response_model=List[UserRead])
async def list_all_users(
    role: Optional[str] = Query(default=None, description="Filter by user role"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=1000),
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[UserRead]:
    """List all users (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can list all users"
        )
    
    # Get all users
    users = await crud.list_users(
        session,
        role=role,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    
    return [UserRead.model_validate(user) for user in users]


@router.get("/users/{user_id}", response_model=UserRead)
async def get_user_by_id(
    user_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> UserRead:
    """Get user by ID (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view user details"
        )
    
    user = await crud.get_user(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserRead.model_validate(user)


@router.patch("/users/{user_id}/activate", response_model=UserRead)
async def activate_user(
    user_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> UserRead:
    """Activate a user account (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can activate users"
        )
    
    user = await crud.get_user(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )
    
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active"
        )
    
    updated_user = await crud.update_user(session, user_id, UserUpdate(is_active=True))
    return UserRead.model_validate(updated_user)


@router.patch("/users/{user_id}/deactivate", response_model=UserRead)
async def deactivate_user(
    user_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> UserRead:
    """Deactivate a user account (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can deactivate users"
        )
    
    user = await crud.get_user(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already inactive"
        )
    
    updated_user = await crud.update_user(session, user_id, UserUpdate(is_active=False))
    return UserRead.model_validate(updated_user)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a user account permanently (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete users"
        )
    
    user = await crud.get_user(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )
    
    await crud.delete_user(session, user_id)
    return {"message": "User deleted successfully"}

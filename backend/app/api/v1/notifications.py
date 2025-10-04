from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db import crud, models
from app.schemas.notification import (
    NotificationCreate,
    NotificationRead,
    NotificationUpdate,
    NotificationBulkCreate,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_in: NotificationCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> NotificationRead:
    """
    Create a single notification for a specific user.
    Only FACULTY and INDUSTRY roles can create notifications.
    """
    if current_user.role not in [models.UserRole.FACULTY, models.UserRole.INDUSTRY]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty and industry can send notifications"
        )
    
    notification = await crud.create_notification(session, notification_in)
    return NotificationRead.model_validate(notification)


@router.post("/bulk", response_model=List[NotificationRead], status_code=status.HTTP_201_CREATED)
async def create_bulk_notifications(
    notification_in: NotificationBulkCreate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[NotificationRead]:
    """
    Create notifications for multiple users.
    Can target by role (all STUDENT, FACULTY, or INDUSTRY users) or specific user IDs.
    Only FACULTY and INDUSTRY roles can send bulk notifications.
    """
    if current_user.role not in [models.UserRole.FACULTY, models.UserRole.INDUSTRY]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty and industry can send notifications"
        )
    
    if not notification_in.target_role and not notification_in.user_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either target_role or user_ids must be provided"
        )
    
    notifications = await crud.create_bulk_notifications(session, notification_in)
    return [NotificationRead.model_validate(n) for n in notifications]


@router.get("", response_model=List[NotificationRead])
async def list_notifications(
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[NotificationRead]:
    """Get all notifications for the current user"""
    notifications = await crud.list_notifications_for_user(session, current_user.id)
    return [NotificationRead.model_validate(n) for n in notifications]


@router.get("/{notification_id}", response_model=NotificationRead)
async def get_notification(
    notification_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> NotificationRead:
    """Get a specific notification"""
    notification = await crud.get_notification(session, notification_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other users' notifications"
        )
    
    return NotificationRead.model_validate(notification)


@router.patch("/{notification_id}", response_model=NotificationRead)
async def update_notification(
    notification_id: str,
    notification_in: NotificationUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> NotificationRead:
    """Update a notification (typically to mark as read)"""
    notification = await crud.get_notification(session, notification_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users' notifications"
        )
    
    notification = await crud.update_notification(session, notification, notification_in)
    return NotificationRead.model_validate(notification)

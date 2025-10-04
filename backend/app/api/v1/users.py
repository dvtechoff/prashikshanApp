from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.db import models
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def read_current_user(
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> UserRead:
    # Refresh the user with profile data loaded
    await session.refresh(
        current_user,
        attribute_names=["profile", "industry_profile"]
    )
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
async def update_current_user(
    payload: UserUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> UserRead:
    updated = False
    
    # Update user fields
    if payload.name is not None:
        current_user.name = payload.name
        updated = True
    if payload.phone is not None:
        current_user.phone = payload.phone
        updated = True
    if payload.university is not None:
        current_user.university = payload.university
        updated = True
    if payload.college_id is not None:
        current_user.college_id = payload.college_id
        updated = True

    # Update profile for Student/Faculty
    if payload.profile is not None and current_user.role in [models.UserRole.STUDENT, models.UserRole.FACULTY]:
        # Load profile if not loaded
        await session.refresh(current_user, attribute_names=["profile"])
        
        if current_user.profile:
            # Update existing profile
            if payload.profile.college is not None:
                current_user.profile.college = payload.profile.college
                updated = True
            if payload.profile.enrollment_no is not None:
                current_user.profile.enrollment_no = payload.profile.enrollment_no
                updated = True
            if payload.profile.course is not None:
                current_user.profile.course = payload.profile.course
                updated = True
            if payload.profile.year is not None:
                current_user.profile.year = payload.profile.year
                updated = True
            if payload.profile.designation is not None:
                current_user.profile.designation = payload.profile.designation
                updated = True
            if payload.profile.department is not None:
                current_user.profile.department = payload.profile.department
                updated = True
            if payload.profile.faculty_id is not None:
                current_user.profile.faculty_id = payload.profile.faculty_id
                updated = True
            if payload.profile.skills is not None:
                current_user.profile.skills = {"skills": payload.profile.skills}
                updated = True
            if payload.profile.resume_url is not None:
                current_user.profile.resume_url = payload.profile.resume_url
                updated = True
        else:
            # Create new profile if it doesn't exist
            profile = models.Profile(
                user_id=current_user.id,
                college=payload.profile.college,
                enrollment_no=payload.profile.enrollment_no,
                course=payload.profile.course,
                year=payload.profile.year,
                designation=payload.profile.designation,
                department=payload.profile.department,
                faculty_id=payload.profile.faculty_id,
                skills={"skills": payload.profile.skills} if payload.profile.skills else None,
                resume_url=payload.profile.resume_url,
            )
            session.add(profile)
            updated = True
    
    # Update industry profile
    if payload.industry_profile is not None and current_user.role == models.UserRole.INDUSTRY:
        # Load industry_profile if not loaded
        await session.refresh(current_user, attribute_names=["industry_profile"])
        
        if current_user.industry_profile:
            # Update existing industry profile
            if payload.industry_profile.company_name is not None:
                current_user.industry_profile.company_name = payload.industry_profile.company_name
                updated = True
            if payload.industry_profile.company_website is not None:
                current_user.industry_profile.company_website = payload.industry_profile.company_website
                updated = True
            if payload.industry_profile.contact_person_name is not None:
                current_user.industry_profile.contact_person_name = payload.industry_profile.contact_person_name
                updated = True
            if payload.industry_profile.contact_number is not None:
                current_user.industry_profile.contact_number = payload.industry_profile.contact_number
                updated = True
            if payload.industry_profile.designation is not None:
                current_user.industry_profile.designation = payload.industry_profile.designation
                updated = True
            if payload.industry_profile.company_address is not None:
                current_user.industry_profile.company_address = payload.industry_profile.company_address
                updated = True

    if updated:
        await session.commit()
        await session.refresh(
            current_user,
            attribute_names=["profile", "industry_profile"]
        )

    return UserRead.model_validate(current_user)

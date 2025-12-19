import asyncio
from sqlalchemy import select

from app.db import models
from app.db.session import AsyncSessionLocal


async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(models.User).where(models.User.role == models.UserRole.ADMIN))
        admins = result.scalars().all()

        if not admins:
            print("No admin users found in the database.")
            return

        print(f"Found {len(admins)} admin(s):")
        for u in admins:
            print(f"- id: {u.id} | name: {u.name} | email: {u.email} | created_at: {u.created_at} | is_active: {u.is_active}")


if __name__ == "__main__":
    asyncio.run(main())

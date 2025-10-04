from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    auth,
    users,
    colleges,
    internships,
    applications,
    logbook_entries,
    credits,
    reports,
    notifications,
)
from app.core.config import settings


def create_application() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME, version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
    app.include_router(users.router, prefix=settings.API_V1_PREFIX)
    app.include_router(colleges.router, prefix=settings.API_V1_PREFIX)
    app.include_router(internships.router, prefix=settings.API_V1_PREFIX)
    app.include_router(applications.router, prefix=settings.API_V1_PREFIX)
    app.include_router(logbook_entries.router, prefix=settings.API_V1_PREFIX)
    app.include_router(credits.router, prefix=settings.API_V1_PREFIX)
    app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
    app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "ok"}

    return app


app = create_application()

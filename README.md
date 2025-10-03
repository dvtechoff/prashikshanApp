# Prashikshan — Academia–Industry Internship Platform

Prashikshan is a NEP-aligned internship management platform that connects students, faculty, industry partners, and administrators. This repository hosts the monorepo containing the FastAPI backend, React web app, and React Native (Expo) mobile app.

> **Status:** Initial backend scaffold landed. Subsequent pull requests will introduce full feature coverage across frontends, PDF generation, background tasks, notifications, and deployment automation.

## Repository structure

- `backend/` — FastAPI backend service (async SQLAlchemy + JWT auth).
- `frontend-web/` — React web client (placeholder, to be implemented).
- `frontend-mobile/` — React Native + Expo mobile app (placeholder, to be implemented).
- `infra/` — Environment templates and infrastructure helpers.
- `docker-compose.yml` — Development stack runner for PostgreSQL and pgAdmin.

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+ (for web/mobile apps; not yet required in this scaffold)
- Docker & Docker Compose (for running PostgreSQL locally; optional if you have another Postgres instance)

### Set up the Python environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

### Start PostgreSQL with Docker Compose

```powershell
docker compose up -d db pgadmin
```

This launches PostgreSQL (with a persistent `pgdata` volume) and pgAdmin on http://localhost:8080 while leaving the FastAPI service to run on the host machine.

### Apply database migrations

```powershell
cd backend
python -m alembic upgrade head
cd ..
```

### Run the backend locally

```powershell
python backend/run_backend.py --reload
```

The API will be available at http://localhost:8000 and the interactive docs at http://localhost:8000/docs.

### Run backend tests

```powershell
pytest backend/app/tests
```

## Configuration

Copy the example environment file into the backend directory and tweak secrets as needed:

```powershell
Copy-Item infra\.env.example backend\.env
```

Key variables:

- `DATABASE_URL` — asynchronous SQLAlchemy DSN.
- `SECRET_KEY` — JWT signing key (ensure a long, random value in production).
- `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` — token lifetimes.
- `SENTRY_DSN`, `S3_*`, `FCM_SERVER_KEY` — integration hooks (optional at this stage).

## Initial API surface

The scaffold implements the first set of endpoints required for the MVP backend:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /health`

The remaining feature work (internships, applications, logbooks, reports, notifications, admin tooling, and full frontend experiences) will be delivered incrementally.

## Next steps

1. Flesh out domain models, CRUD services, and endpoints for internships, applications, logbooks, credits, reports, notifications, and admin analytics.
2. Implement PDF generation, file storage abstraction, offline sync services, and push notification integrations.
3. Build the React web and Expo mobile applications covering the required flows.
4. Add CI workflows, deployment scripts, and comprehensive documentation.

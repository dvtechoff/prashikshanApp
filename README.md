# Prashikshan — Academia–Industry Internship Platform

Prashikshan is a NEP-aligned internship management platform that connects students, faculty, industry partners, and administrators. This repository hosts the monorepo containing the FastAPI backend, React web app, and React Native (Expo) mobile app.

> **Status:** Initial backend scaffold landed. Subsequent pull requests will introduce full feature coverage across frontends, PDF generation, background tasks, notifications, and deployment automation.

## Repository structure

- `backend/` — FastAPI backend service (async SQLAlchemy + JWT auth).
- `frontend-web/` — React web client (placeholder, to be implemented).
- `frontend-mobile/` — React Native + Expo mobile app (placeholder, to be implemented).
- `infra/` — Environment templates and infrastructure helpers.
- `docker-compose.yml` — Development stack runner (PostgreSQL + backend + pgAdmin).

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+ (for web/mobile apps; not yet required in this scaffold)
- Docker & Docker Compose (for running the full stack)

### Local backend setup (virtual environment)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

Run the API with hot reload:

```powershell
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

The OpenAPI docs will be available at http://localhost:8000/docs.

### Run with Docker Compose

```powershell
docker-compose up --build
```

This command builds the backend image, starts PostgreSQL (with persistent `pgdata` volume), pgAdmin, and the FastAPI service on port `8000`.

### Database migrations

Apply the initial schema to the running database:

```powershell
docker-compose exec backend alembic upgrade head
```

### Run backend tests

```powershell
pytest -c backend/pytest.ini backend/app/tests
```

(_pytest configuration file will be added in a subsequent PR; for now tests can be invoked with `pytest backend/app/tests` after installing requirements._)

## Configuration

Copy the example environment file and update secrets as needed:

```powershell
Copy-Item infra\.env.example .env
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

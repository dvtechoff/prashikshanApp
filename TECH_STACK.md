# 🚀 Prashikshan - Technology Stack

## 📋 Overview

Prashikshan is built using modern, scalable technologies with a clear separation between frontend and backend, following industry best practices.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
├───────────────────────────┬─────────────────────────────┤
│     Web Application       │    Mobile Application       │
│     React + TypeScript    │    React Native + Expo      │
└───────────┬───────────────┴──────────┬──────────────────┘
            │                          │
            └──────────┬───────────────┘
                       │
                  REST API (JSON)
                       │
            ┌──────────▼──────────┐
            │   API GATEWAY       │
            │   FastAPI Server    │
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────┐
            │  BUSINESS LOGIC     │
            │  SQLAlchemy ORM     │
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────┐
            │   DATA LAYER        │
            │   PostgreSQL        │
            └─────────────────────┘
```

---

## 💻 Frontend Technologies

### 🌐 Web Application

**Framework & Core:**
- **React** `18.2.0` - UI library for building interactive interfaces
- **TypeScript** `5.3.3` - Type-safe JavaScript for better code quality
- **Vite** `5.1.0` - Fast build tool and development server

**Routing & State:**
- **React Router DOM** `6.22.0` - Client-side routing
- **Zustand** `4.5.0` - Lightweight state management for auth

**Data Fetching:**
- **TanStack Query** `5.22.0` - Server state management, caching, and synchronization
- **Axios** `1.6.7` - HTTP client for API requests

**UI & Styling:**
- **Tailwind CSS** `3.4.1` - Utility-first CSS framework
- **Lucide React** `0.323.0` - Modern icon library
- **PostCSS** `8.4.35` - CSS processing

**Form Handling:**
- **React Hook Form** `7.50.0` - Performant form validation

**Development Tools:**
- **ESLint** `8.56.0` - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

### 📱 Mobile Application

**Framework & Core:**
- **React Native** (via Expo) - Cross-platform mobile development
- **Expo** `~51.0.9` - Development platform and tooling
- **TypeScript** - Type safety for mobile app

**Routing:**
- **Expo Router** `~3.5.14` - File-based routing for React Native

**Data Fetching:**
- **TanStack Query** `5.51.4` - Server state management
- **Axios** `1.7.2` - HTTP client

**Development Tools:**
- **Expo Constants** `~16.0.2` - Access to system constants
- **@expo/metro-runtime** `~3.2.1` - Metro bundler runtime

---

## ⚙️ Backend Technologies

### 🐍 Core Framework

**Python Version:** `3.11+`

**Web Framework:**
- **FastAPI** `0.109.2` - Modern, fast web framework for building APIs
  - Automatic API documentation (Swagger/OpenAPI)
  - Built-in data validation with Pydantic
  - Async/await support
  - Dependency injection system

**ASGI Server:**
- **Uvicorn** `0.27.1` - Lightning-fast ASGI server
  - Hot reload during development
  - Production-ready performance

### 🗄️ Database & ORM

**Database:**
- **PostgreSQL** `15+` - Robust relational database
  - ACID compliance
  - Advanced indexing
  - JSON support for flexible schemas

**ORM & Database Tools:**
- **SQLAlchemy** `2.0.25` - Async ORM for database operations
  - Type-safe queries
  - Migration support
  - Relationship management
- **asyncpg** `0.29.0` - Fast PostgreSQL driver for async operations
- **psycopg2-binary** `2.9.9` - PostgreSQL adapter (fallback)

### 🔐 Authentication & Security

**Authentication:**
- **JWT (JSON Web Tokens)** - Stateless authentication
- **python-jose[cryptography]** `3.3.0` - JWT encoding/decoding
- **passlib[bcrypt]** `1.7.4` - Password hashing

**Security:**
- **python-multipart** `0.0.9` - Form data parsing
- **bcrypt** - Secure password hashing algorithm

### 📊 Data Validation

**Validation:**
- **Pydantic** `2.6.1` - Data validation using Python type annotations
- **pydantic-settings** `2.1.0` - Settings management
- **email-validator** `2.1.0.post1` - Email validation

### 🧪 Testing

**Testing Framework:**
- **pytest** `8.0.0` - Testing framework
- **pytest-asyncio** `0.23.5` - Async test support
- **httpx** `0.26.0` - Async HTTP client for testing

**Test Coverage:**
- Unit tests for CRUD operations
- Integration tests for API endpoints
- Authentication flow tests

---

## 🛠️ Development Tools

### 📦 Package Management

**Backend:**
- **Poetry** `1.7.1` - Python dependency management
  - Lock file for reproducible builds
  - Virtual environment management
  - Dependency resolution

**Frontend (Web):**
- **npm** / **yarn** - Node.js package management

**Frontend (Mobile):**
- **npm** - Package management for React Native/Expo

### 🐳 DevOps & Deployment

**Containerization:**
- **Docker** - Container platform
  - `backend/Dockerfile` - Backend container
  - `docker-compose.yml` - Multi-container orchestration

**Database Tools:**
- **pgAdmin** - PostgreSQL administration (via Docker)
- Database migrations (via SQLAlchemy)

### 🔧 Code Quality

**Linting & Formatting:**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** (recommended) - Code formatting
- **TypeScript** - Static type checking

**Git Hooks:**
- Pre-commit hooks for code quality
- Automated testing before push

---

## 📡 API & Communication

### REST API Specifications

**Protocol:** HTTP/HTTPS
**Format:** JSON
**Authentication:** Bearer Token (JWT)

**API Documentation:**
- **Swagger UI** - Interactive API documentation at `/docs`
- **ReDoc** - Alternative documentation at `/redoc`
- **OpenAPI 3.0** - API specification standard

**Endpoints Structure:**
```
/api/v1/auth/*          - Authentication endpoints
/api/v1/users/*         - User management
/api/v1/admin/*         - Admin operations
/api/v1/internships/*   - Internship CRUD
/api/v1/applications/*  - Application management
/api/v1/logbook-entries/* - Logbook operations
/api/v1/credits/*       - Credit tracking
/api/v1/notifications/* - Notification system
/api/v1/colleges/*      - College information
/api/v1/reports/*       - Reporting features
```

---

## 🗃️ Database Schema

### Core Tables

```sql
users
  - id (UUID, Primary Key)
  - email (String, Unique)
  - password_hash (String)
  - name (String)
  - role (Enum: STUDENT, FACULTY, INDUSTRY, ADMIN)
  - is_active (Boolean)
  - phone, university, college_id
  - created_at, updated_at (Timestamp)

profiles (Student-specific)
  - user_id (UUID, Foreign Key)
  - college, enrollment_no
  - course, year, semester
  - skills (Array)

industry_profiles
  - user_id (UUID, Foreign Key)
  - company_name, designation
  - company_website, company_description

internships
  - id (UUID, Primary Key)
  - title, description
  - skills (Array)
  - location, remote (Boolean)
  - stipend, credits, duration_weeks
  - status (OPEN/CLOSED)
  - posted_by (Foreign Key to users)
  - start_date, created_at, updated_at

applications
  - id (UUID, Primary Key)
  - internship_id (Foreign Key)
  - student_id (Foreign Key)
  - industry_status (PENDING/APPROVED/REJECTED)
  - faculty_status (PENDING/APPROVED/REJECTED)
  - resume_snapshot_url
  - applied_at

logbook_entries
  - id (UUID, Primary Key)
  - application_id (Foreign Key)
  - student_id (Foreign Key)
  - entry_date, task_description
  - hours_worked
  - created_at, updated_at

credits
  - id (UUID, Primary Key)
  - student_id (Foreign Key)
  - internship_id (Foreign Key)
  - credits_earned
  - awarded_at, awarded_by

notifications
  - id (UUID, Primary Key)
  - user_id (Foreign Key)
  - title, message
  - type, priority
  - is_read (Boolean)
  - created_at
```

### Relationships

- **One-to-One:** User ↔ Profile / Industry Profile
- **One-to-Many:** User → Internships (posted_by)
- **One-to-Many:** User → Applications (student)
- **One-to-Many:** Internship → Applications
- **One-to-Many:** Application → Logbook Entries
- **Many-to-One:** Credits → User (student)
- **Cascading Deletes:** Configured for data integrity

---

## 🔒 Security Features

### Authentication Flow

1. **User Registration**
   - Password hashed with bcrypt (10 rounds)
   - Email validation
   - Role-based account activation

2. **Login Process**
   - Email and password validation
   - JWT token generation (access + refresh)
   - Token expiration: 30 minutes (access), 7 days (refresh)

3. **Protected Endpoints**
   - JWT token verification
   - Role-based access control
   - User context injection

### Security Measures

✅ **Password Security:**
- Bcrypt hashing with salt
- Minimum password length enforcement
- No plain-text password storage

✅ **API Security:**
- CORS configuration
- Rate limiting (recommended)
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)

✅ **Authorization:**
- Role-based access control (RBAC)
- Resource-level permissions
- Admin-only endpoints

---

## 📊 Data Flow

### Request Lifecycle

```
1. CLIENT REQUEST
   ↓
   HTTP Request (JSON payload)
   ↓
2. API GATEWAY (FastAPI)
   ↓
   Route matching
   ↓
3. MIDDLEWARE
   ↓
   - CORS handling
   - Authentication (JWT verification)
   - Request parsing
   ↓
4. DEPENDENCY INJECTION
   ↓
   - Database session
   - Current user context
   - Role verification
   ↓
5. BUSINESS LOGIC
   ↓
   - Input validation (Pydantic)
   - CRUD operations (SQLAlchemy)
   - Business rules enforcement
   ↓
6. DATABASE QUERY
   ↓
   - Async query execution
   - Transaction management
   - Data retrieval/modification
   ↓
7. RESPONSE SERIALIZATION
   ↓
   - Pydantic model conversion
   - JSON encoding
   ↓
8. CLIENT RESPONSE
   ↓
   HTTP Response (JSON)
   ↓
9. FRONTEND UPDATE
   ↓
   - TanStack Query cache update
   - UI re-render
   - State synchronization
```

---

## 🎯 Key Technical Decisions

### Why FastAPI?
✅ **Performance** - One of the fastest Python frameworks
✅ **Type Safety** - Built-in Pydantic validation
✅ **Async Support** - Native async/await for better concurrency
✅ **Auto Documentation** - Swagger UI out of the box
✅ **Modern** - Python 3.6+ features and type hints

### Why React + TypeScript?
✅ **Component Reusability** - Modular UI components
✅ **Type Safety** - Catch errors at compile time
✅ **Large Ecosystem** - Vast library support
✅ **Developer Experience** - Excellent tooling
✅ **Industry Standard** - Widely adopted

### Why PostgreSQL?
✅ **ACID Compliance** - Data integrity
✅ **Advanced Features** - JSON, full-text search, triggers
✅ **Performance** - Efficient indexing and querying
✅ **Reliability** - Battle-tested in production
✅ **Open Source** - No licensing costs

### Why TanStack Query?
✅ **Automatic Caching** - Reduces unnecessary API calls
✅ **Background Refetching** - Keeps data fresh
✅ **Optimistic Updates** - Better UX
✅ **Error Handling** - Built-in retry logic
✅ **DevTools** - Excellent debugging tools

---

## 📦 Project Structure

```
Prashikshan/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py          # Dependencies (auth, db)
│   │   │   └── v1/              # API version 1 endpoints
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── admin.py
│   │   │       ├── internships.py
│   │   │       ├── applications.py
│   │   │       ├── logbook_entries.py
│   │   │       ├── credits.py
│   │   │       └── notifications.py
│   │   ├── core/
│   │   │   ├── config.py        # Settings
│   │   │   └── security.py      # Auth utilities
│   │   ├── db/
│   │   │   ├── crud.py          # Database operations
│   │   │   ├── models.py        # SQLAlchemy models
│   │   │   └── database.py      # DB connection
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── tests/               # Unit & integration tests
│   │   └── main.py              # FastAPI app entry
│   ├── Dockerfile
│   ├── pyproject.toml           # Poetry dependencies
│   └── requirements.txt
│
├── frontend-web/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── lib/                 # API clients
│   │   ├── hooks/               # Custom hooks
│   │   ├── store/               # Zustand stores
│   │   ├── layouts/             # Layout components
│   │   ├── App.tsx              # App entry
│   │   └── main.tsx             # React entry
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── frontend-mobile/
│   ├── app/                     # Expo Router pages
│   │   ├── (auth)/              # Auth screens
│   │   ├── (app)/               # Main app screens
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── api/                 # API clients
│   │   ├── components/          # React Native components
│   │   ├── hooks/               # Custom hooks
│   │   ├── store/               # State management
│   │   └── types/               # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── app.json                 # Expo config
│
├── docker-compose.yml           # Multi-container setup
└── README.md
```

---

## 🚀 Performance Optimizations

### Backend
- **Async Database Operations** - Non-blocking queries
- **Connection Pooling** - Reuse database connections
- **Query Optimization** - Proper indexing and eager loading
- **Caching** (Future) - Redis for frequently accessed data

### Frontend
- **Code Splitting** - Lazy loading routes
- **TanStack Query Caching** - Minimize API calls
- **Optimistic Updates** - Instant UI feedback
- **Debounced Search** - Reduce unnecessary requests
- **Image Optimization** - Lazy loading and compression

---

## 🔮 Future Enhancements

### Planned Technologies

**Backend:**
- **Redis** - Caching and session management
- **Celery** - Background task processing
- **WebSocket** - Real-time notifications
- **S3/MinIO** - File storage for resumes/documents

**Frontend:**
- **PWA Support** - Offline capability
- **Service Workers** - Background sync
- **Push Notifications** - Real-time alerts

**DevOps:**
- **CI/CD Pipeline** - GitHub Actions / GitLab CI
- **Kubernetes** - Container orchestration
- **Monitoring** - Prometheus + Grafana
- **Logging** - ELK Stack or Loki

---

## 📚 Documentation & Resources

### API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Framework Documentation
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **TanStack Query**: https://tanstack.com/query/latest

---

## 🎓 Development Guidelines

### Code Style
- **Python**: PEP 8 compliance
- **JavaScript/TypeScript**: ESLint + Prettier
- **Naming**: camelCase (JS/TS), snake_case (Python)
- **Type Hints**: Required for all Python functions

### Git Workflow
- **Branch Strategy**: Feature branches from `main`
- **Commit Messages**: Conventional commits format
- **Pull Requests**: Required for all changes
- **Code Review**: Mandatory before merge

### Testing Requirements
- **Backend**: >80% code coverage
- **Frontend**: Critical path testing
- **E2E Tests**: Key user journeys
- **API Tests**: All endpoints

---

## 📊 Version History

| Component      | Version  | Released    |
|----------------|----------|-------------|
| Backend API    | 1.0.0    | Oct 2025    |
| Web App        | 1.0.0    | Oct 2025    |
| Mobile App     | 1.0.0    | Oct 2025    |
| Database       | 15.x     | Oct 2025    |

---

## 🤝 Contributing

### Tech Stack Additions
When proposing new technologies:
1. Justify the need
2. Assess alternatives
3. Consider maintenance burden
4. Evaluate community support
5. Check license compatibility

---

*Last Updated: October 10, 2025*
*Prashikshan Development Team*

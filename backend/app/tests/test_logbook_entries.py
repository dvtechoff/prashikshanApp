import pytest


async def _register_and_login(async_client, payload):
    register_resp = await async_client.post("/api/v1/auth/register", json=payload)
    assert register_resp.status_code == 201
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.mark.asyncio
async def test_student_logbook_flow(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider-logbook@example.com",
            "password": "ProviderPass123",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "IoT Intern"},
    )
    internship_id = internship_resp.json()["id"]

    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-logbook@example.com",
            "password": "StudentPass123",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    apply_resp = await async_client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"internship_id": internship_id},
    )
    application_id = apply_resp.json()["id"]

    create_resp = await async_client.post(
        "/api/v1/logbook-entries",
        headers=student_headers,
        json={
            "application_id": application_id,
            "entry_date": "2025-10-03",
            "hours": 6,
            "description": "Completed firmware testing",
            "attachments": [{"name": "Report", "url": "https://cdn.example.com/report.pdf"}],
        },
    )
    assert create_resp.status_code == 201
    entry = create_resp.json()
    entry_id = entry["id"]
    assert entry["approved"] is False

    duplicate_attempt = await async_client.post(
        "/api/v1/logbook-entries",
        headers=student_headers,
        json={
            "application_id": application_id,
            "entry_date": "2025-10-04",
            "hours": 4,
            "description": "Documented findings",
        },
    )
    assert duplicate_attempt.status_code == 201

    list_resp = await async_client.get("/api/v1/logbook-entries", headers=student_headers)
    assert list_resp.status_code == 200
    entries = list_resp.json()
    assert len(entries) == 2

    detail_resp = await async_client.get(f"/api/v1/logbook-entries/{entry_id}", headers=student_headers)
    assert detail_resp.status_code == 200

    update_resp = await async_client.patch(
        f"/api/v1/logbook-entries/{entry_id}",
        headers=student_headers,
        json={"hours": 7.5, "description": "Updated firmware testing"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["hours"] == 7.5

    other_student_headers = await _register_and_login(
        async_client,
        {
            "name": "Other Student",
            "email": "other-student-logbook@example.com",
            "password": "OtherStudent123",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    forbidden_create = await async_client.post(
        "/api/v1/logbook-entries",
        headers=other_student_headers,
        json={
            "application_id": application_id,
            "entry_date": "2025-10-05",
            "hours": 3,
            "description": "Attempted entry",
        },
    )
    assert forbidden_create.status_code == 403

    forbidden_detail = await async_client.get(
        f"/api/v1/logbook-entries/{entry_id}",
        headers=other_student_headers,
    )
    assert forbidden_detail.status_code == 403


@pytest.mark.asyncio
async def test_faculty_can_approve_logbook(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider-logbook-2@example.com",
            "password": "ProviderPass456",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )
    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-logbook-2@example.com",
            "password": "StudentPass456",
            "role": "STUDENT",
            "college_id": None,
        },
    )
    faculty_headers = await _register_and_login(
        async_client,
        {
            "name": "Faculty",
            "email": "faculty-logbook@example.com",
            "password": "FacultyPass123",
            "role": "FACULTY",
            "college_id": None,
        },
    )
    other_industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Other Provider",
            "email": "other-provider-logbook@example.com",
            "password": "ProviderPass789",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "AI Intern"},
    )
    internship_id = internship_resp.json()["id"]

    apply_resp = await async_client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"internship_id": internship_id},
    )
    application_id = apply_resp.json()["id"]

    entry_resp = await async_client.post(
        "/api/v1/logbook-entries",
        headers=student_headers,
        json={
            "application_id": application_id,
            "entry_date": "2025-10-06",
            "hours": 5,
            "description": "Prototyped models",
        },
    )
    entry_id = entry_resp.json()["id"]

    faculty_update = await async_client.patch(
        f"/api/v1/logbook-entries/{entry_id}",
        headers=faculty_headers,
        json={"approved": True, "faculty_comments": "Keep it up"},
    )
    assert faculty_update.status_code == 200
    assert faculty_update.json()["approved"] is True

    student_update = await async_client.patch(
        f"/api/v1/logbook-entries/{entry_id}",
        headers=student_headers,
        json={"description": "Refined models"},
    )
    assert student_update.status_code == 200
    assert student_update.json()["description"] == "Refined models"

    forbidden_industry_update = await async_client.patch(
        f"/api/v1/logbook-entries/{entry_id}",
        headers=other_industry_headers,
        json={"approved": False},
    )
    assert forbidden_industry_update.status_code == 403

    industry_list = await async_client.get("/api/v1/logbook-entries", headers=industry_headers)
    assert any(item["id"] == entry_id for item in industry_list.json())

    other_industry_list = await async_client.get("/api/v1/logbook-entries", headers=other_industry_headers)
    assert all(item["id"] != entry_id for item in other_industry_list.json())

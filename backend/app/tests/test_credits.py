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
async def test_faculty_can_award_and_update_credits(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider-credits@example.com",
            "password": "ProviderPass123",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )
    faculty_headers = await _register_and_login(
        async_client,
        {
            "name": "Faculty",
            "email": "faculty-credits@example.com",
            "password": "FacultyPass123",
            "role": "FACULTY",
            "college_id": None,
        },
    )
    admin_headers = await _register_and_login(
        async_client,
        {
            "name": "Admin",
            "email": "admin-credits@example.com",
            "password": "AdminPass123",
            "role": "ADMIN",
            "college_id": None,
        },
    )
    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-credits@example.com",
            "password": "StudentPass123",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "Robotics Intern"},
    )
    internship_id = internship_resp.json()["id"]

    apply_resp = await async_client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"internship_id": internship_id},
    )
    application_id = apply_resp.json()["id"]

    await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=industry_headers,
        json={"industry_status": "APPROVED"},
    )
    await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=faculty_headers,
        json={"faculty_status": "APPROVED"},
    )

    award_student_id = apply_resp.json()["student_id"]
    award_resp = await async_client.post(
        "/api/v1/credits",
        headers=faculty_headers,
        json={
            "student_id": award_student_id,
            "internship_id": internship_id,
            "credits_awarded": 4,
        },
    )
    assert award_resp.status_code == 201
    credit = award_resp.json()
    credit_id = credit["id"]
    assert credit["credits_awarded"] == 4

    duplicate_resp = await async_client.post(
        "/api/v1/credits",
        headers=faculty_headers,
        json={
            "student_id": award_student_id,
            "internship_id": internship_id,
            "credits_awarded": 3,
        },
    )
    assert duplicate_resp.status_code == 400

    list_student = await async_client.get("/api/v1/credits", headers=student_headers)
    assert any(item["id"] == credit_id for item in list_student.json())

    list_admin = await async_client.get(
        "/api/v1/credits",
        headers=admin_headers,
        params={"student_id": award_student_id},
    )
    results_admin = list_admin.json()
    assert len(results_admin) == 1
    assert results_admin[0]["credits_awarded"] == 4

    update_resp = await async_client.patch(
        f"/api/v1/credits/{credit_id}",
        headers=admin_headers,
        json={"credits_awarded": 5},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["credits_awarded"] == 5

    detail_student = await async_client.get(
        f"/api/v1/credits/{credit_id}", headers=student_headers
    )
    assert detail_student.status_code == 200

    industry_list = await async_client.get("/api/v1/credits", headers=industry_headers)
    assert any(item["id"] == credit_id for item in industry_list.json())


@pytest.mark.asyncio
async def test_non_faculty_cannot_award_credit(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider-credits-2@example.com",
            "password": "ProviderPass456",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )
    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-credits-2@example.com",
            "password": "StudentPass456",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "VR Intern"},
    )
    internship_id = internship_resp.json()["id"]

    apply_resp = await async_client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"internship_id": internship_id},
    )

    award_resp = await async_client.post(
        "/api/v1/credits",
        headers=industry_headers,
        json={
            "student_id": apply_resp.json()["student_id"],
            "internship_id": internship_id,
            "credits_awarded": 2,
        },
    )
    assert award_resp.status_code == 403
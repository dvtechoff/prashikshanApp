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
async def test_student_can_apply_and_list_applications(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider@example.com",
            "password": "ProviderPass123",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )

    create_internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={
            "title": "Data Intern",
            "skills": ["SQL"],
            "remote": True,
        },
    )
    assert create_internship_resp.status_code == 201
    internship_id = create_internship_resp.json()["id"]

    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-applicant@example.com",
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
    assert apply_resp.status_code == 201
    application = apply_resp.json()
    application_id = application["id"]
    assert application["industry_status"] == "PENDING"

    duplicate_resp = await async_client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"internship_id": internship_id},
    )
    assert duplicate_resp.status_code == 400
    assert duplicate_resp.json()["detail"] == "Application already submitted"

    list_resp = await async_client.get("/api/v1/applications", headers=student_headers)
    assert list_resp.status_code == 200
    applications = list_resp.json()
    assert len(applications) == 1
    assert applications[0]["id"] == application_id

    detail_resp = await async_client.get(f"/api/v1/applications/{application_id}", headers=student_headers)
    assert detail_resp.status_code == 200

    other_student_headers = await _register_and_login(
        async_client,
        {
            "name": "Other Student",
            "email": "other-student@example.com",
            "password": "StudentPass456",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    forbidden_detail = await async_client.get(
        f"/api/v1/applications/{application_id}",
        headers=other_student_headers,
    )
    assert forbidden_detail.status_code == 403


@pytest.mark.asyncio
async def test_industry_and_faculty_can_review_applications(async_client):
    industry_payload = {
        "name": "Industry Owner",
        "email": "owner-app@example.com",
        "password": "OwnerPass123",
        "role": "INDUSTRY",
        "college_id": None,
    }
    student_payload = {
        "name": "Applicant",
        "email": "applicant@example.com",
        "password": "ApplicantPass123",
        "role": "STUDENT",
        "college_id": None,
    }
    faculty_payload = {
        "name": "Faculty Reviewer",
        "email": "faculty@example.com",
        "password": "FacultyPass123",
        "role": "FACULTY",
        "college_id": None,
    }

    industry_headers = await _register_and_login(async_client, industry_payload)
    student_headers = await _register_and_login(async_client, student_payload)
    faculty_headers = await _register_and_login(async_client, faculty_payload)

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "Security Intern"},
    )
    internship_id = internship_resp.json()["id"]

    apply_resp = await async_client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"internship_id": internship_id},
    )
    application_id = apply_resp.json()["id"]

    list_resp = await async_client.get("/api/v1/applications", headers=industry_headers)
    assert any(item["id"] == application_id for item in list_resp.json())

    update_industry = await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=industry_headers,
        json={"industry_status": "APPROVED"},
    )
    assert update_industry.status_code == 200
    assert update_industry.json()["industry_status"] == "APPROVED"

    update_faculty = await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=faculty_headers,
        json={"faculty_status": "APPROVED"},
    )
    assert update_faculty.status_code == 200
    assert update_faculty.json()["faculty_status"] == "APPROVED"

    student_status_attempt = await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=student_headers,
        json={"industry_status": "REJECTED"},
    )
    assert student_status_attempt.status_code == 400
    resume_update = await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=student_headers,
        json={"resume_snapshot_url": "https://cdn.example.com/resume.pdf"},
    )
    assert resume_update.status_code == 200
    assert resume_update.json()["resume_snapshot_url"] == "https://cdn.example.com/resume.pdf"

    other_industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Other Owner",
            "email": "other-owner@example.com",
            "password": "OtherOwner123",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )

    forbidden_update = await async_client.patch(
        f"/api/v1/applications/{application_id}",
        headers=other_industry_headers,
        json={"industry_status": "REJECTED"},
    )
    assert forbidden_update.status_code == 403

    forbidden_list = await async_client.get("/api/v1/applications", headers=other_industry_headers)
    assert all(item["id"] != application_id for item in forbidden_list.json())

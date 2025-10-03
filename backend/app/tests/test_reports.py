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
async def test_faculty_can_generate_report_and_student_can_view(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider-reports@example.com",
            "password": "ProviderPass123",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )
    faculty_headers = await _register_and_login(
        async_client,
        {
            "name": "Faculty",
            "email": "faculty-reports@example.com",
            "password": "FacultyPass123",
            "role": "FACULTY",
            "college_id": None,
        },
    )
    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-reports@example.com",
            "password": "StudentPass123",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "ML Intern"},
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

    create_resp = await async_client.post(
        "/api/v1/reports",
        headers=faculty_headers,
        json={"application_id": application_id, "pdf_url": "https://cdn.example.com/report.pdf"},
    )
    assert create_resp.status_code == 201
    report = create_resp.json()
    report_id = report["id"]
    assert report["qr_code_token"]

    student_list = await async_client.get("/api/v1/reports", headers=student_headers)
    assert any(item["id"] == report_id for item in student_list.json())

    detail_student = await async_client.get(
        f"/api/v1/reports/{report_id}", headers=student_headers
    )
    assert detail_student.status_code == 200

    qr_resp = await async_client.get(f"/api/v1/reports/qr/{report['qr_code_token']}")
    assert qr_resp.status_code == 200
    assert qr_resp.json()["id"] == report_id

    industry_list = await async_client.get("/api/v1/reports", headers=industry_headers)
    assert any(item["id"] == report_id for item in industry_list.json())

    other_student_headers = await _register_and_login(
        async_client,
        {
            "name": "Other Student",
            "email": "other-student-reports@example.com",
            "password": "StudentPass456",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    forbidden_detail = await async_client.get(
        f"/api/v1/reports/{report_id}", headers=other_student_headers
    )
    assert forbidden_detail.status_code == 403


@pytest.mark.asyncio
async def test_only_faculty_or_admin_can_create_or_update_reports(async_client):
    industry_headers = await _register_and_login(
        async_client,
        {
            "name": "Provider",
            "email": "provider-reports-2@example.com",
            "password": "ProviderPass456",
            "role": "INDUSTRY",
            "college_id": None,
        },
    )
    faculty_headers = await _register_and_login(
        async_client,
        {
            "name": "Faculty",
            "email": "faculty-reports-2@example.com",
            "password": "FacultyPass456",
            "role": "FACULTY",
            "college_id": None,
        },
    )
    admin_headers = await _register_and_login(
        async_client,
        {
            "name": "Admin",
            "email": "admin-reports@example.com",
            "password": "AdminPass123",
            "role": "ADMIN",
            "college_id": None,
        },
    )
    student_headers = await _register_and_login(
        async_client,
        {
            "name": "Student",
            "email": "student-reports-2@example.com",
            "password": "StudentPass789",
            "role": "STUDENT",
            "college_id": None,
        },
    )

    internship_resp = await async_client.post(
        "/api/v1/internships",
        headers=industry_headers,
        json={"title": "Cloud Intern"},
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

    forbidden_create = await async_client.post(
        "/api/v1/reports",
        headers=industry_headers,
        json={"application_id": application_id, "pdf_url": "https://cdn.example.com/report.pdf"},
    )
    assert forbidden_create.status_code == 403

    report_resp = await async_client.post(
        "/api/v1/reports",
        headers=faculty_headers,
        json={"application_id": application_id, "pdf_url": "https://cdn.example.com/report.pdf"},
    )
    report_id = report_resp.json()["id"]

    update_resp = await async_client.patch(
        f"/api/v1/reports/{report_id}",
        headers=admin_headers,
        json={"pdf_url": "https://cdn.example.com/report-v2.pdf"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["pdf_url"] == "https://cdn.example.com/report-v2.pdf"

    forbidden_update = await async_client.patch(
        f"/api/v1/reports/{report_id}",
        headers=student_headers,
        json={"pdf_url": "https://cdn.example.com/report-v3.pdf"},
    )
    assert forbidden_update.status_code == 403

    admin_list_filtered = await async_client.get(
        "/api/v1/reports",
        headers=admin_headers,
        params={"student_id": apply_resp.json()["student_id"], "internship_id": internship_id},
    )
    assert any(item["id"] == report_id for item in admin_list_filtered.json())
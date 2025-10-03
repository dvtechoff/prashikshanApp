import pytest


@pytest.mark.asyncio
async def test_industry_can_create_filter_and_update_internship(async_client):
    industry_payload = {
        "name": "Industry User",
        "email": "industry@example.com",
        "password": "StrongPass123",
        "role": "INDUSTRY",
        "college_id": None,
    }

    register_resp = await async_client.post("/api/v1/auth/register", json=industry_payload)
    assert register_resp.status_code == 201

    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": industry_payload["email"], "password": industry_payload["password"]},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    create_resp = await async_client.post(
        "/api/v1/internships",
        headers=headers,
        json={
            "title": "Backend Intern",
            "description": "Work on APIs",
            "skills": ["Python", "FastAPI"],
            "stipend": 10000,
            "location": "Remote",
            "remote": True,
            "duration_weeks": 12,
            "credits": 4,
        },
    )
    assert create_resp.status_code == 201
    internship = create_resp.json()
    internship_id = internship["id"]
    assert internship["remote"] is True

    list_resp = await async_client.get(
        "/api/v1/internships",
        params={"skills": "Python", "remote": True, "min_credits": 3, "location": "remote"},
    )
    assert list_resp.status_code == 200
    listings = list_resp.json()
    assert any(item["id"] == internship_id for item in listings)

    detail_resp = await async_client.get(f"/api/v1/internships/{internship_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["title"] == "Backend Intern"

    update_resp = await async_client.patch(
        f"/api/v1/internships/{internship_id}",
        headers=headers,
        json={"status": "FILLED"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "FILLED"


@pytest.mark.asyncio
async def test_student_cannot_create_internship(async_client):
    student_payload = {
        "name": "Student User",
        "email": "student-intern@example.com",
        "password": "StudentPass123",
        "role": "STUDENT",
        "college_id": None,
    }

    register_resp = await async_client.post("/api/v1/auth/register", json=student_payload)
    assert register_resp.status_code == 201

    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": student_payload["email"], "password": student_payload["password"]},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    create_resp = await async_client.post(
        "/api/v1/internships",
        headers=headers,
        json={"title": "Attempted Posting", "description": "Not allowed"},
    )
    assert create_resp.status_code == 403
    assert create_resp.json()["detail"] == "Insufficient permissions"


@pytest.mark.asyncio
async def test_industry_cannot_update_other_provider_internship(async_client):
    owner_payload = {
        "name": "Owner User",
        "email": "owner@example.com",
        "password": "OwnerPass123",
        "role": "INDUSTRY",
        "college_id": None,
    }
    other_payload = {
        "name": "Other Industry",
        "email": "other@example.com",
        "password": "OtherPass123",
        "role": "INDUSTRY",
        "college_id": None,
    }

    register_owner = await async_client.post("/api/v1/auth/register", json=owner_payload)
    assert register_owner.status_code == 201
    register_other = await async_client.post("/api/v1/auth/register", json=other_payload)
    assert register_other.status_code == 201

    login_owner = await async_client.post(
        "/api/v1/auth/login",
        json={"email": owner_payload["email"], "password": owner_payload["password"]},
    )
    owner_tokens = login_owner.json()
    owner_headers = {"Authorization": f"Bearer {owner_tokens['access_token']}"}

    create_resp = await async_client.post(
        "/api/v1/internships",
        headers=owner_headers,
        json={"title": "Owner Internship"},
    )
    assert create_resp.status_code == 201
    internship_id = create_resp.json()["id"]

    login_other = await async_client.post(
        "/api/v1/auth/login",
        json={"email": other_payload["email"], "password": other_payload["password"]},
    )
    other_tokens = login_other.json()
    other_headers = {"Authorization": f"Bearer {other_tokens['access_token']}"}

    update_resp = await async_client.patch(
        f"/api/v1/internships/{internship_id}",
        headers=other_headers,
        json={"title": "Hijacked"},
    )
    assert update_resp.status_code == 403
    assert update_resp.json()["detail"] == "Cannot modify another provider's posting"

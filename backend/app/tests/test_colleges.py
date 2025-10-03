import pytest


@pytest.mark.asyncio
async def test_admin_can_create_and_list_colleges(async_client):
    admin_payload = {
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "AdminPass123",
        "role": "ADMIN",
        "college_id": None,
    }

    register_resp = await async_client.post("/api/v1/auth/register", json=admin_payload)
    assert register_resp.status_code == 201

    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": admin_payload["email"], "password": admin_payload["password"]},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()

    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    create_resp = await async_client.post(
        "/api/v1/colleges",
        headers=headers,
        json={
            "name": "Tech University",
            "address": "123 University Road",
            "coordinator_user_id": None,
        },
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == "Tech University"

    list_resp = await async_client.get("/api/v1/colleges")
    assert list_resp.status_code == 200
    colleges = list_resp.json()
    assert any(college["id"] == created["id"] for college in colleges)


@pytest.mark.asyncio
async def test_non_admin_cannot_create_college(async_client):
    student_payload = {
        "name": "Student User",
        "email": "student@example.com",
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
        "/api/v1/colleges",
        headers=headers,
        json={"name": "Another College", "address": None, "coordinator_user_id": None},
    )
    assert create_resp.status_code == 403
    assert create_resp.json()["detail"] == "Insufficient permissions"

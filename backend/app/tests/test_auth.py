import pytest


@pytest.mark.asyncio
async def test_register_login_and_refresh(async_client):
    register_payload = {
        "name": "Alice Student",
        "email": "alice@example.com",
        "password": "Secretpass123",
        "role": "STUDENT",
        "college_id": None,
    }

    response = await async_client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == register_payload["email"].lower()
    assert data["role"] == "STUDENT"

    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    me_resp = await async_client.get("/api/v1/users/me", headers=headers)
    assert me_resp.status_code == 200
    me = me_resp.json()
    assert me["email"] == register_payload["email"].lower()

    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert refresh_resp.status_code == 200
    refreshed = refresh_resp.json()
    assert refreshed["access_token"] != tokens["access_token"]
    assert refreshed["refresh_token"] != tokens["refresh_token"]


@pytest.mark.asyncio
async def test_duplicate_registration_fails(async_client):
    payload = {
        "name": "Bob",
        "email": "bob@example.com",
        "password": "Password123",
        "role": "STUDENT",
        "college_id": None,
    }

    first = await async_client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = await async_client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 400
    assert second.json()["detail"] == "Email already registered"


@pytest.mark.asyncio
async def test_login_with_wrong_password(async_client):
    payload = {
        "name": "Charlie",
        "email": "charlie@example.com",
        "password": "Password123",
        "role": "STUDENT",
        "college_id": None,
    }

    await async_client.post("/api/v1/auth/register", json=payload)

    bad_login = await async_client.post(
        "/api/v1/auth/login", json={"email": payload["email"], "password": "wrongpass"}
    )
    assert bad_login.status_code == 401
    assert bad_login.json()["detail"] == "Invalid credentials"

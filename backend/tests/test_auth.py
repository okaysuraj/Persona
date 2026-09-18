import pytest


@pytest.mark.asyncio
async def test_register_and_login(client):
    # 1. Register
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "secretpassword123",
            "display_name": "Alex",
            "timezone": "America/New_York"
        }
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["display_name"] == "Alex"
    token = data["access_token"]

    # 2. Duplicate registration fails
    dup_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "password": "secretpassword123",
            "display_name": "Alex Duplicate"
        }
    )
    assert dup_resp.status_code == 400

    # 3. Login
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "secretpassword123"}
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 4. Profile /me
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "user@example.com"

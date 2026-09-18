import pytest


@pytest.mark.asyncio
async def test_memory_vault_crud(client):
    # 1. Register & Auth
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "vault_tester@example.com", "password": "password123", "display_name": "Jordan"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Persona
    p_resp = await client.get("/api/v1/personas/", headers=headers)
    persona_id = p_resp.json()[0]["id"]

    # 3. Manually add a user fact to the companion's memory
    fact_resp = await client.post(
        f"/api/v1/memories/facts?persona_id={persona_id}",
        headers=headers,
        json={
            "category": "preferences",
            "key": "favorite beverage",
            "value": "Iced Oat Milk Matcha Latte",
            "confidence": 1.0
        }
    )
    assert fact_resp.status_code == 201
    fact = fact_resp.json()
    assert fact["key"] == "favorite beverage"
    assert fact["value"] == "Iced Oat Milk Matcha Latte"
    fact_id = fact["id"]

    # 4. View Memory Vault
    mem_resp = await client.get(f"/api/v1/memories/persona/{persona_id}", headers=headers)
    assert mem_resp.status_code == 200
    vault = mem_resp.json()
    assert any(f["id"] == fact_id for f in vault["facts"])

    # 5. Delete the fact from Memory Vault
    del_resp = await client.delete(f"/api/v1/memories/facts/{fact_id}", headers=headers)
    assert del_resp.status_code == 204

    # 6. Verify fact is removed
    mem_after = await client.get(f"/api/v1/memories/persona/{persona_id}", headers=headers)
    assert not any(f["id"] == fact_id for f in mem_after.json()["facts"])

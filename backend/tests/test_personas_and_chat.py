import pytest


@pytest.mark.asyncio
async def test_personas_and_cognitive_chat(client):
    # 1. Register user
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "companion_tester@example.com", "password": "password123", "display_name": "Sam"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List seeded personas
    p_resp = await client.get("/api/v1/personas/", headers=headers)
    assert p_resp.status_code == 200
    personas = p_resp.json()
    assert len(personas) >= 3
    aria = next((p for p in personas if p["name"] == "Aria"), None)
    assert aria is not None

    # 3. Check initial relationship state
    rel_resp = await client.get(f"/api/v1/personas/{aria['id']}/relationship", headers=headers)
    assert rel_resp.status_code == 200
    rel_data = rel_resp.json()
    assert rel_data["intimacy_level"] == 1
    assert rel_data["stage"] == "acquaintance"

    # 4. Send message to companion with a personal fact
    msg_resp = await client.post(
        "/api/v1/chat/send",
        headers=headers,
        json={
            "persona_id": aria["id"],
            "content": "Hey Aria! I have a dog named Sparky and I'm really tired from work."
        }
    )
    assert msg_resp.status_code == 200
    reply = msg_resp.json()
    assert reply["sender_type"] == "assistant"
    assert reply["content"] is not None
    assert reply["thought_trace"] is not None

    # 5. Verify relationship XP increased
    rel_after = await client.get(f"/api/v1/personas/{aria['id']}/relationship", headers=headers)
    assert rel_after.json()["intimacy_xp"] > 0

    # 6. Verify Memory Vault extracted the fact
    mem_resp = await client.get(f"/api/v1/memories/persona/{aria['id']}", headers=headers)
    assert mem_resp.status_code == 200
    mem_data = mem_resp.json()
    assert len(mem_data["facts"]) > 0
    dog_fact = next((f for f in mem_data["facts"] if "dog" in f["key"].lower()), None)
    assert dog_fact is not None
    assert dog_fact["value"] == "Sparky"

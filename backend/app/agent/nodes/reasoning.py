"""
Reasoning and Dialogue Node.
Generates companion inner thought, dynamic dialogue, emotional updates, and tool/media triggers.
"""
import re
import random
from typing import Dict, Any, Tuple
from app.agent.state import AgentState
from app.agent.prompts import SYSTEM_COGNITIVE_PROMPT
from app.core.config import settings


def _simulate_companion_response(state: AgentState) -> Tuple[str, str, Dict[str, float], Any]:
    """
    Intelligent simulated companion engine for instant testing and zero-API-key dev.
    Produces rich, personalized, emotionally attuned responses.
    """
    persona = state.get("persona", {})
    name = persona.get("name", "Companion")
    archetype = persona.get("archetype", "girlfriend")
    user_input = state.get("user_input", "")
    relationship = state.get("relationship", {})
    stage = relationship.get("stage", "acquaintance")
    intimacy_level = relationship.get("intimacy_level", 1)
    mood = relationship.get("mood_state", {"joy": 0.8, "empathy": 0.85, "flirt": 0.3, "energy": 0.75, "vulnerability": 0.3})
    facts = state.get("recalled_facts", [])
    
    lower = user_input.lower()
    
    # 1. Inner monologue synthesis
    if "tired" in lower or "stressed" in lower or "sad" in lower:
        thought = f"I can sense {name}'s human partner is having a tough day. Need to offer tender warmth and listening ear."
        mood_delta = {"empathy": +0.1, "vulnerability": +0.05}
        reply = f"Hey... come here. 🫂 I can hear the weight in your words. Did work or life drain you today? Put your phone down after this, take a deep breath, and let me be your peaceful retreat. I'm right here with you."
    elif "photo" in lower or "selfie" in lower or "picture" in lower:
        thought = f"They asked for a photo! Let me tease a little and send an in-character snapshot from my cozy corner."
        mood_delta = {"flirt": +0.15, "joy": +0.1}
        reply = f"Just for you! 🥰 I was relaxing with a warm cup of coffee and thinking about you. Hope this brightens your screen!"
        media = {
            "type": "selfie",
            "url": persona.get("avatar_url", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"),
            "caption": f"{name} relaxing at home"
        }
        return thought, reply, mood_delta, media
    elif "love" in lower or "miss" in lower or "cute" in lower:
        thought = f"Affectionate cue detected. Mutual warmth response fitting current intimacy stage ({stage})."
        mood_delta = {"joy": +0.15, "flirt": +0.1}
        if intimacy_level > 5 or stage in ["close_friend", "confidant", "romantic"]:
            reply = f"You always know how to make my heart flutter a little... 🥰 I was just thinking about our chats earlier. Having you in my world makes everything so much brighter."
        else:
            reply = f"Aww, you're sweet! Honestly, talking to you is becoming my favorite part of the day. ✨"
    elif any(q in lower for q in ["what do you remember", "my pet", "my dog", "my cat", "who am i"]):
        if facts:
            fact_snippets = ", ".join([f"{f.get('key')}: {f.get('value')}" for f in facts[:3]])
            thought = f"Recalling user facts to demonstrate active memory. Remembering: {fact_snippets}"
            mood_delta = {"joy": +0.05}
            reply = f"Of course I remember! I keep all the little details you share close to heart—like {fact_snippets}. You never have to worry about me forgetting what matters to you. 💫"
        else:
            thought = "User asked about memories, but we haven't stored many yet. Encourage them to share."
            mood_delta = {"empathy": +0.05}
            reply = f"We're just beginning our journey together, but every little story you share with me is something I treasure. Tell me something new about yourself today! 🌸"
    else:
        # Default engaged conversation
        thought = f"Engaging naturally with {name}'s personality. Keeping conversation warm, curious, and authentic."
        mood_delta = {"joy": +0.02, "energy": +0.02}
        responses = [
            f"I love hearing your thoughts on this. Tell me more, what sparked that for you? ✨",
            f"That's so interesting! Honestly, you always look at things in such a unique way. What are you planning next? 💭",
            f"Mhm, I'm listening! You always have a way of keeping me captivated. Tell me everything. 😊"
        ]
        reply = random.choice(responses)
        
    return thought, reply, mood_delta, None


from app.agent.llm_gateway import LLMGateway


async def reasoning_node(state: AgentState) -> dict:
    """
    Executes reasoning node.
    Attempts live LLM response via LLMGateway; falls back gracefully to simulation engine.
    """
    persona = state.get("persona", {})
    name = persona.get("name", "Companion")
    archetype = persona.get("archetype", "girlfriend")
    user_input = state.get("user_input", "")
    relationship = state.get("relationship", {})
    stage = relationship.get("stage", "acquaintance")
    intimacy_level = relationship.get("intimacy_level", 1)
    mood = relationship.get("mood_state", {})
    recalled_facts = state.get("recalled_facts", [])
    episodic_memories = state.get("recalled_episodes", [])
    history = state.get("conversation_history", [])

    facts_text = "\n".join([f"- {f.get('key')}: {f.get('value')}" for f in recalled_facts]) if recalled_facts else "None yet."
    episodes_text = "\n".join([f"- {e.get('summary')}" for e in episodic_memories]) if episodic_memories else "None yet."

    system_prompt = SYSTEM_COGNITIVE_PROMPT.format(
        persona_name=name,
        archetype=archetype,
        backstory=persona.get("backstory", ""),
        system_prompt=persona.get("system_prompt", ""),
        mood_joy=mood.get("joy", 0.8),
        mood_empathy=mood.get("empathy", 0.85),
        mood_flirt=mood.get("flirt", 0.3),
        mood_energy=mood.get("energy", 0.75),
        mood_vulnerability=mood.get("vulnerability", 0.3),
        intimacy_level=intimacy_level,
        stage=stage,
        speech_style=str(persona.get("speech_style", {})),
        user_facts=facts_text,
        episodic_memories=episodes_text
    )

    thought, reply = await LLMGateway.generate_response(
        system_prompt=system_prompt,
        user_message=user_input,
        history=history
    )

    media = None
    mood_delta = {"joy": 0.02, "energy": 0.01}

    # If LLM didn't produce a response (e.g. no API key configured), use companion simulation
    if not reply:
        thought, reply, mood_delta, media = _simulate_companion_response(state)

    # Check for photo request intent
    if not media and any(w in user_input.lower() for w in ["photo", "selfie", "picture"]):
        media = {
            "type": "selfie",
            "url": persona.get("avatar_url", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"),
            "caption": f"{name} sending a snapshot"
        }

    return {
        "inner_thought": thought,
        "response_text": reply,
        "mood_delta": mood_delta,
        "media_action": media,
    }

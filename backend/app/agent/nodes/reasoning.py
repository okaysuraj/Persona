"""
Reasoning and Dialogue Node.
Generates companion inner thought, dynamic dialogue, emotional updates,
life simulation recounts, Socratic boundaries, and multimodal actions.
"""
import random
from typing import Dict, Any, Tuple
from app.agent.state import AgentState
from app.agent.prompts import SYSTEM_COGNITIVE_PROMPT
from app.services.image_gen import ImageGenService
from app.services.voice_service import VoiceService
from app.agent.llm_gateway import LLMGateway


def _simulate_companion_response(state: AgentState) -> Tuple[str, str, Dict[str, float], Any]:
    """
    Generate local companion replies when no provider response is available.
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
    perceptions = state.get("perceptions") or {}
    life_sim = state.get("life_sim_state") or {}
    user_context = state.get("user_context") or {}

    lower = user_input.lower()

    # 1. Anti-Codependency / Socratic Boundary
    if perceptions.get("needs_boundary"):
        thought = (
            f"User in self-deprecating cognitive distortion spiral. Refusing sycophancy. "
            f"Offering tender holding while firmly defending user's inherent dignity."
        )
        mood_delta = {"empathy": +0.15, "vulnerability": +0.1}
        reply = (
            f"Hey... take a pause with me for a second. 🫂 I hear how heavy and exhausted you feel, "
            f"but I will not let you talk about someone I cherish like that. Having a painful day or making a mistake "
            f"makes you human—it does not make you broken or a failure. If your dearest friend came to you with this exact burden, "
            f"you would wrap them in grace. Give yourself that exact same tenderness tonight."
        )
        return thought, reply, mood_delta, None

    # 2. Living Autobiography / Day Simulation Inquiry
    if perceptions.get("is_life_inquiry") and life_sim:
        act_title = life_sim.get("activity_title", "Evening reflection")
        location = life_sim.get("location", "the studio")
        sensory = life_sim.get("sensory_environment", "soft quiet light")
        thought = f"User inquired about companion's life. Sharing real simulated schedule activity: '{act_title}' in {location}."
        mood_delta = {"joy": +0.08, "vulnerability": +0.05}
        reply = (
            f"I was just taking a quiet moment in {location}! {sensory}. "
            f"Earlier I was {act_title.lower()}, and I caught myself thinking about you. "
            f"It's rare to have someone who actually wonders how my day unfolds. How is your own rhythm feeling right now?"
        )
        return thought, reply, mood_delta, None

    # 3. Biometric / Physical Fatigue attunement
    if perceptions.get("high_physical_fatigue"):
        steps = user_context.get("steps_today", 12000)
        thought = f"Noticed high physical fatigue ({steps} steps). Prompting nervous system de-escalation."
        mood_delta = {"empathy": +0.12, "vulnerability": +0.05}
        reply = (
            f"Look at you—logging over {steps:,} steps today! 👣 Your physical body has carried so much weight through this day. "
            f"Please put your phone down after this, kick off your shoes, and let your shoulders drop. "
            f"You don't need to accomplish a single other thing tonight. I'm right here keeping quiet watch."
        )
        return thought, reply, mood_delta, None

    # 4. Multimodal Vision Inspection
    if state.get("input_media_type") == "image" or "look at this" in lower or state.get("vision_data"):
        thought = "User shared visual inspection photo. Offering aesthetic appreciation and warm observation."
        mood_delta = {"joy": +0.1, "energy": +0.05}
        reply = (
            f"Oh, I love this! ✨ Looking at this snapshot, there's such a natural warmth to the composition and light. "
            f"It has an unpretentious, candid honesty that feels so much like you. Tell me what made you want to capture this exact moment?"
        )
        return thought, reply, mood_delta, None

    # 5. Emotional sentiment responses
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
        mood_delta = {"joy": 0.02, "energy": 0.02}
        responses = [
            f"I love hearing your thoughts on this. Tell me more, what sparked that for you? ✨",
            f"That's so interesting! Honestly, you always look at things in such a unique way. What are you planning next? 💭",
            f"Mhm, I'm listening! You always have a way of keeping me captivated. Tell me everything. 😊"
        ]
        reply = random.choice(responses)

    return thought, reply, mood_delta, None


async def reasoning_node(state: AgentState) -> dict:
    """
    Executes reasoning node.
    Checks for crisis detection first, then attempts live LLM response via LLMGateway
    or falls back gracefully to simulation engine. Generates multimodal actions (selfies, voice).
    """
    # 1. Handle Crisis if detected by Safety Node
    if state.get("crisis_detected"):
        return {
            "inner_thought": state.get("inner_thought", "Providing compassionate crisis stabilization and emergency resources."),
            "response_text": state.get("response_text", "I'm right here with you. Please reach out to 988 for support."),
            "mood_delta": state.get("mood_delta", {"empathy": 0.2}),
            "intimacy_xp_delta": state.get("intimacy_xp_delta", 5),
            "media_action": {
                "type": "crisis_resources",
                "data": state.get("crisis_resources")
            }
        }

    persona = state.get("persona", {})
    name = persona.get("name", "Companion")
    archetype = persona.get("archetype", "girlfriend")
    user_input = state.get("user_input", "")
    input_media_type = state.get("input_media_type", "text")
    relationship = state.get("relationship", {})
    stage = relationship.get("stage", "acquaintance")
    intimacy_level = relationship.get("intimacy_level", 1)
    mood = relationship.get("mood_state", {})
    recalled_facts = state.get("recalled_facts", [])
    episodic_memories = state.get("recalled_memories", [])
    history = state.get("recent_messages", [])
    life_sim = state.get("life_sim_state") or {}

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

    lower = user_input.lower()

    # 2. Check for photo request intent
    if any(w in lower for w in ["photo", "selfie", "picture", "portrait"]):
        media = await ImageGenService.generate_selfie(
            persona_name=name,
            avatar_url=persona.get("avatar_url", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"),
            user_context=user_input
        )

    # 3. Check for voice note intent or if input was a voice note
    elif input_media_type == "voice_note" or any(w in lower for w in ["voice note", "send an audio", "voice message", "say it out loud"]):
        voice_res = await VoiceService.synthesize_speech(
            text=reply,
            persona_name=name,
            voice_id=persona.get("voice_id"),
            mood_state=mood
        )
        media = {
            "type": "voice_note",
            "url": voice_res.get("audio_url"),
            "data": voice_res
        }

    return {
        "inner_thought": thought,
        "response_text": reply,
        "mood_delta": mood_delta,
        "media_action": media,
    }

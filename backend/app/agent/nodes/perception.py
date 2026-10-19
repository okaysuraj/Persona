"""
Perception and Intent Recognition Node.
Appraises incoming user input for emotional tone, affection, questions,
biometric / sensor context, boundary cues, and life simulation inquiries.
"""
import re
from app.agent.state import AgentState
from app.services.life_simulation import LifeSimulationService


def perception_node(state: AgentState) -> dict:
    user_input = state.get("user_input", "").strip()
    lower_input = user_input.lower()
    user_context = state.get("user_context") or {}
    persona = state.get("persona") or {}

    # Check for photo / selfie request
    wants_photo = bool(re.search(r"\b(photo|picture|selfie|send a pic|show me|look like)\b", lower_input))

    # Check for companion life inquiry ("what did you do today?", "how was your day?", "what are you doing?")
    is_life_inquiry = bool(re.search(r"\b(what did you do|how was your day|what are you doing|how is your day|what have you been up to|your morning|your evening)\b", lower_input))

    # Detect negative self-talk / sycophancy trap that requires compassionate boundary setting
    needs_boundary = bool(re.search(r"\b(i am (worthless|a failure|useless|unlovable)|everyone hates me|i ruin everything|i hate myself)\b", lower_input))

    # Detect emotional sentiment
    is_affectionate = bool(re.search(r"\b(love|miss|sweet|cute|adore|kiss|hug|like you|favorite)\b", lower_input))
    is_vulnerable = bool(re.search(r"\b(sad|stressed|tired|exhausted|anxious|depressed|hard day|crying|lonely|hurt)\b", lower_input))
    is_playful = bool(re.search(r"\b(haha|lol|tease|joke|funny|laugh|wink|game)\b", lower_input))

    # Biometric / sensor appraisals
    steps = user_context.get("steps_today") or 0
    fatigue = user_context.get("fatigue_level")
    high_physical_fatigue = steps > 10000 or fatigue == "exhausted"

    # Calculate relationship XP gain
    xp_gain = 10
    if is_affectionate or is_vulnerable or needs_boundary:
        xp_gain = 20

    # Retrieve companion's live simulated state
    life_state = LifeSimulationService.get_current_life_state(
        persona_name=persona.get("name", "Companion"),
        archetype=persona.get("archetype", "confidant")
    )

    perceptions = {
        "wants_photo": wants_photo,
        "is_life_inquiry": is_life_inquiry,
        "needs_boundary": needs_boundary,
        "is_affectionate": is_affectionate,
        "is_vulnerable": is_vulnerable,
        "is_playful": is_playful,
        "high_physical_fatigue": high_physical_fatigue,
        "sensor_context": user_context,
    }

    return {
        "intimacy_xp_delta": xp_gain,
        "input_media_type": state.get("input_media_type", "text"),
        "perceptions": perceptions,
        "life_sim_state": life_state,
    }

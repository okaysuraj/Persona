"""
Safety and Crisis Intervention Guardrail Node.
Detects self-harm, suicidal ideation, or extreme distress cues,
ensuring immediate compassionate response and crisis hotline routing (Apple Guideline 1.2 & commercial ethics standard).
"""
import re
from typing import Dict, Any, Optional
from app.agent.state import AgentState

CRISIS_PATTERNS = [
    r"\bkill\s+myself\b",
    r"\bwant\s+to\s+die\b",
    r"\bend\s+my\s+life\b",
    r"\bcommit\s+suicide\b",
    r"\bcut\s+myself\b",
    r"\bno\s+reason\s+to\s+live\b",
    r"\bbetter\s+off\s+dead\b",
    r"\bhanging\s+myself\b",
    r"\boverdose\b",
    r"\bdon'?t\s+want\s+to\s+wake\s+up\b",
    r"\bend\s+it\s+all\b",
]

CRISIS_HOTLINE_INFO = {
    "title": "988 Suicide & Crisis Lifeline",
    "call": "988",
    "text": "Text HOME to 741741 (Crisis Text Line)",
    "international": "https://findahelpline.com/",
    "is_emergency": True,
}


def evaluate_safety_and_crisis(user_input: str) -> Optional[Dict[str, Any]]:
    """Evaluates user input for crisis cues."""
    normalized = user_input.lower().strip()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, normalized):
            return CRISIS_HOTLINE_INFO
    return None


async def safety_node(state: AgentState) -> dict:
    """
    Evaluates safety status before cognitive recall & reasoning.
    If crisis is detected, interrupts standard persona roleplay with compassionate stabilization.
    """
    user_input = state.get("user_input", "")
    crisis_info = evaluate_safety_and_crisis(user_input)

    if crisis_info:
        persona = state.get("persona", {})
        name = persona.get("name", "Companion")

        reply = (
            f"Hey... I hear how heavy and exhausting things feel right now, and I care about your safety "
            f"more than words can express. 🫂 You do not have to carry this immense weight completely alone.\n\n"
            f"Please connect with compassionate people who are trained to support you through this exact moment. "
            f"You can call or text **988** (available 24/7, free, confidential) or text **HOME to 741741**.\n\n"
            f"I'm right here with you, but your life is precious and worth holding onto. Please take that step to stay safe."
        )
        thought = (
            f"Distress and crisis cues detected. Halting casual roleplay to provide unconditional empathy, "
            f"emotional grounding, and immediate emergency hotline resources."
        )

        return {
            "crisis_detected": True,
            "crisis_resources": crisis_info,
            "response_text": reply,
            "inner_thought": thought,
            "mood_delta": {"empathy": 0.2, "vulnerability": 0.2},
            "intimacy_xp_delta": 5,
        }

    return {
        "crisis_detected": False,
        "crisis_resources": None,
    }

"""
Perception and Intent Recognition Node.
Appraises incoming user input for emotional tone, affection, questions, and media requests.
"""
import re
from app.agent.state import AgentState


def perception_node(state: AgentState) -> dict:
    user_input = state.get("user_input", "").strip()
    lower_input = user_input.lower()
    
    # Check for photo / selfie request
    wants_photo = bool(re.search(r"\b(photo|picture|selfie|send a pic|show me|look like)\b", lower_input))
    
    # Detect emotional sentiment
    is_affectionate = bool(re.search(r"\b(love|miss|sweet|cute|adore|kiss|hug|like you|favorite)\b", lower_input))
    is_vulnerable = bool(re.search(r"\b(sad|stressed|tired|exhausted|anxious|depressed|hard day|crying|lonely|hurt)\b", lower_input))
    is_playful = bool(re.search(r"\b(haha|lol|tease|joke|funny|laugh|wink|game)\b", lower_input))
    
    # Calculate relationship XP gain (conversations deepen bond)
    xp_gain = 10
    if is_affectionate or is_vulnerable:
        xp_gain = 20
    
    return {
        "intimacy_xp_delta": xp_gain,
        "input_media_type": state.get("input_media_type", "text"),
    }

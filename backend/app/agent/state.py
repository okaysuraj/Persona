"""
LangGraph Cognitive Agent State Schema.
Defines all context accumulated through the perceptual, safety, memory, and reasoning nodes.
"""
from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict):
    # Session identifiers
    user_id: str
    persona_id: str
    conversation_id: str

    # Dialogue inputs
    user_input: str
    input_media_type: str  # 'text', 'voice_note'
    recent_messages: List[Dict[str, str]]

    # Persona configuration & persistent dynamic state
    persona: Dict[str, Any]
    relationship: Dict[str, Any]

    # Safety & Moderation
    crisis_detected: Optional[bool]
    crisis_resources: Optional[Dict[str, Any]]

    # Memory recall outputs
    recalled_memories: List[Dict[str, Any]]
    recalled_facts: List[Dict[str, str]]

    # Agent Cognitive Loop outputs
    inner_thought: Optional[str]
    mood_delta: Dict[str, float]
    intimacy_xp_delta: int
    response_text: str
    media_action: Optional[Dict[str, Any]]  # e.g., {'type': 'selfie', 'url': '...', 'prompt': '...'}

    # SOTA Sensory & Living Autobiography Context
    user_context: Optional[Dict[str, Any]]
    perceptions: Optional[Dict[str, Any]]
    life_sim_state: Optional[Dict[str, Any]]
    vision_data: Optional[Dict[str, Any]]

    # Memory Consolidation
    new_facts_extracted: List[Dict[str, str]]
    episodic_summary: Optional[str]

"""
Memory Recall Node.
Formats retrieved facts and episodic memories into the agent's cognitive context.
"""
from app.agent.state import AgentState


def recall_node(state: AgentState) -> dict:
    recalled_facts = state.get("recalled_facts", [])
    recalled_memories = state.get("recalled_memories", [])
    
    # Format facts into clean bullet points
    facts_formatted = "\n".join(
        [f"- {f.get('category', 'fact').title()}: {f.get('key')} = {f.get('value')}" for f in recalled_facts]
    ) if recalled_facts else "No recorded personal facts yet."

    # Format episodic memories
    memories_formatted = "\n".join(
        [f"- {m.get('summary')} (Significance: {m.get('emotional_significance', 5)}/10)" for m in recalled_memories]
    ) if recalled_memories else "No prior shared emotional memories."

    return {
        "recalled_facts": recalled_facts,
        "recalled_memories": recalled_memories,
    }

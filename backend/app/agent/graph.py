"""
LangGraph Cognitive State Machine for Persona AI.
Compiles the cognitive loop: Perception -> Recall -> Reasoning -> Consolidation.
"""
from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.nodes.perception import perception_node
from app.agent.nodes.recall import recall_node
from app.agent.nodes.reasoning import reasoning_node
from app.agent.nodes.consolidation import consolidation_node

# Construct graph
workflow = StateGraph(AgentState)

# Add cognitive nodes
workflow.add_node("perception", perception_node)
workflow.add_node("recall", recall_node)
workflow.add_node("reasoning", reasoning_node)
workflow.add_node("consolidation", consolidation_node)

# Add edges representing cognitive flow
workflow.add_edge(START, "perception")
workflow.add_edge("perception", "recall")
workflow.add_edge("recall", "reasoning")
workflow.add_edge("reasoning", "consolidation")
workflow.add_edge("consolidation", END)

# Compile executable graph
companion_graph = workflow.compile()

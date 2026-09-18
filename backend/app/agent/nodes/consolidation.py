"""
Memory Consolidation Node.
Extracts new personal user facts and emotional milestones for background persistence.
"""
import re
from typing import List, Dict
from app.agent.state import AgentState


def consolidation_node(state: AgentState) -> dict:
    user_input = state.get("user_input", "")
    new_facts: List[Dict[str, str]] = []
    
    # Heuristics for rule-based fact extraction (augmented by LLM in prod)
    # Pet extraction
    pet_match = re.search(r"(?:i have|my) (?:a\s+)?(dog|cat|puppy|kitten|golden retriever|husky|rabbit)\s+(?:named|is called)\s+([a-zA-Z]+)", user_input, re.IGNORECASE)
    if pet_match:
        new_facts.append({
            "category": "pet",
            "key": f"{pet_match.group(1).lower()} name",
            "value": pet_match.group(2).capitalize()
        })

    # Profession / Role extraction
    job_match = re.search(r"i (?:work as|am a|am an)\s+([a-zA-Z\s]+?)(?:\.|,|\sand|\sfor|$)", user_input, re.IGNORECASE)
    if job_match:
        job_title = job_match.group(1).strip()
        if len(job_title) < 40 and not any(w in job_title.lower() for w in ["bit", "little", "feeling"]):
            new_facts.append({
                "category": "work",
                "key": "occupation",
                "value": job_title.title()
            })

    # Allergy / Preference extraction
    allergy_match = re.search(r"(?:i am|i'm) allergic to\s+([a-zA-Z\s]+)", user_input, re.IGNORECASE)
    if allergy_match:
        new_facts.append({
            "category": "preferences",
            "key": "allergy",
            "value": allergy_match.group(1).strip().lower()
        })

    # Favorite things
    fav_match = re.search(r"my favorite\s+([a-zA-Z]+)\s+is\s+([a-zA-Z\s]+)", user_input, re.IGNORECASE)
    if fav_match:
        new_facts.append({
            "category": "preferences",
            "key": f"favorite {fav_match.group(1).lower()}",
            "value": fav_match.group(2).strip().capitalize()
        })

    # Summary of notable conversation if intimacy XP was high
    summary = None
    if state.get("intimacy_xp_delta", 0) >= 20:
        summary = f"Shared a vulnerable or affectionate moment: '{user_input[:80]}...'"

    return {
        "new_facts_extracted": new_facts,
        "episodic_summary": summary,
    }

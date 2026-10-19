// Memory operations, including the existing offline fallback.
import type { UserFact, EpisodicMemory, TemporalMemoryNode, UserPsychometrics } from '../types';
import { INITIAL_FACTS, INITIAL_MEMORIES } from '../data/demo';
import { STORAGE_FACTS, STORAGE_MEMORIES, getStored, setStored } from './storage';
import { apiFetch, tryRequestJson } from './http';

export const memoryApi = {
  async getUserFacts(personaId: string): Promise<UserFact[]> {
    const data = await tryRequestJson<UserFact[]>(`/memories/facts?persona_id=${personaId}`);
    if (data !== null) return data;
    const facts = getStored(STORAGE_FACTS, INITIAL_FACTS);
    return facts[personaId] || [];
  },

  async deleteUserFact(personaId: string, factId: string): Promise<void> {
    try {
      await apiFetch(`/memories/facts/${factId}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const facts = getStored(STORAGE_FACTS, INITIAL_FACTS);
    if (facts[personaId]) {
      facts[personaId] = facts[personaId].filter((f) => f.id !== factId);
      setStored(STORAGE_FACTS, facts);
    }
  },

  async addUserFact(
    personaId: string,
    category: UserFact['category'],
    key: string,
    value: string
  ): Promise<UserFact> {
    const newFact: UserFact = {
      id: `fact-${Date.now()}`,
      persona_id: personaId,
      category,
      key,
      value,
      confidence: 1.0,
      updated_at: new Date().toISOString(),
    };
    const facts = getStored(STORAGE_FACTS, INITIAL_FACTS);
    facts[personaId] = [newFact, ...(facts[personaId] || [])];
    setStored(STORAGE_FACTS, facts);
    return newFact;
  },

  async getEpisodicMemories(personaId: string): Promise<EpisodicMemory[]> {
    const data = await tryRequestJson<EpisodicMemory[]>(`/memories/episodic?persona_id=${personaId}`);
    if (data !== null) return data;
    const memories = getStored(STORAGE_MEMORIES, INITIAL_MEMORIES);
    return memories[personaId] || [];
  },

  async triggerSleepConsolidation(personaId: string): Promise<any> {
    try {
      const res = await apiFetch(`/memories/sleep-consolidation?persona_id=${personaId}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}

    return {
      persona_id: personaId,
      status: 'completed',
      milestones_consolidated: 2,
      contradictions_resolved: 1,
      temporal_nodes_added: 3,
      psychometrics_updated: true,
      insights_summary: 'Sleep-cycle cognitive consolidation completed. Temporal knowledge graph harmonized with active validity windows.'
    };
  },

  async getTemporalGraph(personaId: string): Promise<TemporalMemoryNode[]> {
    const data = await tryRequestJson<TemporalMemoryNode[]>(`/memories/temporal-graph/${personaId}`);
    if (data !== null) return data;

    const now = new Date();
    return [
      {
        id: `node-${personaId}-1`,
        persona_id: personaId,
        subject: 'User',
        predicate: 'cherishes',
        object: 'Uninterrupted evening silence without unsolicited problem-solving',
        emotional_context: 'Brings profound restoration after chaotic days',
        valid_from: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        is_current: true,
        causal_relation: 'Articulated during late-night reflections',
        confidence: 0.98,
        updated_at: now.toISOString()
      },
      {
        id: `node-${personaId}-2`,
        persona_id: personaId,
        subject: 'User',
        predicate: 'past_strain',
        object: 'Over-committing to client demands at the cost of evening peace',
        emotional_context: 'Created severe burnout and mental dispersion',
        valid_from: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180).toISOString(),
        valid_until: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        is_current: false,
        causal_relation: 'Consciously resolved to establish firm personal boundaries',
        confidence: 0.94,
        updated_at: now.toISOString()
      },
      {
        id: `node-${personaId}-3`,
        persona_id: personaId,
        subject: 'User',
        predicate: 'current_growth',
        object: 'Learning to celebrate quiet micro-progress without guilt',
        emotional_context: 'Nourishes emotional self-reliance',
        valid_from: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        is_current: true,
        causal_relation: 'Nurtured in this sanctuary',
        confidence: 0.96,
        updated_at: now.toISOString()
      }
    ];
  },

  async getUserPsychometrics(personaId: string): Promise<UserPsychometrics> {
    const data = await tryRequestJson<UserPsychometrics>(`/memories/psychometrics/${personaId}`);
    if (data !== null) return data;

    return {
      id: `psych-${personaId}`,
      persona_id: personaId,
      attachment_style: 'secure',
      attachment_score: 0.88,
      love_language: 'words_of_affirmation',
      big_five: {
        openness: 0.86,
        conscientiousness: 0.74,
        extraversion: 0.48,
        agreeableness: 0.92,
        neuroticism: 0.32
      },
      growth_edges: [
        'Giving yourself permission to rest without earning it through exhaustion',
        'Sharing vulnerability early rather than waiting until completely depleted'
      ],
      coping_preferences: [
        'Unhurried breathwork (4-7-8 cycles)',
        'Sensory decompression with rain or fireplace soundscapes',
        'Quiet evening warm tea ritual'
      ],
      last_consolidated_at: new Date().toISOString()
    };
  },
};

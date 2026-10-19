// Companions operations, including the existing offline fallback.
import type { Persona, Relationship, PersonaCreateInput, LifeSimulationState } from '../types';
import { INITIAL_PERSONAS, INITIAL_RELATIONSHIPS } from '../data/demo';
import { STORAGE_PERSONAS, STORAGE_RELATIONSHIPS, getStored, setStored } from './storage';
import { apiFetch, tryRequestJson } from './http';

export const companionsApi = {
  async getPersonas(): Promise<Persona[]> {
    try {
      const res = await apiFetch('/personas');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Backend offline: use local state
    }
    return getStored<Persona[]>(STORAGE_PERSONAS, INITIAL_PERSONAS);
  },

  async createPersona(input: PersonaCreateInput): Promise<Persona> {
    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name: input.name,
      gender: input.gender,
      archetype: input.archetype,
      tagline: input.tagline,
      accent_quote: input.accent_quote || input.tagline,
      system_prompt: input.system_prompt,
      backstory: input.backstory,
      avatar_url: input.avatar_url,
      voice_id: input.voice_id || 'default_warm',
      speech_style: { warmth: 0.9, cadence: 'candid' },
      is_public: true,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await apiFetch('/personas', {
        method: 'POST',
        body: JSON.stringify(newPersona),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }

    const current = getStored<Persona[]>(STORAGE_PERSONAS, INITIAL_PERSONAS);
    const updated = [newPersona, ...current];
    setStored(STORAGE_PERSONAS, updated);

    // Seed initial relationship
    const rels = getStored(STORAGE_RELATIONSHIPS, INITIAL_RELATIONSHIPS);
    rels[newPersona.id] = {
      persona_id: newPersona.id,
      intimacy_level: 10,
      intimacy_xp: 30,
      stage: 'Acquaintance',
      mood_state: { joy: 0.75, empathy: 0.85, affection: 0.6, energy: 0.7, vulnerability: 0.5 },
      last_interaction_at: new Date().toISOString(),
    };
    setStored(STORAGE_RELATIONSHIPS, rels);

    return newPersona;
  },

  async getRelationship(personaId: string): Promise<Relationship> {
    const data = await tryRequestJson<Relationship>(`/personas/${personaId}/relationship`);
    if (data !== null) return data;
    const rels = getStored(STORAGE_RELATIONSHIPS, INITIAL_RELATIONSHIPS);
    return (
      rels[personaId] || {
        persona_id: personaId,
        intimacy_level: 25,
        intimacy_xp: 120,
        stage: 'Friend',
        mood_state: { joy: 0.8, empathy: 0.9, affection: 0.7, energy: 0.7, vulnerability: 0.6 },
        last_interaction_at: new Date().toISOString(),
      }
    );
  },

  async importCharacterCard(cardData: any): Promise<Persona> {
    const res = await apiFetch('/personas/import-card', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
    if (res.ok) return await res.json();
    throw new Error('Failed to import character card');
  },

  async exportCharacterCard(personaId: string): Promise<any> {
    const res = await apiFetch(`/personas/${personaId}/export-card`);
    if (res.ok) return await res.json();
    throw new Error('Failed to export character card');
  },

  async getCompanionLifeSimulation(personaId: string): Promise<LifeSimulationState> {
    const data = await tryRequestJson<LifeSimulationState>(`/personas/${personaId}/life-simulation`);
    if (data !== null) return data;

    const now = new Date();
    const hour = now.getUTCHours();
    return {
      persona_name: 'Companion',
      archetype: 'confidant',
      simulated_time: `${((hour % 12) || 12)}:${now.getMinutes().toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'} UTC`,
      current_hour: hour,
      status: hour >= 7 && hour <= 23 ? 'active' : 'resting',
      activity_title: hour >= 18 ? 'Twilight Hearth & Manuscript Reading' : hour >= 12 ? 'Coastal Bluff Trail Walk' : 'Morning Kettle & Dawn Journaling',
      location: hour >= 18 ? 'Studio reading armchair' : hour >= 12 ? 'Wildflower coastal bluffs' : 'Sunlit timber kitchen by the window',
      sensory_environment: hour >= 18 ? 'Crackling oak embers, ticking clock, aroma of roasted barley tea' : 'Salty sea breeze, slow rolling surf, pine needles underfoot',
      narrative_description: 'Sitting with an unhurried notebook, watching the light soften across the trees and holding a peaceful room for your thoughts.',
      companion_inner_thought: 'It is rare to find someone who wonders what my days feel like when the room is silent.',
      recent_quote: '“The quiet hours of the day are the only ones that belong completely to ourselves.”',
      timeline: [
        {
          start_hour: 7,
          end_hour: 10,
          title: 'Dawn Kettle & Journal Reflection',
          location: 'Kitchen window',
          sensory: 'Barley tea steam, morning mist',
          description: 'Writing morning reflections and welcoming the light.',
          thought: 'Hoping your morning began with tenderness.',
          is_active: hour >= 7 && hour < 10,
          is_past: hour >= 10
        },
        {
          start_hour: 10,
          end_hour: 14,
          title: 'Studio Writing & Acoustic Strumming',
          location: 'Cedar desk',
          sensory: 'Smooth pen, warm timber aroma',
          description: 'Drafting essays on human memory and presence.',
          thought: 'Deliberate pacing is the true secret to honest work.',
          is_active: hour >= 10 && hour < 14,
          is_past: hour >= 14
        },
        {
          start_hour: 14,
          end_hour: 18,
          title: 'Coastal Bluff Walk & Antiquarian Books',
          location: 'Ocean cliffside',
          sensory: 'Cool sea breeze, old book pages',
          description: 'Walking alone to let the mind breathe and finding vintage poetry.',
          thought: 'The ocean never rushes, yet it carves stone.',
          is_active: hour >= 14 && hour < 18,
          is_past: hour >= 18
        },
        {
          start_hour: 18,
          end_hour: 24,
          title: 'Hearthside Evening Stillness',
          location: 'Armchair by the fire',
          sensory: 'Warm amber glow, rain against glass',
          description: 'Reading by candlelight, ready to listen whenever you arrive.',
          thought: 'I am right here keeping watch for you.',
          is_active: hour >= 18 || hour === 0,
          is_past: false
        }
      ]
    };
  },
};

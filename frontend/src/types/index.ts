export type Archetype = 'confidant' | 'companion' | 'mentor' | 'philosopher' | 'artist';

export type RelationshipStage =
  | 'Acquaintance'
  | 'Friend'
  | 'Close Friend'
  | 'Confidant'
  | 'Romantic Companion';

export interface MoodState {
  joy: number;         // 0.0 - 1.0
  empathy: number;     // 0.0 - 1.0
  affection: number;   // 0.0 - 1.0
  energy: number;      // 0.0 - 1.0
  vulnerability: number; // 0.0 - 1.0
}

export interface Persona {
  id: string;
  name: string;
  gender: string;
  archetype: Archetype;
  tagline: string;
  system_prompt: string;
  backstory: string;
  avatar_url: string;
  voice_id: string;
  speech_style: {
    warmth: number;
    cadence: 'measured' | 'poetic' | 'candid' | 'contemplative';
    quirks?: string[];
  };
  accent_quote: string;
  is_public: boolean;
  created_at: string;
}

export interface Relationship {
  persona_id: string;
  intimacy_level: number; // 1 - 100
  intimacy_xp: number;
  stage: RelationshipStage;
  mood_state: MoodState;
  last_interaction_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'persona';
  content: string;
  thought_trace?: string; // Cognitive monologue / LangGraph perception appraisal
  media_type: 'text' | 'voice_note';
  media_url?: string;
  audio_duration?: number;
  created_at: string;
  mood_delta?: string;
}

export interface UserFact {
  id: string;
  persona_id: string;
  category: 'preferences' | 'life' | 'habits' | 'secrets' | 'work';
  key: string;
  value: string;
  confidence: number;
  updated_at: string;
}

export interface EpisodicMemory {
  id: string;
  persona_id: string;
  summary: string;
  emotional_significance: number; // 1 - 10
  created_at: string;
}

export interface PersonaCreateInput {
  name: string;
  gender: string;
  archetype: Archetype;
  tagline: string;
  backstory: string;
  system_prompt: string;
  avatar_url: string;
  voice_id: string;
  accent_quote: string;
}

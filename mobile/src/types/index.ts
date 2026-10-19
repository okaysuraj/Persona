// Data exchanged with the backend and used by companion screens.
export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface AuthResponse {
  access_token: string;
  user_id: string;
  display_name: string;
}

export interface Persona {
  id: string;
  name: string;
  gender: string;
  archetype: string;
  tagline?: string;
  accent_quote?: string;
  system_prompt: string;
  backstory: string;
  avatar_url: string;
  voice_id: string;
  speech_style: Record<string, any>;
}

export interface Relationship {
  persona_id: string;
  intimacy_level: number;
  intimacy_xp: number;
  stage: string;
  mood_state: Record<string, number>;
  last_interaction_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'assistant' | 'persona' | 'system';
  content: string;
  thought_trace?: string;
  media_type: string;
  media_url?: string;
  metadata_json?: Record<string, any>;
  created_at: string;
}

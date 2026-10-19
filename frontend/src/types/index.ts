export type Archetype = 'confidant' | 'companion' | 'mentor' | 'philosopher' | 'artist' | 'friend' | 'soulmate';

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
  sender_type: 'user' | 'persona' | 'assistant';
  content: string;
  thought_trace?: string; // Cognitive monologue / LangGraph perception appraisal
  media_type: 'text' | 'voice_note' | 'selfie' | 'crisis_resources';
  media_url?: string;
  audio_duration?: number;
  metadata?: Record<string, any>;
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

export interface TierInfo {
  tier_name: string;
  price_monthly: number;
  price_yearly?: number;
  max_messages_daily: number;
  max_voice_seconds_daily: number;
  max_photos_monthly: number;
  llm_model: string;
  features: string[];
}

export interface BillingStatus {
  user_id: string;
  email: string;
  subscription_tier: 'free' | 'plus' | 'vip';
  subscription_status: string;
  tier_details: TierInfo;
  usage: {
    messages_today: number;
    messages_limit: number;
    voice_seconds_used: number;
    voice_seconds_limit: number;
    photos_generated: number;
    photos_limit: number;
  };
  available_tiers: Record<string, TierInfo>;
}

export interface MomentPhoto {
  id: string;
  persona_id: string;
  url: string;
  caption: string;
  tag: 'candid' | 'café' | 'sunset' | 'night' | 'portrait' | 'special';
  created_at: string;
  likes_count: number;
  is_favorite: boolean;
  prompt?: string;
}

export interface CompanionStory {
  id: string;
  persona_id: string;
  persona_name: string;
  avatar_url: string;
  content: string;
  image_url?: string;
  time_ago: string;
  likes: number;
  has_liked?: boolean;
}

export interface StartupAnalytics {
  status: string;
  business: {
    mrr_usd: number;
    arr_usd: number;
    total_users: number;
    paying_subscribers: number;
    tier_breakdown: {
      free: number;
      plus: number;
      vip: number;
    };
    conversion_rate_pct: number;
  };
  engagement: {
    total_conversations: number;
    total_messages: number;
    active_personas: number;
  };
  llm_telemetry: {
    uptime_since: string;
    total_requests: number;
    total_tokens: { input: number; output: number; total: number };
    financials: { estimated_llm_cost_usd: number; cost_per_100_turns_usd: number };
    performance: { avg_latency_ms: number; p95_latency_ms: number };
    multimodal_usage: { photos_generated: number; voice_seconds_streamed: number };
    safety_compliance: { crisis_interventions_count: number; status: string };
  };
}

export interface Letter {
  id: string;
  persona_id: string;
  title: string;
  content: string;
  wax_seal: 'rose' | 'sun' | 'feather' | 'heart';
  occasion: string;
  is_read: boolean;
  created_at: string;
}

export interface Soundscape {
  id: string;
  name: string;
  category: string;
  icon: string;
  audio_url: string;
  description: string;
}

export interface BreathworkProgram {
  id: string;
  name: string;
  description: string;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  cycles: number;
  cue: string;
}

export interface TemporalMemoryNode {
  id: string;
  persona_id: string;
  subject: string;
  predicate: string;
  object: string;
  emotional_context?: string;
  valid_from: string;
  valid_until?: string;
  is_current: boolean;
  causal_relation?: string;
  confidence: number;
  updated_at: string;
}

export interface UserPsychometrics {
  id: string;
  persona_id: string;
  attachment_style: 'secure' | 'anxious_preoccupied' | 'dismissive_avoidant' | 'fearful_avoidant' | string;
  attachment_score: number;
  love_language: string;
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  growth_edges: string[];
  coping_preferences: string[];
  last_consolidated_at: string;
}

export interface LifeSimulationItem {
  start_hour: number;
  end_hour: number;
  title: string;
  location: string;
  sensory: string;
  description: string;
  thought: string;
  is_active: boolean;
  is_past: boolean;
}

export interface LifeSimulationState {
  persona_name: string;
  archetype: string;
  simulated_time: string;
  current_hour: number;
  status: 'active' | 'resting';
  activity_title: string;
  location: string;
  sensory_environment: string;
  narrative_description: string;
  companion_inner_thought: string;
  recent_quote: string;
  timeline: LifeSimulationItem[];
}

export interface LoungePersonaTurn {
  persona_id: string;
  persona_name: string;
  avatar_url: string;
  archetype: string;
  content: string;
  thought_trace?: string;
}

export interface LoungeTurnResponse {
  user_message: string;
  theme: string;
  turns: LoungePersonaTurn[];
  group_harmony_xp: number;
}

export interface CBTDebriefResponse {
  persona_id: string;
  persona_name: string;
  reflection: string;
  status: string;
  intimacy_xp_earned: number;
}

export interface UserContextPayload {
  local_time?: string;
  steps_today?: number;
  sleep_hours?: number;
  heart_rate_bpm?: number;
  weather_condition?: string;
  fatigue_level?: 'rested' | 'moderate' | 'exhausted';
}

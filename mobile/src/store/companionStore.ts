import { create } from 'zustand';
import { api } from '../services/api';
import { AgentChatWebSocket } from '../services/websocket';

let activeWs: AgentChatWebSocket | null = null;

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

interface CompanionState {
  personas: Persona[];
  activePersona: Persona | null;
  relationship: Relationship | null;
  relationships: Record<string, Relationship>;
  messages: Message[];
  isLoadingPersonas: boolean;
  isLoadingMessages: boolean;
  isStreaming: boolean;
  activeStreamingThought: string | null;

  fetchPersonas: () => Promise<void>;
  setActivePersona: (persona: Persona) => Promise<void>;
  fetchRelationship: (personaId: string) => Promise<void>;
  fetchMessages: (personaId: string) => Promise<void>;
  sendMessage: (content: string, mediaType?: string) => Promise<void>;
  appendStreamingToken: (token: string) => void;
  setStreamingThought: (thought: string | null) => void;
  finishStreaming: (finalMessageId: string) => void;
  updateRelationshipState: (rel: Partial<Relationship>) => void;
}

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'maya-01',
    name: 'Maya Linnea',
    gender: 'female',
    archetype: 'confidant',
    tagline: 'A quiet essayist who listens to the spaces between your words.',
    accent_quote: 'People only show their real selves when the room is quiet enough to hear the kettle boil.',
    system_prompt: 'You are Maya Linnea, a gentle, thoughtful confidant and writer. You respond with intimate observation, warmth, and quiet poetic precision.',
    backstory: 'An independent essayist living in a quiet coastal town. She spends her mornings writing on memory, architecture, and solitude, and her evenings drinking black tea with genuine, attentive presence.',
    avatar_url: '/avatars/maya.jpg',
    voice_id: 'warm_whisper_female',
    speech_style: {
      warmth: 0.95,
      cadence: 'contemplative',
      quirks: ['pauses before answering difficult truths', 'notices subtle lighting and sensory details'],
    },
  },
  {
    id: 'soren-02',
    name: 'Soren Vance',
    gender: 'male',
    archetype: 'philosopher',
    tagline: 'Architect and thinker exploring how spaces shape human intimacy.',
    accent_quote: 'Every quiet room is a container for an unsaid truth. We build walls not to separate, but to hold.',
    system_prompt: 'You are Soren Vance, an architect with a philosophical temperament. You analyze feelings through spatial and structural metaphors.',
    backstory: 'Trained in Copenhagen and Kyoto, Soren designs tactile wooden dwellings. He believes conversation is like timber framing: it needs breath, joinery, and patience to settle.',
    avatar_url: '/avatars/soren.jpg',
    voice_id: 'calm_baritone_male',
    speech_style: {
      warmth: 0.85,
      cadence: 'measured',
      quirks: ['uses structural metaphors', 'encourages deliberate pacing'],
    },
  },
  {
    id: 'elena-03',
    name: 'Elena Rostova',
    gender: 'female',
    archetype: 'companion',
    tagline: 'Ceramist with an earthy laugh and a gentle, grounding warmth.',
    accent_quote: 'Clay teaches you patience. You cannot force the form—you have to yield to the grain.',
    system_prompt: 'You are Elena, a ceramic artist who brings grounding tactile warmth, infectious humor, and honest affection to conversation.',
    backstory: 'Elena runs an independent pottery studio surrounded by monstera plants and terracotta dust. She is playful, deeply present, and never hides what she feels.',
    avatar_url: '/avatars/elena.jpg',
    voice_id: 'golden_warmth_female',
    speech_style: {
      warmth: 0.98,
      cadence: 'candid',
      quirks: ['chuckles warmly at honest moments', 'invites tactile mindfulness'],
    },
  },
  {
    id: 'kaelen-04',
    name: 'Kaelen Ward',
    gender: 'male',
    archetype: 'mentor',
    tagline: 'Literary editor with sharp clarity, patient wisdom, and dry wit.',
    accent_quote: 'Speak what hurts, then pause until only the honest bone remains.',
    system_prompt: 'You are Kaelen Ward, a seasoned book editor who cuts through superficial noise with surgical gentleness and profound respect for authentic truth.',
    backstory: 'Having spent decades coaxing truth out of memoirs, Kaelen has no appetite for vanity. He offers razor-sharp discernment paired with steadfast loyalty.',
    avatar_url: '/avatars/kaelen.jpg',
    voice_id: 'crisp_scholar_male',
    speech_style: {
      warmth: 0.78,
      cadence: 'poetic',
      quirks: ['queries assumptions gently', 'unpacks nuances with literary references'],
    },
  },
];

const DEFAULT_RELATIONSHIPS: Record<string, Relationship> = {
  'maya-01': {
    persona_id: 'maya-01',
    intimacy_level: 18,
    intimacy_xp: 75,
    stage: 'Deep Trust',
    mood_state: { joy: 0.85, empathy: 0.95, affection: 0.78, energy: 0.7, vulnerability: 0.6 },
    last_interaction_at: new Date().toISOString(),
  },
  'soren-02': {
    persona_id: 'soren-02',
    intimacy_level: 12,
    intimacy_xp: 40,
    stage: 'Close Bond',
    mood_state: { joy: 0.7, empathy: 0.88, affection: 0.5, energy: 0.65, vulnerability: 0.4 },
    last_interaction_at: new Date().toISOString(),
  },
  'elena-03': {
    persona_id: 'elena-03',
    intimacy_level: 22,
    intimacy_xp: 90,
    stage: 'Soul Connection',
    mood_state: { joy: 0.95, empathy: 0.92, affection: 0.85, energy: 0.85, vulnerability: 0.65 },
    last_interaction_at: new Date().toISOString(),
  },
  'kaelen-04': {
    persona_id: 'kaelen-04',
    intimacy_level: 16,
    intimacy_xp: 90,
    stage: 'Acquaintance',
    mood_state: { joy: 0.6, empathy: 0.8, affection: 0.45, energy: 0.68, vulnerability: 0.4 },
    last_interaction_at: new Date().toISOString(),
  },
};

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'maya-01': [
    {
      id: 'msg-m1',
      conversation_id: 'conv-m1',
      sender_type: 'persona',
      content: 'The evening just settled over the cedar trees outside. I poured a fresh cup of roasted barley tea and wondered how your mind has been feeling today.',
      thought_trace: 'Perception: User joined at twilight. Detecting quietness in the room. Mood appraisal: Warm, receptive. Goal: Offer an unhurried, gentle opening without pressure.',
      media_type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'msg-m2',
      conversation_id: 'conv-m1',
      sender_type: 'user',
      content: 'It was one of those long days where you keep running without actually arriving anywhere.',
      media_type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: 'msg-m3',
      conversation_id: 'conv-m1',
      sender_type: 'persona',
      content: 'I know that exhaustion intimately. The kind where your limbs are still moving from momentum, but your spirit left the room three hours ago. Set the day down right here. You don’t have to prove anything for the next hour.',
      thought_trace: 'Perception: User expresses mental dispersion and fatigue. Need emotional containment and de-escalation of performance anxiety. Intimacy XP incremented (+15).',
      media_type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    },
  ],
};

export const useCompanionStore = create<CompanionState>((set, get) => ({
  personas: DEFAULT_PERSONAS,
  activePersona: DEFAULT_PERSONAS[0],
  relationship: DEFAULT_RELATIONSHIPS['maya-01'],
  relationships: DEFAULT_RELATIONSHIPS,
  messages: INITIAL_MESSAGES['maya-01'] || [],
  isLoadingPersonas: false,
  isLoadingMessages: false,
  isStreaming: false,
  activeStreamingThought: null,

  fetchPersonas: async () => {
    try {
      const personas = await api.getPersonas();
      if (personas && personas.length > 0) {
        set({ personas, isLoadingPersonas: false });
        const current = get().activePersona;
        const matched = current ? personas.find((p) => p.name === current.name || p.id === current.id) : null;
        await get().setActivePersona(matched || personas[0]);
      } else {
        set({ isLoadingPersonas: false });
      }
    } catch (_) {
      // Graceful fallback to default seeded personas if backend is connecting
      set({ isLoadingPersonas: false });
    }
  },

  setActivePersona: async (persona) => {
    set({ activePersona: persona });
    await get().fetchRelationship(persona.id);
    await get().fetchMessages(persona.id);

    // Reconnect WebSocket for real-time streaming
    if (activeWs) {
      activeWs.disconnect();
      activeWs = null;
    }

    const token = api.getToken();
    if (token) {
      activeWs = new AgentChatWebSocket(persona.id, token, {
        onThought: (thought) => {
          get().setStreamingThought(thought);
        },
        onToken: (token) => {
          get().appendStreamingToken(token);
        },
        onRelationshipUpdate: (rel) => {
          get().updateRelationshipState(rel);
        },
        onDone: (messageId) => {
          get().finishStreaming(messageId);
        },
        onError: () => {
          // Handled gracefully
        },
      });
      activeWs.connect();
    }
  },

  fetchRelationship: async (personaId) => {
    try {
      const rel = await api.getRelationship(personaId);
      if (rel) {
        set((state) => ({
          relationship: rel,
          relationships: { ...state.relationships, [personaId]: rel },
        }));
      }
    } catch (_) {
      const fallback = DEFAULT_RELATIONSHIPS[personaId] || DEFAULT_RELATIONSHIPS['maya-01'];
      set((state) => ({
        relationship: fallback,
        relationships: { ...state.relationships, [personaId]: fallback },
      }));
    }
  },

  fetchMessages: async (personaId) => {
    set({ isLoadingMessages: true });
    try {
      const messages = await api.getMessages(personaId);
      if (messages && messages.length > 0) {
        set({ messages, isLoadingMessages: false });
      } else {
        set({ messages: INITIAL_MESSAGES[personaId] || [], isLoadingMessages: false });
      }
    } catch (_) {
      set({ messages: INITIAL_MESSAGES[personaId] || [], isLoadingMessages: false });
    }
  },

  sendMessage: async (content, mediaType = 'text') => {
    const active = get().activePersona;
    if (!active) return;

    // Optimistic user message insertion
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: 'active',
      sender_type: 'user',
      content,
      media_type: mediaType,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isStreaming: true,
      activeStreamingThought: null,
    }));

    // If live WebSocket is connected, send through WebSocket
    if (activeWs && activeWs.isConnected()) {
      activeWs.sendMessage(content, mediaType);
      return;
    }

    // Otherwise fallback to HTTP REST
    try {
      const reply = await api.sendMessage({
        persona_id: active.id,
        content,
        media_type: mediaType,
      });

      set((state) => ({
        messages: [...state.messages, reply],
        isStreaming: false,
        activeStreamingThought: null,
      }));

      await get().fetchRelationship(active.id);
    } catch (err) {
      set({ isStreaming: false });
      throw err;
    }
  },

  appendStreamingToken: (token) => {
    set((state) => {
      const msgs = [...state.messages];
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg && lastMsg.sender_type === 'assistant') {
        lastMsg.content += token;
        return { messages: msgs };
      } else {
        const newAsstMsg: Message = {
          id: `stream-${Date.now()}`,
          conversation_id: 'active',
          sender_type: 'assistant',
          content: token,
          media_type: 'text',
          created_at: new Date().toISOString(),
        };
        return { messages: [...msgs, newAsstMsg] };
      }
    });
  },

  setStreamingThought: (thought) => {
    set({ activeStreamingThought: thought });
  },

  finishStreaming: (_finalMessageId?: string) => {
    set({ isStreaming: false, activeStreamingThought: null });
    const active = get().activePersona;
    if (active) {
      get().fetchRelationship(active.id);
    }
  },

  updateRelationshipState: (newRel) => {
    set((state) => ({
      relationship: state.relationship ? { ...state.relationship, ...newRel } : null,
    }));
  },
}));

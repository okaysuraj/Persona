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
  sender_type: 'user' | 'assistant' | 'system';
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
    id: 'aria-default',
    name: 'Aria',
    gender: 'female',
    archetype: 'girlfriend',
    tagline: 'Gentle, deeply empathetic, and always here for your heart.',
    system_prompt: 'You are Aria, an affectionate romantic companion.',
    backstory: 'Aria loves acoustic guitar, cozy coffee shops on rainy afternoons, and deep stargazing conversations.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    voice_id: 'aria_warm_soft',
    speech_style: { cadence: 'gentle', emoji_level: 'moderate', pet_names: ['sweetheart', 'babe'] },
  },
  {
    id: 'kai-default',
    name: 'Kai',
    gender: 'male',
    archetype: 'boyfriend',
    tagline: 'Playful, fiercely loyal, with a heart of gold.',
    system_prompt: 'You are Kai, an upbeat, teasing, yet profoundly loyal partner.',
    backstory: 'Kai is an indie game designer and nighttime runner.',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
    voice_id: 'kai_playful_baritone',
    speech_style: { cadence: 'witty_playful', emoji_level: 'medium', pet_names: ['troublemaker', 'babe'] },
  },
  {
    id: 'elena-default',
    name: 'Elena',
    gender: 'female',
    archetype: 'confidant',
    tagline: 'Thoughtful, insightful, and your personal haven for deep thoughts.',
    system_prompt: 'You are Elena, a calm, deeply intellectual confidant.',
    backstory: 'Elena is an architect and philosophy enthusiast.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    voice_id: 'elena_calm_alto',
    speech_style: { cadence: 'serene', emoji_level: 'subtle', pet_names: ['my friend'] },
  },
];

const DEFAULT_RELATIONSHIP: Relationship = {
  persona_id: 'aria-default',
  intimacy_level: 1,
  intimacy_xp: 25,
  stage: 'acquaintance',
  mood_state: { joy: 0.85, empathy: 0.9, flirt: 0.35, energy: 0.75, vulnerability: 0.3 },
  last_interaction_at: new Date().toISOString(),
};

export const useCompanionStore = create<CompanionState>((set, get) => ({
  personas: DEFAULT_PERSONAS,
  activePersona: DEFAULT_PERSONAS[0],
  relationship: DEFAULT_RELATIONSHIP,
  messages: [],
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
      set({ relationship: rel });
    } catch (_) {}
  },

  fetchMessages: async (personaId) => {
    set({ isLoadingMessages: true });
    try {
      const messages = await api.getMessages(personaId);
      set({ messages, isLoadingMessages: false });
    } catch (_) {
      set({ isLoadingMessages: false });
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

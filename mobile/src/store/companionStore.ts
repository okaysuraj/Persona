import type { Persona, Relationship, Message } from '../types';
import { DEFAULT_PERSONAS, DEFAULT_RELATIONSHIPS, INITIAL_MESSAGES } from '../data/demo';
import { create } from 'zustand';
import { api } from '../services/api';
import { AgentChatWebSocket } from '../services/websocket';

let activeWs: AgentChatWebSocket | null = null;

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

// Owns companion selection, conversation state, and the active streaming connection.
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

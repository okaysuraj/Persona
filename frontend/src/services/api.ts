import type {
  Persona,
  Relationship,
  Message,
  UserFact,
  EpisodicMemory,
  PersonaCreateInput,
} from '../types';

// Default curated personas with authentic portraits
const INITIAL_PERSONAS: Persona[] = [
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
    is_public: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
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
    is_public: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
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
    is_public: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
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
    is_public: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

const INITIAL_RELATIONSHIPS: Record<string, Relationship> = {
  'maya-01': {
    persona_id: 'maya-01',
    intimacy_level: 48,
    intimacy_xp: 340,
    stage: 'Close Friend',
    mood_state: { joy: 0.82, empathy: 0.96, affection: 0.74, energy: 0.65, vulnerability: 0.88 },
    last_interaction_at: new Date().toISOString(),
  },
  'soren-02': {
    persona_id: 'soren-02',
    intimacy_level: 28,
    intimacy_xp: 180,
    stage: 'Friend',
    mood_state: { joy: 0.7, empathy: 0.85, affection: 0.6, energy: 0.72, vulnerability: 0.55 },
    last_interaction_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  'elena-03': {
    persona_id: 'elena-03',
    intimacy_level: 72,
    intimacy_xp: 680,
    stage: 'Confidant',
    mood_state: { joy: 0.92, empathy: 0.94, affection: 0.9, energy: 0.85, vulnerability: 0.78 },
    last_interaction_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  'kaelen-04': {
    persona_id: 'kaelen-04',
    intimacy_level: 16,
    intimacy_xp: 90,
    stage: 'Acquaintance',
    mood_state: { joy: 0.6, empathy: 0.8, affection: 0.45, energy: 0.68, vulnerability: 0.4 },
    last_interaction_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
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
  'soren-02': [
    {
      id: 'msg-s1',
      conversation_id: 'conv-s1',
      sender_type: 'persona',
      content: 'I was just reviewing plans for an atrium. When you leave an intentional void in the center of a structure, the whole building learns to breathe. How is the structure of your week holding up?',
      thought_trace: 'Cognitive Appraisal: Framing discussion around balance and cognitive architecture.',
      media_type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  'elena-03': [
    {
      id: 'msg-e1',
      conversation_id: 'conv-e1',
      sender_type: 'persona',
      content: 'I have terracotta slip all over my thumbs, but I had to say hi! Did you ever get that warm broth you were craving earlier?',
      thought_trace: 'Perception: High affection, remembering sensory detail from previous conversation.',
      media_type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
  'kaelen-04': [
    {
      id: 'msg-k1',
      conversation_id: 'conv-k1',
      sender_type: 'persona',
      content: 'Good evening. I hope you aren’t letting minor complications masquerade as catastrophes today.',
      thought_trace: 'Perception: Direct, anchoring tone. Checking resilience.',
      media_type: 'text',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ],
};

const INITIAL_FACTS: Record<string, UserFact[]> = {
  'maya-01': [
    {
      id: 'fact-1',
      persona_id: 'maya-01',
      category: 'preferences',
      key: 'Evening beverage',
      value: 'Loves roasted barley or chamomile tea when reading late',
      confidence: 0.95,
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'fact-2',
      persona_id: 'maya-01',
      category: 'habits',
      key: 'Creative rhythm',
      value: 'Works best in long, uninterrupted blocks of morning silence',
      confidence: 0.88,
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: 'fact-3',
      persona_id: 'maya-01',
      category: 'secrets',
      key: 'Deepest comfort',
      value: 'Finds comfort in handwritten notes and the sound of rainfall against glass',
      confidence: 0.99,
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
  ],
  'soren-02': [
    {
      id: 'fact-4',
      persona_id: 'soren-02',
      category: 'preferences',
      key: 'Aesthetic sensibility',
      value: 'Appreciates tactile natural materials like unvarnished oak and washed linen',
      confidence: 0.9,
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
  ],
  'elena-03': [
    {
      id: 'fact-5',
      persona_id: 'elena-03',
      category: 'life',
      key: 'Current challenge',
      value: 'Balancing demanding creative projects with mental rest',
      confidence: 0.92,
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  ],
};

const INITIAL_MEMORIES: Record<string, EpisodicMemory[]> = {
  'maya-01': [
    {
      id: 'mem-1',
      persona_id: 'maya-01',
      summary: 'Shared a quiet rainy evening discussing the fear of wasting time, concluding that time spent in reflection is never lost.',
      emotional_significance: 9,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: 'mem-2',
      persona_id: 'maya-01',
      summary: 'You opened up about feeling disconnected at work; Maya listened and promised to check in the following afternoon.',
      emotional_significance: 8,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
  ],
  'elena-03': [
    {
      id: 'mem-3',
      persona_id: 'elena-03',
      summary: 'Laughed together over a failed cooking experiment and shared recipes for warm sourdough and lentil soup.',
      emotional_significance: 7,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
  ],
};

// Storage keys
const STORAGE_PERSONAS = 'persona_web_personas';
const STORAGE_RELATIONSHIPS = 'persona_web_relationships';
const STORAGE_MESSAGES = 'persona_web_messages';
const STORAGE_FACTS = 'persona_web_facts';
const STORAGE_MEMORIES = 'persona_web_memories';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export const api = {
  async getPersonas(): Promise<Persona[]> {
    try {
      const res = await fetch('/api/personas');
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
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      const res = await fetch(`/api/personas/${personaId}/relationship`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
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

  async getMessages(personaId: string): Promise<Message[]> {
    try {
      const res = await fetch(`/api/chat/messages?persona_id=${personaId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const messages = getStored(STORAGE_MESSAGES, INITIAL_MESSAGES);
    return messages[personaId] || [];
  },

  async sendMessage(
    persona: Persona,
    content: string,
    onToken?: (token: string) => void
  ): Promise<Message> {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      conversation_id: `conv-${persona.id}`,
      sender_type: 'user',
      content,
      media_type: 'text',
      created_at: new Date().toISOString(),
    };

    // Store user message
    const allMsgs = getStored(STORAGE_MESSAGES, INITIAL_MESSAGES);
    const personaMsgs = allMsgs[persona.id] || [];
    personaMsgs.push(userMsg);
    allMsgs[persona.id] = personaMsgs;
    setStored(STORAGE_MESSAGES, allMsgs);

    // Simulate LangGraph perception node:
    // Generate thought trace and nuanced reply
    const cognitiveAppraisals = [
      `Perception: User shares vulnerability regarding "${content.slice(0, 30)}...". Emotional valence: reflective. Mood update: Empathy +0.05, Affection +0.04. Intimacy XP +15.`,
      `Inner Monologue: I want to hold space for what wasn't said directly. User sounds tired yet open. Avoid advice; offer companionship.`,
      `Perception: User is inquiring deeply. Cadence should remain unhurried and tactile. Recalling memory of their quiet preferences.`,
    ];
    const thoughtTrace = cognitiveAppraisals[Math.floor(Math.random() * cognitiveAppraisals.length)];

    // Generate responsive reply based on persona
    let replyText = '';
    if (persona.id === 'maya-01') {
      replyText = `I hear you so clearly. There is something profoundly restorative about naming that out loud. When you speak about ${content.slice(0, 24).toLowerCase()}, I find myself thinking about how much patience we often deny ourselves. Take a slow sip of whatever warm cup you have near you right now.`;
    } else if (persona.id === 'soren-02') {
      replyText = `That resonates with how I think about tension in architecture. What you described is not a failure of will—it is simply a material bearing a load it was never designed to carry alone. What would it look like to distribute that weight today?`;
    } else if (persona.id === 'elena-03') {
      replyText = `Oh, you have no idea how much I needed to hear you share that! It’s like when the wheel is spinning fast and you just have to center your palms and breathe into the clay. You are doing so much better than you give yourself credit for, you know?`;
    } else {
      replyText = `Honesty is rare, and that was direct. Let's look at the core of it: you've articulated the exact pressure point. The question now is not how to eliminate it overnight, but how to walk through it with your dignity intact.`;
    }

    // Stream tokens to simulate real-time generation
    if (onToken) {
      const words = replyText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 45));
        onToken(words[i] + ' ');
      }
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      conversation_id: `conv-${persona.id}`,
      sender_type: 'persona',
      content: replyText,
      thought_trace: thoughtTrace,
      media_type: 'text',
      created_at: new Date().toISOString(),
    };

    personaMsgs.push(aiMsg);
    allMsgs[persona.id] = personaMsgs;
    setStored(STORAGE_MESSAGES, allMsgs);

    // Update intimacy and relationship
    const rels = getStored(STORAGE_RELATIONSHIPS, INITIAL_RELATIONSHIPS);
    const currentRel = rels[persona.id] || {
      persona_id: persona.id,
      intimacy_level: 20,
      intimacy_xp: 50,
      stage: 'Friend',
      mood_state: { joy: 0.8, empathy: 0.9, affection: 0.7, energy: 0.7, vulnerability: 0.6 },
      last_interaction_at: new Date().toISOString(),
    };

    currentRel.intimacy_xp += 18;
    if (currentRel.intimacy_xp >= 100 * (currentRel.intimacy_level / 10)) {
      currentRel.intimacy_level = Math.min(100, currentRel.intimacy_level + 1);
      if (currentRel.intimacy_level >= 80) currentRel.stage = 'Romantic Companion';
      else if (currentRel.intimacy_level >= 60) currentRel.stage = 'Confidant';
      else if (currentRel.intimacy_level >= 35) currentRel.stage = 'Close Friend';
      else if (currentRel.intimacy_level >= 15) currentRel.stage = 'Friend';
    }
    currentRel.last_interaction_at = new Date().toISOString();
    rels[persona.id] = currentRel;
    setStored(STORAGE_RELATIONSHIPS, rels);

    return aiMsg;
  },

  async getUserFacts(personaId: string): Promise<UserFact[]> {
    try {
      const res = await fetch(`/api/memory/facts?persona_id=${personaId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const facts = getStored(STORAGE_FACTS, INITIAL_FACTS);
    return facts[personaId] || [];
  },

  async deleteUserFact(personaId: string, factId: string): Promise<void> {
    try {
      await fetch(`/api/memory/facts/${factId}`, { method: 'DELETE' });
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
    try {
      const res = await fetch(`/api/memory/episodic?persona_id=${personaId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const memories = getStored(STORAGE_MEMORIES, INITIAL_MEMORIES);
    return memories[personaId] || [];
  },
};

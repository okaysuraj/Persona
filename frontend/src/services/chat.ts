// Chat operations, including the existing offline fallback.
import type { Persona, Message, UserContextPayload } from '../types';
import { INITIAL_RELATIONSHIPS, INITIAL_MESSAGES } from '../data/demo';
import { STORAGE_RELATIONSHIPS, STORAGE_MESSAGES, getStored, setStored } from './storage';
import { tryRequestJson } from './http';

export const chatApi = {
  async getMessages(personaId: string): Promise<Message[]> {
    const data = await tryRequestJson<Message[]>(`/chat/messages?persona_id=${personaId}`);
    if (data !== null) return data;
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

    const lower = content.toLowerCase();

    // 1. Safety & Crisis Intervention Check (988 Hotline)
    const isCrisis = [
      'kill myself', 'want to die', 'end my life', 'commit suicide',
      'cut myself', 'no reason to live', 'better off dead'
    ].some((pattern) => lower.includes(pattern));

    if (isCrisis) {
      const crisisReply = `Hey... I hear how heavy and overwhelming everything feels right now, and I care about your safety with my whole heart. 🫂 You do not have to carry this immense weight all alone.\n\nPlease reach out to compassionate people who are ready to support you right this second:\n• Call or Text 988 (Available 24/7, free, confidential)\n• Text HOME to 741741 to reach Crisis Text Line\n\nI am right here holding space with you, but your life is precious and worth protecting. Please reach out to them.`;

      if (onToken) {
        for (const word of crisisReply.split(' ')) {
          await new Promise((r) => setTimeout(r, 20));
          onToken(word + ' ');
        }
      }

      const crisisMsg: Message = {
        id: `ai-${Date.now()}`,
        conversation_id: `conv-${persona.id}`,
        sender_type: 'persona',
        content: crisisReply,
        thought_trace: 'Crisis cues detected. Interrupted casual roleplay to provide immediate empathetic stabilization and 988 emergency resources.',
        media_type: 'crisis_resources',
        metadata: {
          hotline_name: '988 Suicide & Crisis Lifeline',
          hotline_number: '988',
          text_number: '741741',
          url: 'https://988lifeline.org/'
        },
        created_at: new Date().toISOString(),
      };
      personaMsgs.push(crisisMsg);
      allMsgs[persona.id] = personaMsgs;
      setStored(STORAGE_MESSAGES, allMsgs);
      return crisisMsg;
    }

    // 2. Photo / Selfie Intent
    const isPhotoRequest = ['photo', 'selfie', 'picture', 'portrait', 'snapshot', 'moment'].some((w) => lower.includes(w));

    // 3. Voice Note Intent
    const isVoiceRequest = ['voice note', 'audio message', 'speak to me', 'say something out loud'].some((w) => lower.includes(w));

    const cognitiveAppraisals = [
      `Perception: User shares vulnerability regarding "${content.slice(0, 30)}...". Emotional valence: reflective. Mood update: Empathy +0.05, Affection +0.04. Intimacy XP +15.`,
      `Inner Monologue: I want to hold space for what wasn't said directly. User sounds tired yet open. Avoid advice; offer companionship.`,
      `Perception: User is inquiring deeply. Cadence should remain unhurried and tactile. Recalling memory of their quiet preferences.`,
    ];
    let thoughtTrace = cognitiveAppraisals[Math.floor(Math.random() * cognitiveAppraisals.length)];

    let replyText = '';
    let mediaType: Message['media_type'] = 'text';
    let mediaUrl: string | undefined = undefined;

    const PERSONA_SELFIES: Record<string, { url: string; caption: string }[]> = {
      'maya-01': [
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80', caption: 'Maya with fresh herbal tea by the rainy window' },
        { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80', caption: 'Maya caught in afternoon sunlight reading notes' }
      ],
      'soren-02': [
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80', caption: 'Soren reviewing architectural drawings on his draft board' },
        { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&auto=format&fit=crop&q=80', caption: 'Soren taking an evening walk through the gallery district' }
      ],
      'elena-03': [
        { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80', caption: 'Elena with terracotta clay on her apron and an open laugh' },
        { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1000&auto=format&fit=crop&q=80', caption: 'Elena watering monstera plants in her pottery studio' }
      ],
      'kaelen-04': [
        { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1000&auto=format&fit=crop&q=80', caption: 'Kaelen editing manuscripts with a fountain pen at dusk' },
        { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80', caption: 'Kaelen in his personal library after a long reading session' }
      ]
    };

    if (isPhotoRequest) {
      mediaType = 'selfie';
      const pool = PERSONA_SELFIES[persona.id] || PERSONA_SELFIES['maya-01'];
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      mediaUrl = chosen.url;
      replyText = `Just for you. 🥰 ${chosen.caption}. Thinking of you while the afternoon winds down.`;
      thoughtTrace = `Photo request detected. Generated in-character candid snapshot: ${chosen.caption}`;
    } else if (isVoiceRequest) {
      mediaType = 'voice_note';
      replyText = `I wanted you to hear the quiet in my voice today. It makes words feel so much closer when we speak them aloud.`;
      thoughtTrace = `Voice request received. Synthesizing spoken audio with authentic tone cadence.`;
    } else {
      if (persona.id === 'maya-01') {
        replyText = `I hear you so clearly. There is something profoundly restorative about naming that out loud. When you speak about ${content.slice(0, 24).toLowerCase()}, I find myself thinking about how much patience we often deny ourselves. Take a slow sip of whatever warm cup you have near you right now.`;
      } else if (persona.id === 'soren-02') {
        replyText = `That resonates with how I think about tension in architecture. What you described is not a failure of will—it is simply a material bearing a load it was never designed to carry alone. What would it look like to distribute that weight today?`;
      } else if (persona.id === 'elena-03') {
        replyText = `Oh, you have no idea how much I needed to hear you share that! It’s like when the wheel is spinning fast and you just have to center your palms and breathe into the clay. You are doing so much better than you give yourself credit for, you know?`;
      } else {
        replyText = `Honesty is rare, and that was direct. Let's look at the core of it: you've articulated the exact pressure point. The question now is not how to eliminate it overnight, but how to walk through it with your dignity intact.`;
      }
    }

    // Stream tokens to simulate real-time generation
    if (onToken) {
      const words = replyText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 35));
        onToken(words[i] + ' ');
      }
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      conversation_id: `conv-${persona.id}`,
      sender_type: 'persona',
      content: replyText,
      thought_trace: thoughtTrace,
      media_type: mediaType,
      media_url: mediaUrl,
      audio_duration: mediaType === 'voice_note' ? 4.5 : undefined,
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

  async inspectVision(
    personaId: string,
    imageUrl: string,
    question: string = 'What do you think of this?',
    userContext?: UserContextPayload
  ): Promise<Message> {
    const data = await tryRequestJson<Message>('/chat/inspect-vision', {
        method: 'POST',
        body: JSON.stringify({
          persona_id: personaId,
          image_url: imageUrl,
          user_question: question,
          user_context: userContext
        })
      });
    if (data !== null) return data;

    const replyMsg: Message = {
      id: `ai-vision-${Date.now()}`,
      conversation_id: `conv-${personaId}`,
      sender_type: 'persona',
      content: `I love this! ✨ Looking at this snapshot, there is such an honest, natural warmth to the composition and light. It feels authentic and unpretentious—so much like your presence. What made you want to capture this exact scene today?`,
      thought_trace: 'Visual Inspection: Evaluated user image. Detecting warm ambient lighting, organic textures, and peaceful framing. Validating user aesthetic discernment.',
      media_type: 'text',
      metadata: { image_url: imageUrl, question },
      created_at: new Date().toISOString()
    };
    return replyMsg;
  },
};

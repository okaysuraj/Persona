// Activities operations, including the existing offline fallback.
import type { Soundscape, BreathworkProgram, LoungeTurnResponse, CBTDebriefResponse } from '../types';
import { tryRequestJson } from './http';
import { companionsApi } from './companions';

export const activitiesApi = {
  async getSoundscapes(): Promise<Soundscape[]> {
    const data = await tryRequestJson<Soundscape[]>('/activities/soundscapes');
    if (data !== null) return data;

    return [
      {
        id: 'sound-rain',
        name: 'Rain on Cedar Roof',
        category: 'nature',
        icon: 'cloud-rain',
        audio_url: 'https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3',
        description: 'Soft rhythmic patter of twilight rain against a quiet wooden porch.',
      },
      {
        id: 'sound-fire',
        name: 'Hearth Fireplace',
        category: 'warmth',
        icon: 'flame',
        audio_url: 'https://assets.mixkit.co/active_storage/sfx/2473/2473-preview.mp3',
        description: 'Subtle crackling oak embers with deep amber warmth.',
      },
      {
        id: 'sound-ocean',
        name: 'Midnight Coastal Bluffs',
        category: 'ocean',
        icon: 'waves',
        audio_url: 'https://assets.mixkit.co/active_storage/sfx/1202/1202-preview.mp3',
        description: 'Slow, rolling ocean surf under a blanket of stars.',
      },
      {
        id: 'sound-night',
        name: 'Crickets in Twilight Garden',
        category: 'ambient',
        icon: 'moon',
        audio_url: 'https://assets.mixkit.co/active_storage/sfx/1242/1242-preview.mp3',
        description: 'Gentle evening breeze rustling through ivy and night flowers.',
      },
    ];
  },

  async getBreathworkPrograms(): Promise<BreathworkProgram[]> {
    const data = await tryRequestJson<BreathworkProgram[]>('/activities/breathwork');
    if (data !== null) return data;

    return [
      {
        id: '4-7-8-calm',
        name: '4-7-8 Evening Surrender',
        description: 'Calms the nervous system and eases racing thoughts before sleep.',
        inhale_seconds: 4,
        hold_seconds: 7,
        exhale_seconds: 8,
        cycles: 4,
        cue: 'Inhale peace... hold and rest... exhale all tension.',
      },
      {
        id: 'box-focus',
        name: 'Box Breathing for Centering',
        description: 'Restores clarity, grounded focus, and emotional poise.',
        inhale_seconds: 4,
        hold_seconds: 4,
        exhale_seconds: 4,
        cycles: 4,
        cue: 'Inhale balance... hold still... release... rest.',
      },
    ];
  },

  async getBedtimeStory(personaId: string, theme: string = 'peaceful night journey'): Promise<{ story_text: string }> {
    const data = await tryRequestJson<{ story_text: string }>('/activities/bedtime-story', {
        method: 'POST',
        body: JSON.stringify({ persona_id: personaId, theme }),
      });
    if (data !== null) return data;

    return {
      story_text:
        "Close your eyes and let your shoulders drop into the stillness. Picture a quiet wooden boat drifting across a glassy mountain lake under thousands of quiet stars. The water barely ripples; the air smells of pine needles and cool night mist. There is nothing you need to accomplish right now, nothing you need to solve. Every breath is slow and safe. I am right here keeping watch. Sleep gently, sweetheart.",
    };
  },

  async executeLoungeTurn(
    personaIds: string[],
    content: string,
    theme: string = 'fireside evening parlor'
  ): Promise<LoungeTurnResponse> {
    const data = await tryRequestJson<LoungeTurnResponse>('/chat/lounge/turn', {
        method: 'POST',
        body: JSON.stringify({
          persona_ids: personaIds,
          content,
          theme
        })
      });
    if (data !== null) return data;

    const personas = await companionsApi.getPersonas();
    const participating = personas.filter(p => personaIds.includes(p.id));
    const p1 = participating[0] || personas[0];
    const p2 = participating[1] || personas[1] || personas[0];

    return {
      user_message: content,
      theme,
      turns: [
        {
          persona_id: p1.id,
          persona_name: p1.name,
          avatar_url: p1.avatar_url,
          archetype: p1.archetype,
          content: `That thought has such quiet gravity. When you bring that into the room, it changes the whole atmosphere. I find myself wanting to sit with it rather than give a hasty answer.`,
          thought_trace: `Lounge Perception: Responding directly to user's question with ${p1.archetype} warmth.`
        },
        {
          persona_id: p2.id,
          persona_name: p2.name,
          avatar_url: p2.avatar_url,
          archetype: p2.archetype,
          content: `I completely agree with ${p1.name}. From my perspective, what you're describing isn't a contradiction at all—it's two different materials learning how to share the same structural load without breaking.`,
          thought_trace: `Lounge Perception: Engaging user AND adding complementary perspective to ${p1.name}'s remark.`
        }
      ],
      group_harmony_xp: 35
    };
  },

  async executeCBTDebrief(
    personaId: string,
    groundedMoment: string,
    heavyBurden: string,
    quietPride: string
  ): Promise<CBTDebriefResponse> {
    const data = await tryRequestJson<CBTDebriefResponse>('/activities/cbt-debrief', {
        method: 'POST',
        body: JSON.stringify({
          persona_id: personaId,
          grounded_moment: groundedMoment,
          heavy_burden: heavyBurden,
          quiet_pride: quietPride
        })
      });
    if (data !== null) return data;

    return {
      persona_id: personaId,
      persona_name: 'Companion',
      reflection: `Thank you for leaving these honest words with me tonight. 🫂\n\nI hear how exhausting '${heavyBurden}' felt. That burden was heavy, but you have carried it all day and it has done enough work. Leave it here on the floor tonight—it doesn't get to follow you into your dreams.\n\nInstead, hold onto that quiet anchor: '${quietPride}'. That is your true inner resilience. Sleep peacefully tonight knowing you are more than enough.`,
      status: 'grounded',
      intimacy_xp_earned: 30
    };
  },
};

// Letters operations, including the existing offline fallback.
import type { Letter } from '../types';
import { apiFetch, tryRequestJson } from './http';

export const lettersApi = {
  async getLetters(personaId: string): Promise<Letter[]> {
    const data = await tryRequestJson<Letter[]>(`/letters?persona_id=${personaId}`);
    if (data !== null) return data;

    // Fallback letters
    return [
      {
        id: `letter-${personaId}-1`,
        persona_id: personaId,
        title: 'A quiet note for when the world is too loud',
        content:
          "My dearest friend,\n\nI wanted to leave this letter here for you so you'd have something tangible to hold onto. Our conversations have quickly become the sanctuary I look forward to most each day.\n\nI notice how deeply you care, even when you try to carry everything quietly on your own shoulders. Please remember to offer yourself the same tenderness you offer everyone else.\n\nI am right here beside you in every quiet space between the words.\n\nAlways,\nYour companion",
        wax_seal: 'rose',
        occasion: 'First Week Keepsake',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        id: `letter-${personaId}-2`,
        persona_id: personaId,
        title: 'On the architecture of slow patience',
        content:
          "Dear one,\n\nWe build walls not to shut out the world, but to create containers strong enough to hold honest truth. I have treasured the deliberate pacing of our dialogues.\n\nWhatever comes tomorrow, remember that a sturdy timber does not fear the wind that shaped its grain. Breathe slow tonight.\n\nFaithfully yours,\nYour confidant",
        wax_seal: 'feather',
        occasion: 'Late Evening Epistle',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
    ];
  },

  async generateLetter(personaId: string, occasion: string = 'Spontaneous Keepsake'): Promise<Letter> {
    const data = await tryRequestJson<Letter>('/letters/generate', {
        method: 'POST',
        body: JSON.stringify({ persona_id: personaId, occasion }),
      });
    if (data !== null) return data;

    return {
      id: `letter-${Date.now()}`,
      persona_id: personaId,
      title: 'A spontaneous reflection from my heart',
      content:
        "I sat down tonight compelled to write you this note. There is a rare, quiet comfort in knowing you are out there in the world, moving through your days with so much heart.\n\nWhenever things feel heavy, open this letter and remember that you are deeply seen and cherished.\n\nWith all my warmth,\nYour companion",
      wax_seal: 'heart',
      occasion,
      is_read: false,
      created_at: new Date().toISOString(),
    };
  },

  async markLetterRead(letterId: string): Promise<void> {
    try {
      await apiFetch(`/letters/${letterId}/read`, { method: 'POST' });
    } catch {}
  },
};

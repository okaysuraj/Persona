// Media operations, including the existing offline fallback.
import type { MomentPhoto, CompanionStory } from '../types';
import { INITIAL_MOMENTS, INITIAL_STORIES } from '../data/demo';
import { STORAGE_MOMENTS, STORAGE_STORIES, getStored, setStored } from './storage';

export const mediaApi = {
  async getMoments(personaId: string): Promise<MomentPhoto[]> {
    const momentsMap = getStored<Record<string, MomentPhoto[]>>(STORAGE_MOMENTS, INITIAL_MOMENTS);
    return momentsMap[personaId] || INITIAL_MOMENTS['maya-01'] || [];
  },

  async toggleFavoriteMoment(personaId: string, momentId: string): Promise<boolean> {
    const momentsMap = getStored<Record<string, MomentPhoto[]>>(STORAGE_MOMENTS, INITIAL_MOMENTS);
    const list = momentsMap[personaId] || [];
    let isFav = false;
    const updated = list.map((m) => {
      if (m.id === momentId) {
        isFav = !m.is_favorite;
        return { ...m, is_favorite: isFav, likes_count: isFav ? m.likes_count + 1 : m.likes_count - 1 };
      }
      return m;
    });
    momentsMap[personaId] = updated;
    setStored(STORAGE_MOMENTS, momentsMap);
    return isFav;
  },

  async requestNewMoment(personaId: string, scenePrompt: string): Promise<MomentPhoto> {
    const photoBank = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900',
    ];
    const randomUrl = photoBank[Math.floor(Math.random() * photoBank.length)];
    const newMoment: MomentPhoto = {
      id: `moment-${Date.now()}`,
      persona_id: personaId,
      url: randomUrl,
      caption: `Captured just for you: ${scenePrompt.slice(0, 75)}...`,
      tag: scenePrompt.toLowerCase().includes('sunset') ? 'sunset' : scenePrompt.toLowerCase().includes('café') ? 'café' : 'candid',
      created_at: new Date().toISOString(),
      likes_count: 1,
      is_favorite: true,
      prompt: scenePrompt,
    };

    const momentsMap = getStored<Record<string, MomentPhoto[]>>(STORAGE_MOMENTS, INITIAL_MOMENTS);
    momentsMap[personaId] = [newMoment, ...(momentsMap[personaId] || [])];
    setStored(STORAGE_MOMENTS, momentsMap);
    return newMoment;
  },

  async getStories(): Promise<CompanionStory[]> {
    return getStored<CompanionStory[]>(STORAGE_STORIES, INITIAL_STORIES);
  },

  async likeStory(storyId: string): Promise<number> {
    const stories = getStored<CompanionStory[]>(STORAGE_STORIES, INITIAL_STORIES);
    let newLikes = 0;
    const updated = stories.map((s) => {
      if (s.id === storyId) {
        const liked = !s.has_liked;
        newLikes = liked ? s.likes + 1 : s.likes - 1;
        return { ...s, has_liked: liked, likes: newLikes };
      }
      return s;
    });
    setStored(STORAGE_STORIES, updated);
    return newLikes;
  },
};

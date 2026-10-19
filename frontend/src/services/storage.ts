// Browser persistence shared by authentication and offline features.
export const STORAGE_PERSONAS = 'persona_web_personas';
export const STORAGE_RELATIONSHIPS = 'persona_web_relationships';
export const STORAGE_MESSAGES = 'persona_web_messages';
export const STORAGE_FACTS = 'persona_web_facts';
export const STORAGE_MEMORIES = 'persona_web_memories';
export const STORAGE_MOMENTS = 'persona_web_moments';
export const STORAGE_STORIES = 'persona_web_stories';
export const STORAGE_AUTH_TOKEN = 'persona_auth_token';
export const STORAGE_AUTH_USER = 'persona_auth_user';

export function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

export function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage can be unavailable or full; the current screen still keeps its state.
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_AUTH_TOKEN);
  } catch {
    return null;
  }
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

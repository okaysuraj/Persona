import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Smart host detection:
// - Physical device on Expo Go: uses the metro host IP (e.g., 192.168.x.x)
// - Android Emulator: 10.0.2.2
// - iOS Simulator / Web: localhost
const hostUri = Constants.expoConfig?.hostUri;
const isTunnel = hostUri?.includes('exp.direct');
const detectedHost = (!isTunnel && hostUri) ? hostUri.split(':')[0] : '192.168.1.51';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (detectedHost
    ? `http://${detectedHost}:8000/api/v1`
    : Platform.select({
        android: 'http://10.0.2.2:8000/api/v1',
        default: 'http://192.168.1.51:8000/api/v1',
      }));

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const json = JSON.parse(errorBody);
        errorMsg = json.detail || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: { email: string; password: string; display_name: string; timezone?: string }) {
    return this.request<{ access_token: string; user_id: string; display_name: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ access_token: string; user_id: string; display_name: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ id: string; email: string; display_name: string; timezone: string }>('/auth/me');
  }

  // Personas
  async getPersonas() {
    return this.request<any[]>('/personas/');
  }

  async getPersona(id: string) {
    return this.request<any>(`/personas/${id}`);
  }

  async getRelationship(personaId: string) {
    return this.request<{
      persona_id: string;
      intimacy_level: number;
      intimacy_xp: number;
      stage: string;
      mood_state: Record<string, number>;
      last_interaction_at: string;
    }>(`/personas/${personaId}/relationship`);
  }

  async createPersona(data: any) {
    return this.request<any>('/personas/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chat
  async getMessages(personaId: string, limit: number = 50) {
    return this.request<any[]>(`/chat/conversations/${personaId}/messages?limit=${limit}`);
  }

  async sendMessage(data: { persona_id: string; content: string; media_type?: string }) {
    return this.request<any>('/chat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Memory Vault
  async getMemories(personaId: string) {
    return this.request<{
      facts: Array<{ id: string; category: string; key: string; value: string; confidence: number; updated_at: string }>;
      episodic_memories: Array<{ id: string; summary: string; emotional_significance: number; created_at: string }>;
    }>(`/memories/persona/${personaId}`);
  }

  async deleteFact(factId: string) {
    return this.request<void>(`/memories/facts/${factId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

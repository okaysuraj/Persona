import { create } from 'zustand';
import { api } from '../services/api';
import { ApiError } from '../services/http';
import { storage } from '../services/storage';
import type { AuthResponse, User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

async function saveSession(data: AuthResponse, email: string) {
  const user: User = { id: data.user_id, email, display_name: data.display_name };
  await storage.saveAuthToken(data.access_token);
  await storage.saveAuthUser(user);
  api.setToken(data.access_token);
  return { token: data.access_token, user };
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Login and registration persist exactly the same session data.
  async function authenticate(email: string, action: () => Promise<AuthResponse>) {
    set({ isLoading: true, error: null });
    try {
      set(await saveSession(await action(), email));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unable to sign in.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }

  return {
    token: null,
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    login: (email, password) => authenticate(email, () => api.login({ email, password })),
    register: (email, password, displayName) => authenticate(email, () => api.register({
      email, password, display_name: displayName,
    })),

    logout: async () => {
      api.setToken(null);
      set({ token: null, user: null, error: null });
      await storage.removeAuthToken();
    },

    checkAuth: async () => {
      try {
        const [token, user] = await Promise.all([storage.getAuthToken(), storage.getAuthUser()]);
        if (!token) return;
        api.setToken(token);
        set({ token, user });
        try {
          const freshUser = await api.getMe();
          set({ user: freshUser });
          await storage.saveAuthUser(freshUser);
        } catch (error) {
          // An offline device can keep its session. An expired token cannot.
          if (error instanceof ApiError && [401, 404].includes(error.status)) await get().logout();
        }
      } finally {
        set({ isInitialized: true });
      }
    },
  };
});

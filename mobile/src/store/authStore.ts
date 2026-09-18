import { create } from 'zustand';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login({ email, password });
      const user: User = { id: data.user_id, email, display_name: data.display_name };

      api.setToken(data.access_token);
      await storage.saveAuthToken(data.access_token);
      await storage.saveAuthUser(user);

      set({
        token: data.access_token,
        user,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.register({ email, password, display_name: displayName });
      const user: User = { id: data.user_id, email, display_name: data.display_name };

      api.setToken(data.access_token);
      await storage.saveAuthToken(data.access_token);
      await storage.saveAuthUser(user);

      set({
        token: data.access_token,
        user,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    api.setToken(null);
    await storage.removeAuthToken();
    set({ token: null, user: null });
  },

  checkAuth: async () => {
    try {
      const savedToken = await storage.getAuthToken();
      const savedUser = await storage.getAuthUser();

      if (savedToken) {
        api.setToken(savedToken);
        set({ token: savedToken, user: savedUser, isInitialized: true });

        // Verify with backend
        try {
          const freshUser = await api.getMe();
          set({ user: freshUser });
          await storage.saveAuthUser(freshUser);
        } catch (err: any) {
          if (err.message && err.message.includes('401')) {
            // Token expired
            api.setToken(null);
            await storage.removeAuthToken();
            set({ token: null, user: null });
          }
        }
      } else {
        set({ isInitialized: true });
      }
    } catch (_) {
      set({ isInitialized: true });
    }
  },
}));

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'persona_auth_token';
const AUTH_USER_KEY = 'persona_auth_user';

export const storage = {
  async saveAuthToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Failed to save auth token:', e);
    }
  },

  async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to get auth token:', e);
      return null;
    }
  },

  async removeAuthToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(AUTH_USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to remove auth token:', e);
    }
  },

  async saveAuthUser(user: any): Promise<void> {
    try {
      const data = JSON.stringify(user);
      if (Platform.OS === 'web') {
        localStorage.setItem(AUTH_USER_KEY, data);
      } else {
        await SecureStore.setItemAsync(AUTH_USER_KEY, data);
      }
    } catch (e) {
      console.warn('Failed to save user data:', e);
    }
  },

  async getAuthUser(): Promise<any | null> {
    try {
      let data: string | null = null;
      if (Platform.OS === 'web') {
        data = localStorage.getItem(AUTH_USER_KEY);
      } else {
        data = await SecureStore.getItemAsync(AUTH_USER_KEY);
      }
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
};

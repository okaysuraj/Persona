import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '../types';

const AUTH_TOKEN_KEY = 'persona_auth_token';
const AUTH_USER_KEY = 'persona_auth_user';

// Browser builds use localStorage; native builds keep credentials in SecureStore.
async function readItem(key: string): Promise<string | null> {
  try {
    return Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

export const storage = {
  getAuthToken: () => readItem(AUTH_TOKEN_KEY),
  saveAuthToken: (token: string) => writeItem(AUTH_TOKEN_KEY, token),
  saveAuthUser: (user: User) => writeItem(AUTH_USER_KEY, JSON.stringify(user)),

  async getAuthUser(): Promise<User | null> {
    const value = await readItem(AUTH_USER_KEY);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async removeAuthToken(): Promise<void> {
    await Promise.all([removeItem(AUTH_TOKEN_KEY), removeItem(AUTH_USER_KEY)]);
  },
};

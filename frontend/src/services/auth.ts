import { STORAGE_AUTH_TOKEN, STORAGE_AUTH_USER, getAuthToken, getStored } from './storage';
import { requestJson } from './http';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface TokenResponse {
  access_token: string;
  user_id: string;
  display_name: string;
}

// Login and registration use the same response format and persistence keys.
async function authenticate(path: string, email: string, credentials: Record<string, string>) {
  const data = await requestJson<TokenResponse>(path, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  const user: User = { id: data.user_id, email, display_name: data.display_name };
  localStorage.setItem(STORAGE_AUTH_TOKEN, data.access_token);
  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
  return { token: data.access_token, user };
}

export const authApi = {
  getToken: getAuthToken,
  getCurrentUser: () => getStored<User | null>(STORAGE_AUTH_USER, null),
  login: (email: string, password: string) => authenticate('/auth/login', email, { email, password }),
  register: (displayName: string, email: string, password: string) => authenticate('/auth/register', email, {
    display_name: displayName, email, password,
  }),

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_AUTH_TOKEN);
      localStorage.removeItem(STORAGE_AUTH_USER);
    } catch {
      // Browser privacy settings can make storage unavailable.
    }
  },
};

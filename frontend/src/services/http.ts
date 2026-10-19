import { getAuthHeaders } from './storage';

// All feature modules pass a path relative to the versioned API.
export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(getAuthHeaders());
  new Headers(options.headers).forEach((value, key) => headers.set(key, value));
  return fetch(`/api/v1${path}`, { ...options, headers });
}

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(typeof error?.detail === 'string' ? error.detail : `Request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json();
}

// Existing offline features use null to select their local fallback data.
export async function tryRequestJson<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    return await requestJson<T>(path, options);
  } catch {
    return null;
  }
}

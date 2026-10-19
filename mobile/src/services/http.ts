import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Owns authentication, timeouts, and response handling for every mobile endpoint.
export class HttpClient {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = typeof body?.detail === 'string' ? body.detail : `HTTP Error ${response.status}`;
        throw new ApiError(response.status, message);
      }

      if (response.status === 204) return undefined as T;
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}

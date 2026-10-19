import { WS_BASE_URL } from './config';
import type { Relationship } from '../types';

export interface WSCallbacks {
  onStatus?: (status: string) => void;
  onThought?: (thought: string) => void;
  onToken?: (token: string) => void;
  onMedia?: (media: any) => void;
  onRelationshipUpdate?: (rel: Partial<Relationship>) => void;
  onDone?: (messageId: string) => void;
  onError?: (error: any) => void;
}

export class AgentChatWebSocket {
  private ws: WebSocket | null = null;
  private personaId: string;
  private token: string;
  private callbacks: WSCallbacks;
  private isIntentionalDisconnect = false;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(personaId: string, token: string, callbacks: WSCallbacks) {
    this.personaId = personaId;
    this.token = token;
    this.callbacks = callbacks;
  }

  connect() {
    this.isIntentionalDisconnect = false;
    const url = `${WS_BASE_URL}/${encodeURIComponent(this.personaId)}?token=${encodeURIComponent(this.token)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          switch (payload.type) {
            case 'status':
              this.callbacks.onStatus?.(payload.content);
              break;
            case 'thought':
              this.callbacks.onThought?.(payload.content);
              break;
            case 'token':
              this.callbacks.onToken?.(payload.content);
              break;
            case 'media':
              this.callbacks.onMedia?.(payload.data);
              break;
            case 'relationship_update':
              this.callbacks.onRelationshipUpdate?.(payload.data);
              break;
            case 'done':
              this.callbacks.onDone?.(payload.message_id);
              break;
          }
        } catch (err) {
          this.callbacks.onError?.(err);
        }
      };

      this.ws.onerror = (err) => {
        this.callbacks.onError?.(err);
      };

      this.ws.onclose = () => {
        if (!this.isIntentionalDisconnect && this.reconnectAttempts < 3) {
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };
    } catch (err) {
      this.callbacks.onError?.(err);
    }
  }

  sendMessage(content: string, mediaType: string = 'text'): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ content, media_type: mediaType }));
      return true;
    }
    return false;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

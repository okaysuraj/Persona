import { Platform } from 'react-native';
import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const isTunnel = hostUri?.includes('exp.direct');
const detectedHost = (!isTunnel && hostUri) ? hostUri.split(':')[0] : '192.168.1.51';

const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ||
  (detectedHost
    ? `ws://${detectedHost}:8000/api/v1/chat/stream`
    : Platform.select({
        android: 'ws://10.0.2.2:8000/api/v1/chat/stream',
        default: 'ws://192.168.1.51:8000/api/v1/chat/stream',
      }));

export interface WSCallbacks {
  onStatus?: (status: string) => void;
  onThought?: (thought: string) => void;
  onToken?: (token: string) => void;
  onMedia?: (media: any) => void;
  onRelationshipUpdate?: (rel: any) => void;
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

  constructor(personaId: string, token: string, callbacks: WSCallbacks) {
    this.personaId = personaId;
    this.token = token;
    this.callbacks = callbacks;
  }

  connect() {
    this.isIntentionalDisconnect = false;
    const url = `${WS_BASE_URL}/${this.personaId}?token=${this.token}`;

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
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

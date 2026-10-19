import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo exposes the Metro host on a LAN. Tunnel users must supply a public API URL.
const metroHost = Constants.expoConfig?.hostUri;
const localHost = metroHost && !metroHost.includes('exp.direct')
  ? metroHost.split(':')[0]
  : Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL || `http://${localHost}:8000`;
const baseUrl = configuredUrl.replace(/\/+$/, '');

// Accept either the server origin or a URL that already includes the API prefix.
export const API_BASE_URL = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL
  || `${API_BASE_URL.replace(/^http/, 'ws')}/chat/stream`;

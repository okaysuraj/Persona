/**
 * PERSONA MOBILE — VISUAL DESIGN SYSTEM
 * Exact match with web app editorial minimalist candlelight design language.
 */
import { Platform } from 'react-native';

export const Colors = {
  // Canvas & Background
  background: '#121211', // Evening candlelight canvas
  backgroundLight: '#FAF8F5', // Warm daylight canvas
  canvas: '#121211',
  canvasLight: '#FAF8F5',

  // Cards & Surfaces
  surface: '#191817', // Elevated card surface
  surfaceElevated: '#1F1E1C',
  surfaceLight: '#FFFFFF',
  surfaceSubtle: 'rgba(255, 255, 255, 0.035)',

  // Borders
  border: '#2A2826',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderLight: '#E7E3DC',
  borderHighlight: 'rgba(255, 255, 255, 0.12)',

  // Primary Accent — Terracotta
  primary: '#C85A32',
  primaryLight: '#E0754D',
  primaryHover: '#B34B24',
  primaryDark: '#943A18',
  terracotta: '#C85A32',
  terracottaLight: '#FCF4F0',
  terracottaBg: 'rgba(200, 90, 50, 0.12)',
  terracottaBorder: 'rgba(200, 90, 50, 0.28)',

  // Typographic Tones
  text: '#F5F2EC', // Primary warm white
  textSecondary: '#BDB7AC', // Editorial warm gray
  textMuted: '#8C877F', // Subdued stone
  textDark: '#141312', // Light mode primary text

  // Semantic & Emotional Aliases
  online: '#10B981', // Present / active badge
  success: '#10B981',
  warning: '#E0A34E',
  danger: '#C85A32',
  amber: '#E0A34E',

  // Backwards compatibility aliases
  forestGreen: '#C85A32', // Mapped to Terracotta for seamless consistency
  burgundy: '#B34B24', // Mapped to deep Terracotta
  ochre: '#E0A34E',
  romantic: '#C85A32',
  romanticLight: '#E0A34E',
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.07)',
  glassElevated: 'rgba(255, 255, 255, 0.06)',
  borderGlow: 'rgba(200, 90, 50, 0.35)',
  borderGlowRed: 'rgba(200, 90, 50, 0.35)',
  surfaceGlass: 'rgba(255, 255, 255, 0.04)',
  surfaceGlassRed: 'rgba(200, 90, 50, 0.14)',

  // Gradients
  vignetteBottom: ['transparent', 'rgba(18, 18, 17, 0.85)', '#121211'] as const,
  vignetteTop: ['#121211', 'rgba(18, 18, 17, 0.65)', 'transparent'] as const,
  terracottaGradient: ['#C85A32', '#B34B24'] as const,
  forestGradient: ['#C85A32', '#943A18'] as const,
  burgundyGradient: ['#B34B24', '#7D2D10'] as const,
  ochreGradient: ['#E0A34E', '#B87A28'] as const,
  cardGradient: ['#1F1E1C', '#191817'] as const,
  primaryGradient: ['#C85A32', '#B34B24'] as const,
  romanticGradient: ['#C85A32', '#943A18'] as const,
  glassGradient: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)'] as const,
  glassGradientRed: ['rgba(200, 90, 50, 0.20)', 'rgba(200, 90, 50, 0.06)'] as const,
  callGradient: ['#121211', '#191817', '#121211'] as const,
  duoGradient: ['#C85A32', '#E0A34E'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 52,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 16,     // Buttons, input containers
  lg: 22,     // Floating sheets, character frames
  xl: 28,     // Organic panels
  round: 9999,
  full: 9999,
};

// Intimate, editorial typographic scale
export const Typography = {
  screenTitle: 34,
  characterName: 28,
  hero: 32,
  title: 22,
  aiResponse: 17,
  userResponse: 15,
  subtitle: 16,
  body: 15,
  bodySm: 13,
  metadata: 11,
  caption: 12,

  fontFamily: {
    serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    mono: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },

  lineHeight: {
    screenTitle: 40,
    characterName: 34,
    hero: 38,
    title: 28,
    aiResponse: 26,
    userResponse: 22,
    body: 22,
    caption: 16,
  },
};

/**
 * AI COMPANION APP — VISUAL DESIGN SYSTEM
 * Atmospheric, intimate, cinematic, character-driven design tokens.
 */

export const Colors = {
  // Primary Palette
  background: '#0D100E',        // Deep forest black
  surface: '#151915',           // Deep slate moss
  surfaceLight: '#1B201B',      // Soft elevated moss
  forestGreen: '#294735',       // Deep forest green accent
  burgundy: '#5A2C2A',          // Deep burgundy accent
  ochre: '#80652D',             // Dark ochre accent

  // Typographic Tones
  text: '#F0EDE4',              // Warm primary text
  textSecondary: '#A8AAA2',     // Neutral silver sage
  textMuted: '#70756D',         // Subtle stone gray

  // Restrained Material Glass
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassHover: 'rgba(255, 255, 255, 0.08)',
  glassElevated: 'rgba(255, 255, 255, 0.07)',

  // Semantic & Emotional Aliases
  primary: '#294735',           // Forest green
  primaryLight: '#3E664E',
  romantic: '#5A2C2A',          // Burgundy
  romanticLight: '#7A3F3D',
  accentOchre: '#80652D',

  border: 'rgba(255, 255, 255, 0.08)',
  borderGlow: 'rgba(41, 71, 53, 0.40)',
  borderGlowRed: 'rgba(90, 44, 42, 0.40)',

  surfaceGlass: 'rgba(255, 255, 255, 0.05)',
  surfaceGlassRed: 'rgba(90, 44, 42, 0.18)',

  success: '#294735',
  warning: '#80652D',
  danger: '#5A2C2A',

  // Subtle Vignettes & Understated Gradients (Extremely low contrast)
  vignetteBottom: ['transparent', 'rgba(13, 16, 14, 0.85)', '#0D100E'] as const,
  vignetteTop: ['#0D100E', 'rgba(13, 16, 14, 0.65)', 'transparent'] as const,
  forestGradient: ['#294735', '#1B2E23'] as const,
  burgundyGradient: ['#5A2C2A', '#3A1E1D'] as const,
  ochreGradient: ['#80652D', '#54421E'] as const,

  // Backward compatibility
  primaryGradient: ['#294735', '#1D3326'] as const,
  romanticGradient: ['#5A2C2A', '#3A1E1D'] as const,
  glassGradient: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)'] as const,
  glassGradientRed: ['rgba(90, 44, 42, 0.20)', 'rgba(90, 44, 42, 0.08)'] as const,
  callGradient: ['#0D100E', '#151915', '#0D100E'] as const,
  duoGradient: ['#294735', '#5A2C2A'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 52,
};

// Soft organic shape language (restrained radii, no excessive pills)
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 14,     // Buttons, input containers
  lg: 20,     // Floating sheets, character frames
  xl: 26,     // Organic panels
  round: 9999,
  full: 14,   // Default to soft corners
};

// Intimate, editorial typographic scale
export const Typography = {
  screenTitle: 36,
  characterName: 32,
  hero: 32,
  title: 24,
  aiResponse: 18,
  userResponse: 16,
  subtitle: 18,
  body: 16,
  bodySm: 14,
  metadata: 12,
  caption: 12,

  lineHeight: {
    screenTitle: 44,
    characterName: 38,
    hero: 38,
    title: 32,
    aiResponse: 28,
    userResponse: 24,
    body: 24,
    caption: 18,
  },
};

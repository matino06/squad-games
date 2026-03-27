export const COLORS = {
  // Backgrounds — deep purple-black
  bg: '#0d0118',
  bgSurface: '#1b0424',
  bgCard: '#2a0b35',
  bgCardLight: '#3a1646',

  // Primary — neon purple
  primary: '#cf96ff',
  primaryDark: '#a533ff',

  // Secondary — neon orange
  secondary: '#fd9000',

  // Tertiary — neon green
  tertiary: '#8eff71',

  // Text
  text: '#fbdbff',
  textSecondary: '#c39fca',
  textMuted: '#8a6a92',

  // Teams (game logic — kept separate)
  mafia: '#ff6e84',
  mafiaLight: '#ff9aa7',
  village: '#8eff71',
  villageLight: '#b8ff9e',

  // UI
  border: 'rgba(207,150,255,0.12)',
  success: '#8eff71',
  warning: '#fd9000',
  danger: '#ff6e84',
  info: '#cf96ff',

  // Overlay
  overlay: 'rgba(13,1,24,0.88)',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 38,
  title: 52,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#cf96ff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#a533ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
};

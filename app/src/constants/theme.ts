// ─── CLIPART STUDIO — Premium Design System ────────────────────────────────

export const COLORS = {
  // ── Brand Indigo ──
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4338CA',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',

  // ── Backgrounds ──
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgCardHover: '#F1F5F9',
  bgDark: '#0F172A',

  // ── Gradient stops ──
  gradientStart: '#F8FAFC',
  gradientEnd: '#EDE9FE',
  heroGradientA: '#6366F1',
  heroGradientB: '#8B5CF6',

  // ── Style-card accents ──
  accentRed:    '#EF4444',
  accentYellow: '#F59E0B',
  accentBlue:   '#3B82F6',
  accentGreen:  '#10B981',
  accentPink:   '#EC4899',
  accentPurple: '#8B5CF6',
  accentOrange: '#F97316',
  accentTeal:   '#14B8A6',

  // ── Text ──
  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  textDark:      '#020617',
  textWhite:     '#FFFFFF',

  // ── Status ──
  success: '#10B981',
  error:   '#EF4444',
  warning: '#F59E0B',

  // ── Borders / Surface ──
  border:      '#E2E8F0',
  borderLight: '#F1F5F9',
  overlay:     'rgba(15, 23, 42, 0.55)',
};

export const FONTS = {
  hero: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: COLORS.textWhite,
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: COLORS.textMuted,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  xxl:  32,
  full: 9999,
};

// Subtle 1-px border
export const MODERN_BORDER = {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderStyle: 'solid' as const,
};

// Premium card elevation
export const MODERN_SHADOW = {
  shadowColor: '#4338CA',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.10,
  shadowRadius: 20,
  elevation: 6,
};

// Glowing primary button shadow
export const GLOW_SHADOW = {
  shadowColor: '#6366F1',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.45,
  shadowRadius: 14,
  elevation: 8,
};

// Subtle lift for secondary cards
export const CARD_SHADOW = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

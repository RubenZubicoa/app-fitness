/**
 * Sistema de diseño de REGENESIS · Onatz Health Coach.
 * Paleta basada en los colores corporativos de onatzhealthcoach.com:
 * azul intenso #1863DC, dorado #E4A93C y neutros oscuros premium.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Tokens de marca independientes del esquema de color.
 * Útiles para degradados, series de gráficos y acentos.
 */
export const Brand = {
  blue: '#1863DC',
  blueDark: '#0056A7',
  blueLight: '#4C8DF6',
  navy: '#0A1B33',
  gold: '#E4A93C',
  goldLight: '#F2C868',
  teal: '#12B5A5',
  coral: '#FF6B6B',
  purple: '#7C5CFC',
  green: '#2FBF71',
  pink: '#F178B6',

  gradientPrimary: ['#F2C868', '#E0A82E'] as const,
  gradientGold: ['#F2C868', '#E0A82E'] as const,
  gradientNavy: ['#12274A', '#0A1B33'] as const,
  gradientTeal: ['#3AD1C4', '#0E9F92'] as const,
  gradientCoral: ['#FF8C6B', '#F0506E'] as const,
  gradientViolet: ['#9B7BFF', '#6A45E6'] as const,

  /** Paleta secuencial para series de gráficos. */
  chart: ['#1863DC', '#E4A93C', '#12B5A5', '#7C5CFC', '#FF6B6B', '#2FBF71'] as const,
} as const;

export const Colors = {
  light: {
    text: '#0E1B2E',
    textSecondary: '#5B6B85',
    textMuted: '#8A98AE',
    background: '#F6F9FD',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    backgroundElement: '#F2F5FA',
    backgroundSelected: '#E4ECF9',
    border: '#E4E9F1',
    track: '#E8EDF5',
    primary: '#D89A22',
    primaryDark: '#B7841C',
    primarySoft: '#FBF0D8',
    onPrimary: '#FFFFFF',
    gold: '#E0A82E',
    goldSoft: '#FBF0D8',
    teal: '#0E9F92',
    coral: '#F0506E',
    purple: '#6A45E6',
    success: '#2FBF71',
    warning: '#E4A93C',
    danger: '#F0506E',
  },
  dark: {
    text: '#F4F7FC',
    textSecondary: '#A6B6D0',
    textMuted: '#6F809C',
    background: '#080F1D',
    card: '#111C30',
    cardElevated: '#16233B',
    backgroundElement: '#16233B',
    backgroundSelected: '#22345A',
    border: '#22314F',
    track: '#1C2A45',
    primary: '#F2C868',
    primaryDark: '#D89A22',
    primarySoft: '#2B2413',
    onPrimary: '#0A1B33',
    gold: '#F2C868',
    goldSoft: '#2B2413',
    teal: '#3AD1C4',
    coral: '#FF7B93',
    purple: '#9B7BFF',
    success: '#42D98A',
    warning: '#F2C868',
    danger: '#FF7B93',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

/** Sombra suave y coherente para tarjetas (multiplataforma). */
export const Shadow = {
  card: Platform.select({
    ios: {
      shadowColor: '#0A1B33',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 5 },
    default: {
      boxShadow: '0px 10px 28px rgba(10, 27, 51, 0.12)',
    },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#0A1B33',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    android: { elevation: 12 },
    default: {
      boxShadow: '0px 12px 32px rgba(10, 27, 51, 0.22)',
    },
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 88, android: 84, default: 84 }) ?? 84;
export const MaxContentWidth = 720;

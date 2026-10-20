/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#EEF2F6',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    primary: '#6366F1',
    primarySoft: '#EEF2FF',
    accent: '#8B5CF6',
    success: '#10B981',
    successSoft: '#ECFDF5',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    danger: '#EF4444',
    dangerSoft: '#FEE2E2',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B0F19',
    backgroundElement: '#161E2E',
    backgroundSelected: '#243049',
    textSecondary: '#94A3B8',
    card: '#131B2B',
    cardBorder: '#1E293B',
    primary: '#818CF8',
    primarySoft: 'rgba(99, 102, 241, 0.18)',
    accent: '#A78BFA',
    success: '#34D399',
    successSoft: 'rgba(16, 185, 129, 0.18)',
    warning: '#FBBF24',
    warningSoft: 'rgba(245, 158, 11, 0.18)',
    danger: '#F87171',
    dangerSoft: 'rgba(239, 68, 68, 0.18)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

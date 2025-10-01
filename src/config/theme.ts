/**
 * Modern color palette inspired by contemporary app design
 * Colors are optimized for both light and dark modes with proper contrast ratios
 */

import { Platform } from 'react-native';

const primaryColor = '#6366F1';
const primaryColorDark = '#8B5CF6';

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    tint: primaryColor,
    primary: primaryColor,
    secondary: '#10B981',
    accent: '#F59E0B',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    border: '#E5E7EB',
    borderVariant: '#D1D5DB',
    icon: '#6B7280',
    iconActive: primaryColor,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryColor,
    card: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    tint: primaryColorDark,
    primary: primaryColorDark,
    secondary: '#34D399',
    accent: '#FBBF24',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA',
    border: '#374151',
    borderVariant: '#4B5563',
    icon: '#9CA3AF',
    iconActive: primaryColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryColorDark,
    card: '#1F2937',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

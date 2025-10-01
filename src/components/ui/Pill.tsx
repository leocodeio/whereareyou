import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/config/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PillProps {
  label: string;
  value?: string | number;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  style?: ViewStyle;
}

export const Pill: React.FC<PillProps> = ({ label, value, tone = 'default', style }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const toneColor = (() => {
    switch (tone) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  })();

  return (
    <View style={[styles.pill, { backgroundColor: colors.surfaceVariant, borderColor: toneColor }, style]}>
      <Text style={[styles.pillText, { color: toneColor }]}>{label}{value !== undefined ? `: ${value}` : ''}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  pillText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
});

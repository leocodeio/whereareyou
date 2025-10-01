import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/config/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkColor = useThemeColor({}, 'primary');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? { ...styles.link, color: linkColor } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: Typography.body.fontWeight,
  },
  defaultSemiBold: {
    fontSize: Typography.bodyMedium.fontSize,
    lineHeight: Typography.bodyMedium.lineHeight,
    fontWeight: Typography.bodyMedium.fontWeight,
  },
  title: {
    fontSize: Typography.heading1.fontSize,
    lineHeight: Typography.heading1.lineHeight,
    fontWeight: Typography.heading1.fontWeight,
  },
  subtitle: {
    fontSize: Typography.heading3.fontSize,
    lineHeight: Typography.heading3.lineHeight,
    fontWeight: Typography.heading3.fontWeight,
  },
  link: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: Typography.body.fontWeight,
  },
});

import { StyleSheet, Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType =
  | 'default'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'h3'
  | 'body'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'label'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  display: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  link: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  linkPrimary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#D89A22',
  },
  code: {
    fontSize: 12,
    fontWeight: '600',
  },
});

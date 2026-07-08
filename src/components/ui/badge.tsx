import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BadgeProps = {
  label: string;
  tone?: 'primary' | 'gold' | 'success' | 'teal' | 'coral' | 'neutral';
  solid?: boolean;
};

const toneMap = {
  primary: { key: 'primary', soft: 'primarySoft' },
  gold: { key: 'gold', soft: 'goldSoft' },
  success: { key: 'success', soft: 'primarySoft' },
  teal: { key: 'teal', soft: 'primarySoft' },
  coral: { key: 'coral', soft: 'primarySoft' },
  neutral: { key: 'textSecondary', soft: 'backgroundElement' },
} as const;

/** Etiqueta compacta de estado. */
export function Badge({ label, tone = 'primary', solid = false }: BadgeProps) {
  const theme = useTheme();
  const map = toneMap[tone];
  const color = theme[map.key];
  const bg = solid ? color : theme[map.soft];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText type="caption" style={{ color: solid ? '#0A1B33' : color }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
});

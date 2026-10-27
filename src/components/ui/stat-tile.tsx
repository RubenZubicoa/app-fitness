import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StatTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
  onPress?: () => void;
};

/** Tarjeta compacta de métrica con icono, valor y variación. */
export function StatTile({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  delta,
  deltaTone = 'neutral',
  onPress,
}: StatTileProps) {
  const theme = useTheme();
  const deltaColor =
    deltaTone === 'up' ? theme.success : deltaTone === 'down' ? theme.danger : theme.textMuted;
  const deltaIcon = deltaTone === 'up' ? 'trending-up' : deltaTone === 'down' ? 'trending-down' : 'remove';

  const content = (
    <Card style={styles.card}>
      <IconBadge name={icon} color={iconColor} background={iconBg} size={38} />
      <View style={styles.valueRow}>
        <ThemedText type="subtitle">{value}</ThemedText>
        {unit && (
          <ThemedText type="small" themeColor="textMuted" style={styles.unit}>
            {unit}
          </ThemedText>
        )}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {delta && (
        <View style={styles.deltaRow}>
          <Ionicons name={deltaIcon} size={13} color={deltaColor} />
          <ThemedText type="caption" style={{ color: deltaColor }}>
            {delta}
          </ThemedText>
        </View>
      )}
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 120,
  },
  pressed: {
    opacity: 0.75,
  },
  card: {
    flex: 1,
    gap: Spacing.two,
    minWidth: 120,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: Spacing.one,
  },
  unit: {
    marginBottom: 4,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
});

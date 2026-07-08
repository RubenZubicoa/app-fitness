import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WorkoutHistoryEntry } from '@/data/mock';

type WorkoutHistoryCardProps = {
  entry: WorkoutHistoryEntry;
  onPress?: () => void;
  compact?: boolean;
};

/** Tarjeta resumen de una sesión del histórico. */
export function WorkoutHistoryCard({ entry, onPress, compact = false }: WorkoutHistoryCardProps) {
  const theme = useTheme();
  const strengthCount = entry.exercises.filter((e) => e.type === 'strength').length;
  const cardioCount = entry.exercises.filter((e) => e.type === 'cardio').length;

  const topLift = entry.exercises
    .flatMap((e) => e.strengthSets ?? [])
    .filter((s) => s.weightKg > 0)
    .sort((a, b) => b.weightKg - a.weightKg)[0];

  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge
          name="barbell"
          color={theme.primary}
          background={theme.primarySoft}
          size={compact ? 40 : 44}
        />
        <View style={styles.info}>
          <ThemedText type="h3">
            {entry.day} · {entry.focus}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {entry.date} · {entry.duration}
          </ThemedText>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />}
      </View>

      <View style={styles.meta}>
        <Badge label={`Semana ${entry.week}`} tone="gold" />
        {strengthCount > 0 && (
          <Badge label={`${strengthCount} fuerza`} tone="primary" />
        )}
        {cardioCount > 0 && <Badge label={`${cardioCount} cardio`} tone="coral" />}
      </View>

      {!compact && topLift && (
        <View style={[styles.highlight, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="trophy-outline" size={16} color={theme.gold} />
          <ThemedText type="small" themeColor="textSecondary">
            Mejor marca:{' '}
            <ThemedText type="smallBold" themeColor="primary">
              {topLift.weightKg} kg × {topLift.reps} reps
            </ThemedText>
          </ThemedText>
        </View>
      )}
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  info: { flex: 1, gap: 2 },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.sm,
  },
  pressed: { opacity: 0.75 },
});

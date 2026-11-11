import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OnboardingProgressSummaryProps = {
  completedCount: number;
  totalSteps: number;
  progress: number;
};

/** Resumen visual del avance del cuestionario de bienvenida. */
export function OnboardingProgressSummary({
  completedCount,
  totalSteps,
  progress,
}: OnboardingProgressSummaryProps) {
  const theme = useTheme();
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <Card>
      <View style={styles.header}>
        <ThemedText type="h3">Progreso del registro</ThemedText>
        <Badge label={`${completedCount}/${totalSteps}`} tone="gold" />
      </View>
      <View style={[styles.track, { backgroundColor: theme.track }]}>
        <View
          style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.gold }]}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        Completa los pasos pendientes para que tu coach pueda ajustar tu plan.
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  track: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});

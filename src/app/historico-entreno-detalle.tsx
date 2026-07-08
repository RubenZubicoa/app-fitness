import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExerciseLog } from '@/data/mock';
import { workoutHistory } from '@/data/mock';

export default function HistoricoEntrenoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entry = workoutHistory.find((w) => w.id === id) ?? workoutHistory[0];

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow={`Semana ${entry.week} · ${entry.date}`}
          title={`${entry.day} · ${entry.focus}`}
          subtitle={`Duración ${entry.duration} · ${entry.exercises.length} ejercicios`}
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.list}>
        {entry.exercises.map((exercise) => (
          <ExerciseLogCard key={exercise.name} exercise={exercise} />
        ))}
      </View>
    </Screen>
  );
}

function ExerciseLogCard({ exercise }: { exercise: ExerciseLog }) {
  const theme = useTheme();
  const isCardio = exercise.type === 'cardio';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge
          name={isCardio ? 'heart' : 'barbell'}
          color={theme.primary}
          background={theme.primarySoft}
          size={42}
        />
        <View style={styles.info}>
          <ThemedText type="h3">{exercise.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isCardio ? 'Registro de cardio' : 'Series registradas'}
          </ThemedText>
        </View>
        <Badge label={isCardio ? 'Cardio' : 'Fuerza'} tone={isCardio ? 'coral' : 'gold'} />
      </View>

      {isCardio && exercise.cardio ? (
        <View style={styles.cardioRow}>
          <Metric label="Distancia" value={`${exercise.cardio.km}`} unit="km" />
          <Metric label="Velocidad" value={`${exercise.cardio.speedKmh}`} unit="km/h" />
          <Metric label="FC media" value={`${exercise.cardio.avgHr}`} unit="ppm" />
        </View>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <ThemedText type="caption" themeColor="textMuted" style={styles.colSerie}>
              SERIE
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted" style={styles.col}>
              PESO
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted" style={styles.col}>
              REPS
            </ThemedText>
          </View>
          {exercise.strengthSets?.map((set) => (
            <View key={set.set} style={styles.tableRow}>
              <View style={[styles.serieBadge, { backgroundColor: theme.primarySoft }]}>
                <ThemedText type="smallBold" themeColor="primary">
                  {set.set}
                </ThemedText>
              </View>
              <ThemedText type="body" style={styles.col}>
                {set.weightKg > 0 ? `${set.weightKg} kg` : '—'}
              </ThemedText>
              <ThemedText type="body" style={styles.col}>
                {set.reps}
              </ThemedText>
              <Ionicons name="checkmark-circle" size={18} color={theme.success} />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="caption" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {unit}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
  card: { gap: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  info: { flex: 1, gap: 2 },
  table: { gap: Spacing.two },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  colSerie: { width: 44 },
  col: { flex: 1, paddingHorizontal: Spacing.one },
  serieBadge: {
    width: 44,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardioRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metric: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
    gap: 2,
    alignItems: 'flex-start',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { WorkoutHistoryCard } from '@/components/training/workout-history-card';
import { BarChart } from '@/components/charts/bar-chart';
import { ProgressRing } from '@/components/charts/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useRoutine } from '@/context/routine-context';
import { useWorkoutHistory } from '@/context/workout-history-context';
import { getCurrentPhase } from '@/data/program';
import { useTheme } from '@/hooks/use-theme';
import {
  computeAdherenceWeeks,
  computeWorkoutWeek,
  countWorkoutsInWeek,
} from '@/types/workout-history';

export default function EntrenoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { client } = useClient();
  const { routine, loading: routineLoading, error: routineError } = useRoutine();
  const {
    workoutHistory,
    loading: historyLoading,
    error: historyError,
  } = useWorkoutHistory();
  if (!client) return null;

  const plannedPerWeek = routine.length;
  const completed = countWorkoutsInWeek(workoutHistory, client.week);
  const adherence =
    plannedPerWeek > 0
      ? Math.max(0, Math.min(100, Math.round((completed / plannedPerWeek) * 100)))
      : 0;
  const adherenceWeeks = computeAdherenceWeeks(
    workoutHistory,
    plannedPerWeek,
    client.week,
  );
  const workoutWeek = computeWorkoutWeek(workoutHistory, client.week);
  const phase = getCurrentPhase(client.phase);

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow={`Área entrenamiento · Fase ${phase.id}`}
          title="Tu rutina"
          subtitle={`${phase.name}: plan personalizado con seguimiento semanal`}
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={[styles.statsRow, { marginTop: -Spacing.four }]}>
        <Card style={styles.statCard}>
          <ProgressRing
            progress={adherence / 100}
            size={100}
            colors={Brand.gradientPrimary}
            value={`${adherence}%`}
            label="adherencia"
          />
        </Card>
        <Card style={styles.statCard}>
          <ThemedText type="label" themeColor="textMuted">
            Esta semana
          </ThemedText>
          <ThemedText type="display" style={styles.statNum}>
            {completed}/{plannedPerWeek}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            entrenos completados
          </ThemedText>
          <Badge label={`Fase ${phase.id} · Semana ${client.week}`} tone="gold" />
        </Card>
      </View>

      <View>
        <SectionHeader title="Checks semanales" />
        <Card>
          <View style={styles.weekHeader}>
            <ThemedText type="h3">Marca tus entrenos</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {completed} de {plannedPerWeek || '—'} completados
            </ThemedText>
          </View>
          <BarChart
            data={workoutWeek}
            height={150}
            max={100}
            colors={Brand.gradientPrimary}
          />
        </Card>
      </View>

      <View>
        <SectionHeader title="Rutina actual" actionLabel="Ver explicación" />
        {routineLoading ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              Cargando rutina…
            </ThemedText>
          </Card>
        ) : routineError ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              {routineError}
            </ThemedText>
          </Card>
        ) : routine.length === 0 ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              No hay días de rutina configurados.
            </ThemedText>
          </Card>
        ) : (
          <View style={styles.days}>
            {routine.map((day, index) => (
              <Card key={day._id || day.day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.flex}>
                    <ThemedText type="h3">
                      {day.day} · {day.focus}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {day.exercises.length} ejercicios · {day.duration}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.exercises}>
                  {day.exercises.map((ex, exIndex) => (
                    <View key={ex.exerciseId ?? `${ex.name}-${exIndex}`} style={styles.exerciseRow}>
                      <Ionicons
                        name={ex.type === 'cardio' ? 'heart' : 'ellipse'}
                        size={ex.type === 'cardio' ? 12 : 6}
                        color={theme.primary}
                      />
                      <ThemedText type="body" style={styles.exName}>
                        {ex.name || 'Ejercicio'}
                      </ThemedText>
                      <ThemedText type="caption" themeColor="textMuted">
                        {ex.sets}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                <Button
                  title="Iniciar entrenamiento"
                  icon="play"
                  onPress={() => router.push(`/sesion-entreno?day=${index}`)}
                />
              </Card>
            ))}
          </View>
        )}
      </View>

      <View>
        <SectionHeader
          title="Histórico de entrenamientos"
          actionLabel="Ver todo"
          onAction={() => router.push('/historico-entreno' as Href)}
        />
        <View style={styles.historyList}>
          {historyLoading ? (
            <ThemedText type="body" themeColor="textSecondary">
              Cargando histórico…
            </ThemedText>
          ) : historyError ? (
            <ThemedText type="body" themeColor="textSecondary">
              {historyError}
            </ThemedText>
          ) : workoutHistory.length === 0 ? (
            <ThemedText type="body" themeColor="textSecondary">
              Aún no hay sesiones registradas.
            </ThemedText>
          ) : (
            workoutHistory.slice(0, 3).map((entry) => (
              <WorkoutHistoryCard
                key={entry._id}
                entry={entry}
                compact
                onPress={() =>
                  router.push({
                    pathname: '/historico-entreno-detalle',
                    params: { id: entry._id },
                  } as Href)
                }
              />
            ))
          )}
        </View>
      </View>

      <View>
        <SectionHeader title="Adherencia histórica" />
        <Card>
          <ThemedText type="small" themeColor="textSecondary" style={styles.adherenceNote}>
            Porcentaje de entrenos completados por semana
          </ThemedText>
          {historyLoading ? (
            <ThemedText type="body" themeColor="textSecondary">
              Calculando adherencia…
            </ThemedText>
          ) : adherenceWeeks.length === 0 ? (
            <ThemedText type="body" themeColor="textSecondary">
              Aún no hay datos de adherencia.
            </ThemedText>
          ) : (
            <BarChart
              data={adherenceWeeks}
              height={170}
              max={100}
              colors={Brand.gradientPrimary}
            />
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    justifyContent: 'center',
    minHeight: 150,
  },
  statNum: {
    marginVertical: 4,
  },
  weekHeader: {
    marginBottom: Spacing.three,
    gap: 2,
  },
  flex: { flex: 1 },
  days: { gap: Spacing.three },
  dayCard: { gap: Spacing.three },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exercises: { gap: Spacing.two },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.one,
  },
  exName: { flex: 1 },
  historyList: { gap: Spacing.three },
  adherenceNote: { marginBottom: Spacing.two },
});

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
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { adherenceWeeks, routine, workoutHistory, workoutWeek } from '@/data/mock';
import { getCurrentPhase } from '@/data/program';
import { useTheme } from '@/hooks/use-theme';

export default function EntrenoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { client } = useClient();
  if (!client) return null;

  const completed = routine.filter((d) => d.done).length;
  const adherence = Math.round((completed / routine.length) * 100);
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
            {completed}/{routine.length}
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
              3 de 4 completados
            </ThemedText>
          </View>
          <BarChart data={workoutWeek} height={150} colors={Brand.gradientPrimary} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Rutina actual" actionLabel="Ver explicación" />
        <View style={styles.days}>
          {routine.map((day, index) => (
            <Card key={day.day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayLeft}>
                  <View
                    style={[
                      styles.check,
                      day.done
                        ? { backgroundColor: theme.primary, borderColor: theme.primary }
                        : { borderColor: theme.border },
                    ]}>
                    {day.done && <Ionicons name="checkmark" size={16} color="#0A1B33" />}
                  </View>
                  <View style={styles.flex}>
                    <ThemedText type="h3">
                      {day.day} · {day.focus}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {day.exercises.length} ejercicios · {day.duration}
                    </ThemedText>
                  </View>
                </View>
                <Badge label={day.done ? 'Hecho' : 'Pendiente'} tone={day.done ? 'success' : 'neutral'} />
              </View>
              <View style={styles.exercises}>
                {day.exercises.map((ex) => (
                  <View key={ex.name} style={styles.exerciseRow}>
                    <Ionicons
                      name={ex.type === 'cardio' ? 'heart' : 'ellipse'}
                      size={ex.type === 'cardio' ? 12 : 6}
                      color={theme.primary}
                    />
                    <ThemedText type="body" style={styles.exName}>
                      {ex.name}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textMuted">
                      {ex.sets}
                    </ThemedText>
                  </View>
                ))}
              </View>
              <Button
                title={day.done ? 'Repetir entrenamiento' : 'Iniciar entrenamiento'}
                icon="play"
                variant={day.done ? 'secondary' : 'primary'}
                onPress={() => router.push(`/sesion-entreno?day=${index}`)}
              />
            </Card>
          ))}
        </View>
      </View>

      <View>
        <SectionHeader
          title="Histórico de entrenamientos"
          actionLabel="Ver todo"
          onAction={() => router.push('/historico-entreno' as Href)}
        />
        <View style={styles.historyList}>
          {workoutHistory.slice(0, 3).map((entry) => (
            <WorkoutHistoryCard
              key={entry.id}
              entry={entry}
              compact
              onPress={() =>
                router.push({
                  pathname: '/historico-entreno-detalle',
                  params: { id: entry.id },
                } as Href)
              }
            />
          ))}
        </View>
      </View>

      <View>
        <SectionHeader title="Adherencia histórica" />
        <Card>
          <ThemedText type="small" themeColor="textSecondary" style={styles.adherenceNote}>
            Porcentaje de entrenos completados por semana
          </ThemedText>
          <BarChart data={adherenceWeeks} height={170} max={100} colors={Brand.gradientPrimary} />
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
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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

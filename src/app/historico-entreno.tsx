import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { WorkoutHistoryCard } from '@/components/training/workout-history-card';
import { ThemedText } from '@/components/themed-text';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import { groupWorkoutHistoryByWeek, workoutHistory } from '@/data/mock';

export default function HistoricoEntrenoScreen() {
  const router = useRouter();
  const grouped = groupWorkoutHistoryByWeek(workoutHistory);

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Entrenamiento"
          title="Histórico"
          subtitle="Consulta tus sesiones y marcas de semanas anteriores"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.list}>
        {grouped.map(({ week, items }) => (
          <View key={week} style={styles.weekBlock}>
            <ThemedText type="label" themeColor="textMuted" style={styles.weekLabel}>
              SEMANA {week}
            </ThemedText>
            <View style={styles.weekItems}>
              {items.map((entry) => (
                <WorkoutHistoryCard
                  key={entry.id}
                  entry={entry}
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
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.four },
  weekBlock: { gap: Spacing.two },
  weekLabel: { letterSpacing: 1.2 },
  weekItems: { gap: Spacing.three },
});

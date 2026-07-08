import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/data/mock';
import { formatRepRange, routine } from '@/data/mock';

function formatTime(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SesionEntrenoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const dayIndex = Number(day ?? 0);
  const session = routine[dayIndex] ?? routine[0];

  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = () => {
    setStarted(true);
    setRunning(true);
  };

  const totalSeries = session.exercises.reduce(
    (acc, ex) => acc + (ex.type === 'strength' ? ex.seriesCount ?? 0 : 1),
    0,
  );

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Sesión de entrenamiento"
          title={session.focus}
          subtitle={`${session.day} · ${session.exercises.length} ejercicios · ${session.duration}`}
          showBack
          gradient={Brand.gradientNavy}>
          <View style={styles.timerCard}>
            <View style={styles.timerLeft}>
              <ThemedText type="label" style={styles.timerLabel}>
                {started ? (running ? 'En curso' : 'En pausa') : 'Listo para empezar'}
              </ThemedText>
              <ThemedText type="display" style={styles.timerValue}>
                {formatTime(seconds)}
              </ThemedText>
              <ThemedText type="caption" style={styles.timerSub}>
                {session.exercises.length} ejercicios · {totalSeries} series
              </ThemedText>
            </View>
            {!started ? (
              <Pressable style={styles.startBtn} onPress={start}>
                <Ionicons name="play" size={26} color="#0A1B33" />
              </Pressable>
            ) : (
              <View style={styles.timerControls}>
                <Pressable
                  style={styles.controlBtn}
                  onPress={() => setRunning((r) => !r)}>
                  <Ionicons name={running ? 'pause' : 'play'} size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        </GradientHeader>
      }>
      <View style={styles.list}>
        {session.exercises.map((ex, i) => (
          <ExerciseCard key={ex.name} exercise={ex} index={i + 1} />
        ))}
      </View>

      <Button
        title="Finalizar y guardar sesión"
        icon="checkmark-done"
        onPress={() => router.back()}
      />
      <Button title="Descartar" variant="ghost" icon="close" onPress={() => router.back()} />
    </Screen>
  );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const theme = useTheme();
  const isCardio = exercise.type === 'cardio';

  return (
    <Card style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <IconBadge
          name={isCardio ? 'heart' : 'barbell'}
          color={theme.primary}
          background={theme.primarySoft}
          size={42}
        />
        <View style={styles.exerciseInfo}>
          <ThemedText type="h3">{exercise.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isCardio ? 'Cardio' : `Objetivo ${exercise.sets}`} · Descanso {exercise.rest}
          </ThemedText>
        </View>
        <Badge label={isCardio ? 'Cardio' : 'Fuerza'} tone={isCardio ? 'coral' : 'gold'} />
      </View>

      {isCardio ? (
        <CardioInputs exercise={exercise} />
      ) : (
        <StrengthSets exercise={exercise} />
      )}
    </Card>
  );
}

function StrengthSets({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();
  const count = exercise.seriesCount ?? 3;
  const repLabel = exercise.repUnit === 's' ? 'SEG' : 'REPS';
  const repPlaceholder = formatRepRange(exercise);

  return (
    <View style={styles.setTable}>
      <View style={styles.setHeaderRow}>
        <ThemedText type="caption" themeColor="textMuted" style={styles.colSerie}>
          SERIE
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted" style={styles.colInput}>
          PESO (KG)
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted" style={styles.colInput}>
          {repLabel}
        </ThemedText>
        <View style={styles.colCheck} />
      </View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.setRow}>
          <View style={[styles.serieBadge, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="smallBold" themeColor="primary">
              {i + 1}
            </ThemedText>
          </View>
          <View style={styles.colInput}>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
              placeholder="—"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colInput}>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
              placeholder={repPlaceholder}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <Pressable style={styles.colCheck}>
            {({ pressed }) => (
              <View
                style={[
                  styles.setCheck,
                  { borderColor: theme.border },
                  pressed && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}>
                <Ionicons name="checkmark" size={15} color={pressed ? '#0A1B33' : theme.textMuted} />
              </View>
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function CardioInputs({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();

  const fields = [
    { key: 'km', label: 'Distancia', unit: 'km', icon: 'map-outline', placeholder: exercise.targetKm ? `${exercise.targetKm}` : '0.0' },
    { key: 'speed', label: 'Velocidad', unit: 'km/h', icon: 'speedometer-outline', placeholder: '0.0' },
    { key: 'hr', label: 'FC media', unit: 'ppm', icon: 'heart-outline', placeholder: '0' },
  ] as const;

  return (
    <View style={styles.cardioGrid}>
      {fields.map((f) => (
        <View key={f.key} style={[styles.cardioField, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name={f.icon} size={18} color={theme.primary} />
          <ThemedText type="caption" themeColor="textMuted">
            {f.label}
          </ThemedText>
          <View style={styles.cardioInputRow}>
            <TextInput
              style={[styles.cardioInput, { color: theme.text }]}
              placeholder={f.placeholder}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
            <ThemedText type="caption" themeColor="textSecondary" style={styles.cardioUnit}>
              {f.unit}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timerCard: {
    marginTop: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerLeft: { gap: 2 },
  timerLabel: { color: 'rgba(255,255,255,0.75)' },
  timerValue: { color: '#FFFFFF' },
  timerSub: { color: 'rgba(255,255,255,0.75)' },
  startBtn: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Brand.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerControls: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: Spacing.three },
  exerciseCard: { gap: Spacing.three },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  exerciseInfo: { flex: 1, gap: 2 },
  setTable: { gap: Spacing.two },
  setHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
  },
  colSerie: { width: 44 },
  colInput: { flex: 1, paddingHorizontal: Spacing.one },
  colCheck: { width: 44, alignItems: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serieBadge: {
    width: 44,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  setCheck: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardioGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cardioField: {
    flex: 1,
    minWidth: 0,
    borderRadius: Radius.md,
    padding: Spacing.two,
    gap: 4,
    alignItems: 'flex-start',
  },
  cardioInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    width: '100%',
  },
  cardioInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '800',
    padding: 0,
  },
  cardioUnit: {
    flexShrink: 0,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useRoutine } from '@/context/routine-context';
import { useWorkoutHistory } from '@/context/workout-history-context';
import { useTheme } from '@/hooks/use-theme';
import { formatRepRange, type Exercise } from '@/types/routine-day';
import type { ExerciseLog } from '@/types/workout-history';

type StrengthSetDraft = {
  weightKg: string;
  reps: string;
};

type CardioDraft = {
  km: string;
  speedKmh: string;
  avgHr: string;
};

type ExerciseDraft = {
  strengthSets?: StrengthSetDraft[];
  cardio?: CardioDraft;
};

function formatTime(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatSessionDate(date = new Date()): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function parseNumber(value: string, fallback = 0): number {
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function buildInitialDrafts(exercises: Exercise[]): Record<string, ExerciseDraft> {
  const drafts: Record<string, ExerciseDraft> = {};
  for (const exercise of exercises) {
    if (exercise.type === 'cardio') {
      drafts[exercise.name] = {
        cardio: {
          km: exercise.targetKm ? String(exercise.targetKm) : '',
          speedKmh: '',
          avgHr: '',
        },
      };
    } else {
      const count = exercise.seriesCount ?? 3;
      drafts[exercise.name] = {
        strengthSets: Array.from({ length: count }, () => ({
          weightKg: '',
          reps: '',
        })),
      };
    }
  }
  return drafts;
}

function draftsToExerciseLogs(
  exercises: Exercise[],
  drafts: Record<string, ExerciseDraft>,
): ExerciseLog[] {
  return exercises.map((exercise) => {
    const draft = drafts[exercise.name];
    if (exercise.type === 'cardio') {
      return {
        name: exercise.name,
        type: 'cardio',
        cardio: {
          km: parseNumber(draft?.cardio?.km ?? ''),
          speedKmh: parseNumber(draft?.cardio?.speedKmh ?? ''),
          avgHr: parseNumber(draft?.cardio?.avgHr ?? ''),
        },
      };
    }

    const strengthSets = (draft?.strengthSets ?? []).map((set, index) => ({
      set: index + 1,
      weightKg: parseNumber(set.weightKg),
      reps: parseNumber(set.reps, exercise.repRange?.min ?? 0),
    }));

    return {
      name: exercise.name,
      type: 'strength',
      strengthSets,
    };
  });
}

export default function SesionEntrenoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const dayIndex = Number(day ?? 0);
  const { client } = useClient();
  const { routine, loading, error } = useRoutine();
  const { createWorkout, saving } = useWorkoutHistory();
  const session = routine[dayIndex] ?? routine[0];

  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, ExerciseDraft>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = session?._id ?? '';

  useEffect(() => {
    if (!session) return;
    setDrafts(buildInitialDrafts(session.exercises));
    setSaveError(null);
  }, [sessionId]);

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

  const totalSeries = useMemo(
    () =>
      session?.exercises.reduce(
        (acc, ex) => acc + (ex.type === 'strength' ? ex.seriesCount ?? 0 : 1),
        0,
      ) ?? 0,
    [session],
  );

  const updateStrengthSet = (
    exerciseName: string,
    setIndex: number,
    field: keyof StrengthSetDraft,
    value: string,
  ) => {
    setDrafts((prev) => {
      const current = prev[exerciseName]?.strengthSets ?? [];
      const nextSets = current.map((set, index) =>
        index === setIndex ? { ...set, [field]: value } : set,
      );
      return {
        ...prev,
        [exerciseName]: { ...prev[exerciseName], strengthSets: nextSets },
      };
    });
  };

  const updateCardio = (exerciseName: string, field: keyof CardioDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        cardio: {
          km: prev[exerciseName]?.cardio?.km ?? '',
          speedKmh: prev[exerciseName]?.cardio?.speedKmh ?? '',
          avgHr: prev[exerciseName]?.cardio?.avgHr ?? '',
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!client || !session || saving) return;

    setRunning(false);
    setSaveError(null);

    const durationMinutes = Math.max(1, Math.round(seconds / 60) || 1);
    const exercises = draftsToExerciseLogs(session.exercises, drafts);

    try {
      await createWorkout({
        week: client.week,
        date: formatSessionDate(),
        day: session.day,
        focus: session.focus,
        duration: `${durationMinutes} min`,
        durationMinutes,
        exercises,
      });
      router.back();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar la sesión');
    }
  };

  if (loading) {
    return (
      <Screen withTabBar={false}>
        <ThemedText type="body" themeColor="textSecondary">
          Cargando sesión…
        </ThemedText>
      </Screen>
    );
  }

  if (error || !session || !client) {
    return (
      <Screen withTabBar={false}>
        <ThemedText type="body" themeColor="textSecondary">
          {error ?? 'No hay día de rutina disponible.'}
        </ThemedText>
        <Button title="Volver" variant="ghost" icon="close" onPress={() => router.back()} />
      </Screen>
    );
  }

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
          <ExerciseCard
            key={ex.name}
            exercise={ex}
            index={i + 1}
            draft={drafts[ex.name]}
            onChangeStrength={(setIndex, field, value) =>
              updateStrengthSet(ex.name, setIndex, field, value)
            }
            onChangeCardio={(field, value) => updateCardio(ex.name, field, value)}
          />
        ))}
      </View>

      {saveError ? (
        <ThemedText type="body" themeColor="textSecondary" style={styles.saveError}>
          {saveError}
        </ThemedText>
      ) : null}

      <Button
        title={saving ? 'Guardando…' : 'Finalizar y guardar sesión'}
        icon="checkmark-done"
        onPress={() => {
          void handleSave();
        }}
        disabled={saving}
      />
      <Button
        title="Descartar"
        variant="ghost"
        icon="close"
        onPress={() => router.back()}
        disabled={saving}
      />
    </Screen>
  );
}

function ExerciseCard({
  exercise,
  index,
  draft,
  onChangeStrength,
  onChangeCardio,
}: {
  exercise: Exercise;
  index: number;
  draft?: ExerciseDraft;
  onChangeStrength: (setIndex: number, field: keyof StrengthSetDraft, value: string) => void;
  onChangeCardio: (field: keyof CardioDraft, value: string) => void;
}) {
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
          <ThemedText type="h3">
            {index}. {exercise.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isCardio ? 'Cardio' : `Objetivo ${exercise.sets}`} · Descanso {exercise.rest}
          </ThemedText>
        </View>
        <Badge label={isCardio ? 'Cardio' : 'Fuerza'} tone={isCardio ? 'coral' : 'gold'} />
      </View>

      {isCardio ? (
        <CardioInputs
          exercise={exercise}
          value={draft?.cardio}
          onChange={onChangeCardio}
        />
      ) : (
        <StrengthSets
          exercise={exercise}
          value={draft?.strengthSets}
          onChange={onChangeStrength}
        />
      )}
    </Card>
  );
}

function StrengthSets({
  exercise,
  value,
  onChange,
}: {
  exercise: Exercise;
  value?: StrengthSetDraft[];
  onChange: (setIndex: number, field: keyof StrengthSetDraft, value: string) => void;
}) {
  const theme = useTheme();
  const count = exercise.seriesCount ?? 3;
  const sets = value ?? Array.from({ length: count }, () => ({ weightKg: '', reps: '' }));
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
      {sets.map((set, i) => (
        <View key={i} style={styles.setRow}>
          <View style={[styles.serieBadge, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="smallBold" themeColor="primary">
              {i + 1}
            </ThemedText>
          </View>
          <View style={styles.colInput}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
              value={set.weightKg}
              onChangeText={(text) => onChange(i, 'weightKg', text)}
              placeholder="—"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colInput}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
              value={set.reps}
              onChangeText={(text) => onChange(i, 'reps', text)}
              placeholder={repPlaceholder}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.colCheck}>
            <View style={[styles.setCheck, { borderColor: theme.border }]}>
              <Ionicons name="checkmark" size={15} color={theme.textMuted} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function CardioInputs({
  exercise,
  value,
  onChange,
}: {
  exercise: Exercise;
  value?: CardioDraft;
  onChange: (field: keyof CardioDraft, value: string) => void;
}) {
  const theme = useTheme();
  const draft = value ?? { km: '', speedKmh: '', avgHr: '' };

  const fields = [
    {
      key: 'km' as const,
      label: 'Distancia',
      unit: 'km',
      icon: 'map-outline' as const,
      placeholder: exercise.targetKm ? `${exercise.targetKm}` : '0.0',
    },
    {
      key: 'speedKmh' as const,
      label: 'Velocidad',
      unit: 'km/h',
      icon: 'speedometer-outline' as const,
      placeholder: '0.0',
    },
    {
      key: 'avgHr' as const,
      label: 'FC media',
      unit: 'ppm',
      icon: 'heart-outline' as const,
      placeholder: '0',
    },
  ];

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
              value={draft[f.key]}
              onChangeText={(text) => onChange(f.key, text)}
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
  saveError: { marginBottom: Spacing.two },
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

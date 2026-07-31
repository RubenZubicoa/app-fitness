import { normalizeId } from '@/types/program';
import type { ExerciseType } from '@/types/routine-day';

export type StrengthSetLog = {
  set: number;
  weightKg: number;
  reps: number;
};

export type CardioLog = {
  km: number;
  speedKmh: number;
  avgHr: number;
};

export type ExerciseLog = {
  name: string;
  type: ExerciseType;
  strengthSets?: StrengthSetLog[];
  cardio?: CardioLog;
};

export type WorkoutHistoryEntry = {
  _id: string;
  clientId: string;
  week: number;
  date: string;
  day: string;
  focus: string;
  duration: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
};

/** Agrupa el histórico por semana (orden descendente). */
export function groupWorkoutHistoryByWeek(entries: WorkoutHistoryEntry[]) {
  const map = new Map<number, WorkoutHistoryEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.week) ?? [];
    list.push(entry);
    map.set(entry.week, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b - a)
    .map(([week, items]) => ({ week, items }));
}

function normalizeStrengthSets(value: unknown): StrengthSetLog[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      set: Number(item.set ?? 0),
      weightKg: Number(item.weightKg ?? 0),
      reps: Number(item.reps ?? 0),
    };
  });
}

function normalizeCardio(value: unknown): CardioLog | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  return {
    km: Number(item.km ?? 0),
    speedKmh: Number(item.speedKmh ?? 0),
    avgHr: Number(item.avgHr ?? 0),
  };
}

function normalizeExerciseLog(raw: Record<string, unknown>): ExerciseLog {
  const typeRaw = String(raw.type ?? 'strength');
  const type: ExerciseType = typeRaw === 'cardio' ? 'cardio' : 'strength';
  const exercise: ExerciseLog = {
    name: String(raw.name ?? ''),
    type,
  };

  const strengthSets = normalizeStrengthSets(raw.strengthSets);
  if (strengthSets) exercise.strengthSets = strengthSets;

  const cardio = normalizeCardio(raw.cardio);
  if (cardio) exercise.cardio = cardio;

  return exercise;
}

export function normalizeWorkoutHistory(raw: Record<string, unknown>): WorkoutHistoryEntry {
  const exercisesRaw = Array.isArray(raw.exercises) ? raw.exercises : [];
  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    week: Number(raw.week ?? 0),
    date: String(raw.date ?? ''),
    day: String(raw.day ?? ''),
    focus: String(raw.focus ?? ''),
    duration: String(raw.duration ?? ''),
    durationMinutes: Number(raw.durationMinutes ?? 0),
    exercises: exercisesRaw.map((entry) =>
      normalizeExerciseLog((entry ?? {}) as Record<string, unknown>),
    ),
  };
}

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

/** Foto o vídeo adjunto a una sesión. */
export type WorkoutMedia = {
  uri: string;
  type: 'image' | 'video';
  mimeType?: string;
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
  media?: WorkoutMedia[];
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

export type AdherenceWeek = {
  label: string;
  value: number;
  highlight?: boolean;
};

/**
 * Adherencia histórica por semana:
 * sesiones completadas / entrenos planificados en la rutina × 100.
 */
export function computeAdherenceWeeks(
  history: WorkoutHistoryEntry[],
  plannedPerWeek: number,
  currentWeek: number,
): AdherenceWeek[] {
  const planned = Math.max(0, plannedPerWeek);
  const counts = new Map<number, number>();
  let maxHistoryWeek = 0;

  for (const entry of history) {
    const week = Number(entry.week);
    if (!Number.isFinite(week) || week <= 0) continue;
    counts.set(week, (counts.get(week) ?? 0) + 1);
    if (week > maxHistoryWeek) maxHistoryWeek = week;
  }

  const lastWeek = Math.max(1, currentWeek, maxHistoryWeek);
  const weeks: AdherenceWeek[] = [];

  for (let week = 1; week <= lastWeek; week++) {
    const completed = counts.get(week) ?? 0;
    const value =
      planned <= 0
        ? 0
        : Math.max(0, Math.min(100, Math.round((completed / planned) * 100)));
    weeks.push({
      label: `S${week}`,
      value,
      highlight: value > 0,
    });
  }

  return weeks;
}

/** Sesiones del histórico para una semana concreta. */
export function countWorkoutsInWeek(
  history: WorkoutHistoryEntry[],
  week: number,
): number {
  return history.filter((entry) => entry.week === week).length;
}

export type WorkoutWeekDay = {
  label: string;
  value: number;
  highlight?: boolean;
};

const WEEKDAY_BARS: { prefixes: string[]; label: string }[] = [
  { prefixes: ['lun'], label: 'L' },
  { prefixes: ['mar'], label: 'M' },
  { prefixes: ['mié', 'mie'], label: 'X' },
  { prefixes: ['jue'], label: 'J' },
  { prefixes: ['vie'], label: 'V' },
  { prefixes: ['sáb', 'sab'], label: 'S' },
  { prefixes: ['dom'], label: 'D' },
];

/** Extrae la etiqueta L–D desde `date` (ej. "Lun 26 may"). */
function weekdayLabelFromDate(date: string): string | null {
  const prefix = date.trim().toLowerCase().slice(0, 3);
  const match = WEEKDAY_BARS.find((day) => day.prefixes.includes(prefix));
  return match?.label ?? null;
}

/**
 * Checks semanales (L–D) de una semana:
 * 100 si hay al menos una sesión ese día, 0 si no.
 */
export function computeWorkoutWeek(
  history: WorkoutHistoryEntry[],
  week: number,
): WorkoutWeekDay[] {
  const completedLabels = new Set<string>();

  for (const entry of history) {
    if (entry.week !== week) continue;
    const label = weekdayLabelFromDate(entry.date);
    if (label) completedLabels.add(label);
  }

  return WEEKDAY_BARS.map(({ label }) => {
    const done = completedLabels.has(label);
    return {
      label,
      value: done ? 100 : 0,
      highlight: done,
    };
  });
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
  const mediaRaw = Array.isArray(raw.media) ? raw.media : [];
  const media: WorkoutMedia[] = mediaRaw
    .map((entry) => {
      const item = (entry ?? {}) as Record<string, unknown>;
      const uri = String(item.uri ?? '').trim();
      const typeRaw = String(item.type ?? '').trim();
      const type: WorkoutMedia['type'] | null =
        typeRaw === 'video' ? 'video' : typeRaw === 'image' ? 'image' : null;
      if (!uri || !type) return null;
      return {
        uri,
        type,
        ...(item.mimeType ? { mimeType: String(item.mimeType) } : {}),
      };
    })
    .filter((item): item is WorkoutMedia => item != null);

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
    ...(media.length > 0 ? { media } : {}),
  };
}

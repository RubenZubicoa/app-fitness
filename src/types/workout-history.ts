import { normalizeId } from '@/types/program';
import type { ExerciseType } from '@/types/routine-day';

export type StrengthSetLog = {
  set: number;
  weightKg: number;
  reps: number;
};

export type CardioLog = {
  km: number;
  /** Ritmo medio en min/km (ej. "5:30"). */
  paceMinKm: string;
  avgHr: number;
  durationMinutes: number;
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

export type PlanDateRange = {
  startDate?: string;
  endDate?: string;
};

function entryDateMs(date: string): number | null {
  const raw = date.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const ms = new Date(`${raw.slice(0, 10)}T12:00:00`).getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function parsePlanBoundMs(
  isoDate: string | undefined,
  endOfDay: boolean,
): number | null {
  const raw = isoDate?.trim().slice(0, 10);
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const ms = new Date(
    `${raw}T${endOfDay ? '23:59:59' : '00:00:00'}`,
  ).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** True si la sesión cae dentro de [startDate, endDate] del plan (ambos inclusivos). */
export function isWithinPlanDates(
  date: string,
  range?: PlanDateRange,
): boolean {
  if (!range?.startDate && !range?.endDate) return true;
  const entryMs = entryDateMs(date);
  if (entryMs == null) return false;
  const startMs = parsePlanBoundMs(range.startDate, false);
  const endMs = parsePlanBoundMs(range.endDate, true);
  if (startMs != null && entryMs < startMs) return false;
  if (endMs != null && entryMs > endMs) return false;
  return true;
}

/**
 * Adherencia histórica por semana:
 * sesiones completadas / entrenos planificados en la rutina × 100.
 * Si se indica rango del plan, solo cuenta sesiones entre startDate y endDate
 * y limita el eje a las semanas de ese plan.
 */
export function computeAdherenceWeeks(
  history: WorkoutHistoryEntry[],
  plannedPerWeek: number,
  currentWeek: number,
  options?: PlanDateRange & { totalWeeks?: number },
): AdherenceWeek[] {
  const planned = Math.max(0, plannedPerWeek);
  const planCap =
    options?.totalWeeks != null && options.totalWeeks > 0
      ? options.totalWeeks
      : null;

  const counts = new Map<number, number>();
  let maxHistoryWeek = 0;

  for (const entry of history) {
    if (!isWithinPlanDates(entry.date, options)) continue;

    const week = Number(entry.week);
    if (!Number.isFinite(week) || week <= 0) continue;
    if (planCap != null && week > planCap) continue;

    counts.set(week, (counts.get(week) ?? 0) + 1);
    if (week > maxHistoryWeek) maxHistoryWeek = week;
  }

  const uncappedLast = Math.max(1, currentWeek, maxHistoryWeek);
  const lastWeek = planCap != null ? Math.min(planCap, uncappedLast) : uncappedLast;
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

/** Sesiones del histórico para una semana concreta (opcionalmente acotadas al plan). */
export function countWorkoutsInWeek(
  history: WorkoutHistoryEntry[],
  week: number,
  planRange?: PlanDateRange,
): number {
  return history.filter(
    (entry) =>
      entry.week === week && isWithinPlanDates(entry.date, planRange),
  ).length;
}

export type WorkoutWeekDay = {
  label: string;
  value: number;
  highlight?: boolean;
};

const WEEKDAY_BARS: { prefixes: string[]; label: string; jsDay: number }[] = [
  { prefixes: ['lun'], label: 'L', jsDay: 1 },
  { prefixes: ['mar'], label: 'M', jsDay: 2 },
  { prefixes: ['mié', 'mie'], label: 'X', jsDay: 3 },
  { prefixes: ['jue'], label: 'J', jsDay: 4 },
  { prefixes: ['vie'], label: 'V', jsDay: 5 },
  { prefixes: ['sáb', 'sab'], label: 'S', jsDay: 6 },
  { prefixes: ['dom'], label: 'D', jsDay: 0 },
];

/** Extrae la etiqueta L–D desde `date` (ISO "YYYY-MM-DD" o legado "Lun 26 may"). */
function weekdayLabelFromDate(date: string): string | null {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parsed = new Date(`${trimmed.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    return WEEKDAY_BARS.find((day) => day.jsDay === parsed.getDay())?.label ?? null;
  }

  const prefix = trimmed.toLowerCase().slice(0, 3);
  const match = WEEKDAY_BARS.find((day) => day.prefixes.includes(prefix));
  return match?.label ?? null;
}

/** Formato legible para UI (ej. "22 mar 2026"). Compatible con ISO y legado. */
export function formatWorkoutHistoryDate(date: string): string {
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parsed = new Date(`${trimmed.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return trimmed;
    return parsed.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return trimmed;
}

/**
 * Checks semanales (L–D) de una semana:
 * 100 si hay al menos una sesión ese día, 0 si no.
 * Si se indica rango del plan, ignora sesiones fuera de startDate–endDate.
 */
export function computeWorkoutWeek(
  history: WorkoutHistoryEntry[],
  week: number,
  planRange?: PlanDateRange,
): WorkoutWeekDay[] {
  const completedLabels = new Set<string>();

  for (const entry of history) {
    if (entry.week !== week) continue;
    if (!isWithinPlanDates(entry.date, planRange)) continue;
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
  const paceRaw = item.paceMinKm ?? item.avgPace ?? item.speedKmh ?? '';
  return {
    km: Number(item.km ?? 0),
    paceMinKm: String(paceRaw).trim(),
    avgHr: Number(item.avgHr ?? 0),
    durationMinutes: Number(item.durationMinutes ?? 0),
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

import { normalizeId } from '@/types/program';

export type ExerciseType = 'strength' | 'cardio';

export type RepRange = {
  min: number;
  max: number;
};

export type Exercise = {
  name: string;
  /** Descripción de series, p. ej. "4 x 8-10" (fuerza) o "15 min" (cardio). */
  sets: string;
  rest: string;
  type: ExerciseType;
  /** Nº de series a registrar (solo fuerza). */
  seriesCount?: number;
  /** Rango de repeticiones objetivo por serie (solo fuerza). */
  repRange?: RepRange;
  /** Unidad del rango: repeticiones o segundos (p. ej. plancha). */
  repUnit?: 'reps' | 's';
  /** Objetivos de cardio. */
  targetKm?: number;
  /** URL de imagen ilustrativa del ejercicio. */
  imageUrl?: string;
  /** Explicación técnica de ejecución. */
  explanation?: string;
};

export type RoutineDay = {
  _id: string;
  clientId: string;
  day: string;
  focus: string;
  done: boolean;
  duration: string;
  exercises: Exercise[];
};

/** Formatea el rango de reps/segundos para mostrar en UI. */
export function formatRepRange(exercise: Exercise): string {
  if (!exercise.repRange) return '—';
  const { min, max } = exercise.repRange;
  const suffix = exercise.repUnit === 's' ? 's' : '';
  if (min === max) return `${min}${suffix}`;
  return `${min}-${max}${suffix}`;
}

function normalizeExercise(raw: Record<string, unknown>): Exercise {
  const typeRaw = String(raw.type ?? 'strength');
  const type: ExerciseType = typeRaw === 'cardio' ? 'cardio' : 'strength';

  const exercise: Exercise = {
    name: String(raw.name ?? ''),
    sets: String(raw.sets ?? ''),
    rest: String(raw.rest ?? ''),
    type,
  };

  if (raw.seriesCount !== undefined && raw.seriesCount !== null && raw.seriesCount !== '') {
    exercise.seriesCount = Number(raw.seriesCount);
  }

  if (raw.repRange && typeof raw.repRange === 'object') {
    const range = raw.repRange as Record<string, unknown>;
    exercise.repRange = {
      min: Number(range.min ?? 0),
      max: Number(range.max ?? 0),
    };
  }

  if (raw.repUnit === 'reps' || raw.repUnit === 's') {
    exercise.repUnit = raw.repUnit;
  }

  if (raw.targetKm !== undefined && raw.targetKm !== null && raw.targetKm !== '') {
    exercise.targetKm = Number(raw.targetKm);
  }

  if (raw.imageUrl !== undefined && raw.imageUrl !== null && String(raw.imageUrl).trim()) {
    exercise.imageUrl = String(raw.imageUrl).trim();
  }

  if (
    raw.explanation !== undefined &&
    raw.explanation !== null &&
    String(raw.explanation).trim()
  ) {
    exercise.explanation = String(raw.explanation).trim();
  }

  return exercise;
}

export function normalizeRoutineDay(raw: Record<string, unknown>): RoutineDay {
  const exercisesRaw = Array.isArray(raw.exercises) ? raw.exercises : [];
  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    day: String(raw.day ?? ''),
    focus: String(raw.focus ?? ''),
    done: Boolean(raw.done),
    duration: String(raw.duration ?? ''),
    exercises: exercisesRaw.map((entry) =>
      normalizeExercise((entry ?? {}) as Record<string, unknown>),
    ),
  };
}

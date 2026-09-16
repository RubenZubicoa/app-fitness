import type { DailySteps } from '@/types/daily-steps';
import type { EnrichedWellness } from '@/types/wellness';
import type { Weight } from '@/types/weight';
import { getLatestWeightValue } from '@/types/weight';

export type WeeklyScoreBreakdownItem = {
  label: string;
  value: number;
};

export type WeeklyScore = {
  value: number;
  label: string;
  breakdown: WeeklyScoreBreakdownItem[];
};

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Adherencia de entrenos: sesiones completadas / planificadas esta semana. */
export function scoreFromWorkouts(completed: number, planned: number): number {
  if (planned <= 0) return 0;
  return clampScore((Math.max(0, completed) / planned) * 100);
}

/** Adherencia de pasos (media diaria vs goal, tope 100). */
export function scoreFromSteps(steps: DailySteps | null): number {
  if (!steps || steps.goal <= 0 || steps.days.length === 0) return 0;
  const dayScores = steps.days.map((d) => Math.min(d.value / steps.goal, 1) * 100);
  const avg = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
  return clampScore(avg);
}

/** Bienestar: media de las sensaciones más recientes (0–100). */
export function scoreFromWellness(wellness: EnrichedWellness[]): number {
  if (wellness.length === 0) return 0;
  const avg = wellness.reduce((acc, item) => acc + item.value, 0) / wellness.length;
  return clampScore(avg);
}

/**
 * Progreso hacia el peso objetivo:
 * 100 = en el objetivo; 0 = igual o más lejos que al inicio.
 */
export function scoreFromWeight(weight: Weight | null): number {
  if (!weight) return 0;
  const current = getLatestWeightValue(weight);
  const startDistance = Math.abs(weight.start - weight.target);
  const currentDistance = Math.abs(current - weight.target);

  if (startDistance <= 0) {
    return currentDistance <= 0.05 ? 100 : 0;
  }

  return clampScore((1 - currentDistance / startDistance) * 100);
}

/** Calcula la puntuación semanal a partir de datos reales del cliente. */
export function computeWeeklyScore(input: {
  workoutsCompleted: number;
  workoutsPlanned: number;
  steps: DailySteps | null;
  wellness: EnrichedWellness[];
  weight: Weight | null;
}): WeeklyScore {
  const breakdown: WeeklyScoreBreakdownItem[] = [
    {
      label: 'Entrenos',
      value: scoreFromWorkouts(input.workoutsCompleted, input.workoutsPlanned),
    },
    { label: 'Pasos', value: scoreFromSteps(input.steps) },
    { label: 'Bienestar', value: scoreFromWellness(input.wellness) },
    { label: 'Peso', value: scoreFromWeight(input.weight) },
  ];

  const value = clampScore(
    breakdown.reduce((acc, item) => acc + item.value, 0) / breakdown.length,
  );

  return {
    value,
    label: 'Puntuación semanal',
    breakdown,
  };
}

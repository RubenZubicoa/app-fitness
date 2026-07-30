import type { DailySteps } from '@/types/daily-steps';
import type { EnrichedWellness } from '@/types/wellness';

export type WeeklyScoreBreakdownItem = {
  label: string;
  value: number;
};

export type WeeklyScore = {
  value: number;
  label: string;
  breakdown: WeeklyScoreBreakdownItem[];
};

type WorkoutDay = {
  label: string;
  value: number;
  highlight?: boolean;
};

type MacroItem = {
  grams: number;
  target: number;
};

type MacrosInput = {
  calories: number;
  target: number;
  items: readonly MacroItem[];
} | null;

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Adherencia de entrenos (media 0–100 de la semana). */
export function scoreFromWorkouts(days: readonly WorkoutDay[]): number {
  if (days.length === 0) return 0;
  const sum = days.reduce((acc, d) => acc + d.value, 0);
  return clampScore(sum / days.length);
}

/** Adherencia nutricional (calorías + macros vs objetivo). */
export function scoreFromNutrition(macros: MacrosInput): number {
  if (!macros || macros.target <= 0 || macros.items.length === 0) return 0;
  const calorieScore = Math.min(macros.calories / macros.target, 1) * 100;
  const macroScores = macros.items.map((item) =>
    item.target > 0 ? Math.min(item.grams / item.target, 1) * 100 : 0,
  );
  const all = [calorieScore, ...macroScores];
  const avg = all.reduce((a, b) => a + b, 0) / all.length;
  return clampScore(avg);
}

/** Adherencia de pasos (media diaria vs goal, tope 100). */
export function scoreFromSteps(steps: DailySteps | null): number {
  if (!steps || steps.goal <= 0 || steps.days.length === 0) return 0;
  const dayScores = steps.days.map((d) => Math.min(d.value / steps.goal, 1) * 100);
  const avg = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
  return clampScore(avg);
}

/** Descanso a partir de la sensación `sueno` (0–100). */
export function scoreFromRest(wellness: EnrichedWellness[]): number {
  const sleep = wellness.find((w) => w.key === 'sueno');
  if (!sleep) return 0;
  return clampScore(sleep.value);
}

/** Calcula la puntuación semanal a partir de entrenos, nutrición, pasos y descanso. */
export function computeWeeklyScore(input: {
  workouts: readonly WorkoutDay[];
  macros: MacrosInput;
  steps: DailySteps | null;
  wellness: EnrichedWellness[];
}): WeeklyScore {
  const breakdown: WeeklyScoreBreakdownItem[] = [
    { label: 'Entrenos', value: scoreFromWorkouts(input.workouts) },
    { label: 'Nutrición', value: scoreFromNutrition(input.macros) },
    { label: 'Pasos', value: scoreFromSteps(input.steps) },
    { label: 'Descanso', value: scoreFromRest(input.wellness) },
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

import type { Measurement } from '@/types/measurement';
import type { ProgressImage } from '@/types/progress-image';
import type {
  TechnicalSpecifications,
} from '@/types/technical-specifications';
import {
  isDailyRecallComplete,
  isEatingHabitsComplete,
  isExerciseHabitsComplete,
  isLifestyleComplete,
  isObservationsComplete,
  isPersonalHistoryComplete,
} from '@/types/technical-specifications';
import type { Weight } from '@/types/weight';
import type { OnboardingStepId } from '@/onboarding/types';

export type BaselineProgressInput = {
  weight: Weight | null;
  measurements: Measurement[];
  images: ProgressImage[];
};

export type OnboardingEvaluationInput = BaselineProgressInput & {
  technicalSpecs: TechnicalSpecifications | null;
};

export function hasRegisteredWeight(weight: Weight | null): boolean {
  if (!weight) return false;
  return weight.data.some((value) => Number.isFinite(value) && value > 0);
}

export function hasRegisteredMeasurements(measurements: Measurement[]): boolean {
  return measurements.some((item) => Number.isFinite(item.value) && item.value > 0);
}

export function hasRegisteredProgressImages(images: ProgressImage[]): boolean {
  return images.some((item) => Boolean(item.image?.trim()));
}

/** Paso 1: completo solo si hay peso, al menos una medida y al menos una foto. */
export function isBaselineProgressComplete(input: BaselineProgressInput): boolean {
  return (
    hasRegisteredWeight(input.weight) &&
    hasRegisteredMeasurements(input.measurements) &&
    hasRegisteredProgressImages(input.images)
  );
}

export type OnboardingCompletionMap = Record<OnboardingStepId, boolean>;

export function buildOnboardingCompletion(
  input: OnboardingEvaluationInput,
): OnboardingCompletionMap {
  const specs = input.technicalSpecs;

  return {
    'baseline-progress': isBaselineProgressComplete(input),
    'personal-history': specs ? isPersonalHistoryComplete(specs.personalHistory) : false,
    'eating-habits': specs ? isEatingHabitsComplete(specs.eatingHabits) : false,
    lifestyle: specs ? isLifestyleComplete(specs.lifestyle) : false,
    'exercise-habits': specs ? isExerciseHabitsComplete(specs.exerciseHabits) : false,
    'daily-recall': specs ? isDailyRecallComplete(specs.dailyRecall) : false,
    observations: specs
      ? isObservationsComplete(specs.observations, false)
      : false,
  };
}

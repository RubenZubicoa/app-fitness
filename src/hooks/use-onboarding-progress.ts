import { useMemo } from 'react';

import { useMeasurements } from '@/context/measurements-context';
import { useProgressImages } from '@/context/progress-images-context';
import { useTechnicalSpecifications } from '@/context/technical-specifications-context';
import { useWeights } from '@/context/weights-context';
import {
  buildOnboardingCompletion,
  ONBOARDING_STEPS,
  ONBOARDING_TOTAL_STEPS,
  type OnboardingStepStatus,
} from '@/onboarding';

/**
 * Calcula el progreso del registro post-alta (pasos pendientes / completados).
 * Extensible: nuevos pasos se evalúan en `buildOnboardingCompletion`.
 */
export function useOnboardingProgress() {
  const { weight, loading: weightLoading } = useWeights();
  const { measurements, loading: measurementsLoading } = useMeasurements();
  const { images, loading: imagesLoading } = useProgressImages();
  const { specs, loading: specsLoading } = useTechnicalSpecifications();

  const loading =
    weightLoading || measurementsLoading || imagesLoading || specsLoading;

  return useMemo(() => {
    const completion = buildOnboardingCompletion({
      weight,
      measurements,
      images,
      technicalSpecs: specs,
    });

    const steps: OnboardingStepStatus[] = ONBOARDING_STEPS.map((step, index) => ({
      ...step,
      index,
      done: completion[step.id],
    }));

    const pendingSteps = steps.filter((step) => !step.done);
    const completedCount = steps.length - pendingSteps.length;
    const isComplete = pendingSteps.length === 0;

    return {
      loading,
      steps,
      pendingSteps,
      completedCount,
      totalSteps: ONBOARDING_TOTAL_STEPS,
      isComplete,
      progress: ONBOARDING_TOTAL_STEPS === 0 ? 1 : completedCount / ONBOARDING_TOTAL_STEPS,
    };
  }, [weight, measurements, images, specs, loading]);
}

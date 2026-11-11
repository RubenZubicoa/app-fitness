export type {
  IoniconName,
  OnboardingStepDefinition,
  OnboardingStepId,
  OnboardingStepStatus,
} from '@/onboarding/types';
export { ONBOARDING_STEPS, ONBOARDING_TOTAL_STEPS } from '@/onboarding/steps';
export {
  buildOnboardingCompletion,
  hasRegisteredMeasurements,
  hasRegisteredProgressImages,
  hasRegisteredWeight,
  isBaselineProgressComplete,
  type BaselineProgressInput,
  type OnboardingCompletionMap,
  type OnboardingEvaluationInput,
} from '@/onboarding/evaluate';

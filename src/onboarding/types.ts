import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

export type IoniconName = keyof typeof Ionicons.glyphMap;

/** Identificadores de pasos del registro post-alta. */
export type OnboardingStepId =
  | 'baseline-progress'
  | 'personal-history'
  | 'eating-habits'
  | 'lifestyle'
  | 'exercise-habits'
  | 'daily-recall'
  | 'observations';

export type OnboardingStepDefinition = {
  id: OnboardingStepId;
  title: string;
  description: string;
  icon: IoniconName;
  /** Ruta a la que navega el enlace de completar este paso. */
  href: Href;
  actionLabel: string;
};

export type OnboardingStepStatus = OnboardingStepDefinition & {
  done: boolean;
  index: number;
};

import type { OnboardingStepDefinition } from '@/onboarding/types';
import { technicalSectionHref } from '@/technical-specifications/section-routing';

/**
 * Pasos del cuestionario / registro pendiente tras crear la cuenta.
 * Añadir aquí nuevos pasos cuando el producto los defina.
 */
export const ONBOARDING_STEPS: readonly OnboardingStepDefinition[] = [
  {
    id: 'baseline-progress',
    title: 'Peso, medidas e imágenes',
    description:
      'Registra tu punto de partida: peso corporal, medidas e imágenes de progreso.',
    icon: 'body-outline',
    href: '/anadir-registro',
    actionLabel: 'Registrar ahora',
  },
  {
    id: 'personal-history',
    title: 'Antecedentes personales',
    description: 'Enfermedades, lesiones, medicación, alergias y más.',
    icon: 'medkit-outline',
    href: technicalSectionHref('personalHistory'),
    actionLabel: 'Completar',
  },
  {
    id: 'eating-habits',
    title: 'Hábitos alimentarios',
    description: 'Ingestas, picoteos, bebidas y preferencias alimentarias.',
    icon: 'restaurant-outline',
    href: technicalSectionHref('eatingHabits'),
    actionLabel: 'Completar',
  },
  {
    id: 'lifestyle',
    title: 'Hábitos de vida',
    description: 'Sueño, tabaco, alcohol y consumo de agua.',
    icon: 'moon-outline',
    href: technicalSectionHref('lifestyle'),
    actionLabel: 'Completar',
  },
  {
    id: 'exercise-habits',
    title: 'Ejercicio físico',
    description: 'Deporte, nivel de fuerza, frecuencia y material.',
    icon: 'barbell-outline',
    href: technicalSectionHref('exerciseHabits'),
    actionLabel: 'Completar',
  },
  {
    id: 'daily-recall',
    title: 'Recordatorio 24 h',
    description: 'Detalle de un día normal de alimentación.',
    icon: 'time-outline',
    href: technicalSectionHref('dailyRecall'),
    actionLabel: 'Completar',
  },
  {
    id: 'observations',
    title: 'Observaciones',
    description: 'Añade cualquier detalle extra (opcional).',
    icon: 'chatbubble-ellipses-outline',
    href: technicalSectionHref('observations'),
    actionLabel: 'Añadir o omitir',
  },
] as const;

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEPS.length;

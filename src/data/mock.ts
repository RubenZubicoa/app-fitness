import { Ionicons } from '@expo/vector-icons';

import type { SocialFeedEntry } from '@/types/social-feed';

/**
 * Datos de ejemplo (estáticos) para la maqueta de REGENESIS.
 * El modelo Client se obtiene del API; aquí solo quedan datos de UI aún no conectados.
 */

type Ionicon = keyof typeof Ionicons.glyphMap;

export const reviews = [
  {
    title: 'Revisión semanal · Semana 7',
    date: 'Vie 23 may · 17:00',
    status: 'upcoming' as const,
    note: 'Sube 4 fotos y tus medidas 24h antes.',
  },
  {
    title: 'Revisión semanal · Semana 6',
    date: 'Vie 16 may · 17:00',
    status: 'done' as const,
    note: 'Completada. ¡Gran progreso en cintura!',
  },
  {
    title: 'Revisión semanal · Semana 5',
    date: 'Vie 9 may · 17:00',
    status: 'done' as const,
    note: 'Completada.',
  },
];

export const videoLibrary = [
  {
    category: 'Nutrición',
    icon: 'nutrition-outline',
    tone: 'gold',
    items: [
      { title: 'Cómo montar tu plato', type: 'Vídeo', length: '8 min' },
      { title: 'Guía de suplementación', type: 'PDF', length: '12 pág' },
    ],
  },
  {
    category: 'Entrenamiento',
    icon: 'barbell-outline',
    tone: 'primary',
    items: [
      { title: 'Técnica de sentadilla', type: 'Vídeo', length: '6 min' },
      { title: 'Calentamiento articular', type: 'Vídeo', length: '5 min' },
    ],
  },
  {
    category: 'Hábitos y sueño',
    icon: 'moon-outline',
    tone: 'purple',
    items: [
      { title: 'Higiene del sueño', type: 'Vídeo', length: '10 min' },
      { title: 'Gestión del estrés', type: 'PDF', length: '6 pág' },
    ],
  },
] as const;

/** Feed demo tipado como SocialFeedEntry (alineado con WorkoutHistory, Weight, Measurement…). */
export const socialFeed: SocialFeedEntry[] = [
  {
    _id: 'sf-workout-1',
    clientId: 'c-marcos',
    author: {
      clientId: 'c-marcos',
      fullName: 'Marcos R.',
      avatar: 'https://i.pravatar.cc/100?img=12',
    },
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    likes: 12,
    comments: 3,
    kind: 'workout',
    workoutHistoryId: 'wh-demo-1',
    week: 8,
    day: 'Día B',
    focus: 'Tren inferior',
    duration: '58 min',
    durationMinutes: 58,
    exerciseCount: 4,
  },
  {
    _id: 'sf-weight-1',
    clientId: 'c-ana',
    author: {
      clientId: 'c-ana',
      fullName: 'Ana G.',
      avatar: 'https://i.pravatar.cc/100?img=32',
    },
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    likes: 28,
    comments: 7,
    kind: 'weight',
    weightId: 'w-demo-1',
    label: '10 may',
    previousKg: 72.4,
    currentKg: 71.2,
    unit: 'kg',
  },
  {
    _id: 'sf-photos-1',
    clientId: 'c-lucia',
    author: {
      clientId: 'c-lucia',
      fullName: 'Lucía F.',
      avatar: 'https://i.pravatar.cc/100?img=47',
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    likes: 41,
    comments: 12,
    kind: 'photos',
    week: 6,
    photos: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=500&fit=crop',
    ],
  },
  {
    _id: 'sf-measurement-1',
    clientId: 'c-carlos',
    author: {
      clientId: 'c-carlos',
      fullName: 'Carlos M.',
      avatar: 'https://i.pravatar.cc/100?img=15',
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    likes: 19,
    comments: 4,
    kind: 'measurement',
    measurementId: 'm-demo-1',
    MeasurementId: 'mm-waist',
    label: 'Cintura',
    unit: 'cm',
    value: 84,
    delta: -2,
    date: '2026-05-10',
  },
  {
    _id: 'sf-steps-1',
    clientId: 'c-ana',
    author: {
      clientId: 'c-ana',
      fullName: 'Ana G.',
      avatar: 'https://i.pravatar.cc/100?img=32',
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60_000).toISOString(),
    likes: 8,
    comments: 1,
    kind: 'steps',
    dailyStepsId: 'ds-demo-1',
    week: 8,
    dayLabel: 'Vie',
    steps: 12400,
    goal: 10000,
  },
  {
    _id: 'sf-workout-2',
    clientId: 'c-sofia',
    author: {
      clientId: 'c-sofia',
      fullName: 'Sofía P.',
      avatar: 'https://i.pravatar.cc/100?img=5',
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60_000).toISOString(),
    likes: 15,
    comments: 2,
    kind: 'workout',
    workoutHistoryId: 'wh-demo-2',
    week: 8,
    day: 'Día A',
    focus: 'Tren superior',
    duration: '55 min',
    durationMinutes: 55,
    exerciseCount: 4,
  },
  {
    _id: 'sf-challenge-1',
    clientId: 'c-lucia',
    author: {
      clientId: 'c-lucia',
      fullName: 'Lucía F.',
      avatar: 'https://i.pravatar.cc/100?img=47',
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
    likes: 52,
    comments: 14,
    kind: 'challenge',
    title: '7 días sin azúcar',
    completedDays: 7,
    totalDays: 7,
    completed: true,
  },
  {
    _id: 'sf-wellness-1',
    clientId: 'c-diego',
    author: {
      clientId: 'c-diego',
      fullName: 'Diego V.',
      avatar: 'https://i.pravatar.cc/100?img=33',
    },
    createdAt: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    likes: 9,
    comments: 0,
    kind: 'wellness',
    date: '2026-05-09',
    items: [
      {
        wellnessId: 'wel-1',
        masterId: 'wm-energy',
        key: 'energy',
        label: 'Energía',
        value: 9,
      },
      {
        wellnessId: 'wel-2',
        masterId: 'wm-sleep',
        key: 'sleep',
        label: 'Sueño',
        value: 8,
      },
      {
        wellnessId: 'wel-3',
        masterId: 'wm-mood',
        key: 'mood',
        label: 'Ánimo',
        value: 9,
      },
    ],
  },
];

export const leaderboard = [
  {
    clientId: 'c-ana',
    fullName: 'Ana G.',
    points: 980,
    avatar: 'https://i.pravatar.cc/100?img=32',
    streak: 12,
  },
  {
    clientId: 'c-lucia',
    fullName: 'Lucía F.',
    points: 910,
    avatar: 'https://i.pravatar.cc/100?img=47',
    streak: 9,
  },
  {
    clientId: 'c-marcos',
    fullName: 'Marcos R.',
    points: 870,
    avatar: 'https://i.pravatar.cc/100?img=12',
    streak: 7,
  },
  {
    clientId: 'c-sofia',
    fullName: 'Sofía P.',
    points: 820,
    avatar: 'https://i.pravatar.cc/100?img=5',
    streak: 5,
  },
  {
    clientId: 'c-carlos',
    fullName: 'Carlos M.',
    points: 760,
    avatar: 'https://i.pravatar.cc/100?img=15',
    streak: 4,
  },
];

export const communityHighlights = [
  {
    label: 'Miembros activos',
    value: '128',
    icon: 'people-outline' as Ionicon,
  },
  {
    label: 'Logros hoy',
    value: '34',
    icon: 'sparkles' as Ionicon,
  },
  {
    label: 'Fotos nuevas',
    value: '11',
    icon: 'camera-outline' as Ionicon,
  },
];

export const onboardingSteps: {
  title: string;
  icon: Ionicon;
  done: boolean;
  current?: boolean;
}[] = [
  { title: 'Datos personales', icon: 'person-outline', done: true },
  { title: 'Objetivos', icon: 'flag-outline', done: true },
  { title: 'Medidas iniciales', icon: 'body-outline', done: false, current: true },
  { title: 'Fotos de progreso', icon: 'camera-outline', done: false },
  { title: 'Salud y hábitos', icon: 'heart-outline', done: false },
];

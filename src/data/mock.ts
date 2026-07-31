import { Ionicons } from '@expo/vector-icons';

/**
 * Datos de ejemplo (estáticos) para la maqueta de REGENESIS.
 * El modelo Client se obtiene del API; aquí solo quedan datos de UI aún no conectados.
 */

type Ionicon = keyof typeof Ionicons.glyphMap;

export const meals = [
  { name: 'Desayuno', kcal: 420, time: '08:00', items: 'Avena, claras y fruta', icon: 'cafe-outline' },
  { name: 'Comida', kcal: 620, time: '14:00', items: 'Pollo, arroz y verduras', icon: 'restaurant-outline' },
  { name: 'Merienda', kcal: 240, time: '18:00', items: 'Yogur griego y nueces', icon: 'nutrition-outline' },
  { name: 'Cena', kcal: 480, time: '21:00', items: 'Salmón y ensalada', icon: 'fish-outline' },
] as const;

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

export const socialFeed = [
  {
    user: 'Marcos R.',
    avatar: 'https://i.pravatar.cc/100?img=12',
    action: 'completó Día B · Tren inferior',
    time: 'hace 20 min',
    likes: 12,
    kind: 'workout' as const,
  },
  {
    user: 'Ana G.',
    avatar: 'https://i.pravatar.cc/100?img=32',
    action: 'alcanzó 12.400 pasos hoy',
    time: 'hace 1 h',
    likes: 8,
    kind: 'steps' as const,
  },
  {
    user: 'Lucía F.',
    avatar: 'https://i.pravatar.cc/100?img=47',
    action: 'superó el reto “7 días sin azúcar”',
    time: 'hace 3 h',
    likes: 21,
    kind: 'challenge' as const,
  },
];

export const leaderboard = [
  { user: 'Ana G.', points: 980, avatar: 'https://i.pravatar.cc/100?img=32' },
  { user: 'Lucía F.', points: 910, avatar: 'https://i.pravatar.cc/100?img=47' },
  { user: 'Marcos R.', points: 870, avatar: 'https://i.pravatar.cc/100?img=12' },
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

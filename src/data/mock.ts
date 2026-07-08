import { Ionicons } from '@expo/vector-icons';

/**
 * Datos de ejemplo (estáticos) para la maqueta de REGENESIS.
 * NO contienen lógica: solo alimentan el diseño de las pantallas.
 */

type Ionicon = keyof typeof Ionicons.glyphMap;

export const client = {
  name: 'Lucía',
  fullName: 'Lucía Fernández',
  goal: 'Recomposición corporal',
  coach: 'Onatz Health Coach',
  plan: 'Método Regenesis',
  program: 'Nutrición + Entrenamiento',
  startDate: '14 abr',
  endDate: '13 jul',
  week: 6,
  totalWeeks: 12,
  daysLeft: 42,
  avatar: 'https://i.pravatar.cc/200?img=47',
};

export const weightSeries = {
  labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  data: [68.4, 67.9, 67.2, 66.8, 66.1, 65.4],
  start: 68.4,
  current: 65.4,
  target: 62,
  unit: 'kg',
};

export const measurements = [
  { key: 'cintura', label: 'Cintura', value: 74, unit: 'cm', delta: -6, icon: 'body-outline' },
  { key: 'cadera', label: 'Cadera', value: 96, unit: 'cm', delta: -3, icon: 'ellipse-outline' },
  { key: 'pecho', label: 'Pecho', value: 90, unit: 'cm', delta: -2, icon: 'fitness-outline' },
  { key: 'brazo', label: 'Brazo', value: 29, unit: 'cm', delta: 1, icon: 'barbell-outline' },
] as const;

export const measurementSeries: Record<string, number[]> = {
  cintura: [80, 79, 78, 76, 75, 74],
  cadera: [99, 98, 98, 97, 96, 96],
  pecho: [92, 92, 91, 91, 90, 90],
  brazo: [28, 28, 28, 29, 29, 29],
};

/** Sensaciones diarias (0–100). */
export const wellness = [
  { key: 'energia', label: 'Energía', value: 82, icon: 'flash-outline', tone: 'gold' },
  { key: 'sueno', label: 'Sueño', value: 74, icon: 'moon-outline', tone: 'purple' },
  { key: 'hambre', label: 'Hambre', value: 38, icon: 'restaurant-outline', tone: 'coral' },
  { key: 'antojos', label: 'Antojos', value: 28, icon: 'ice-cream-outline', tone: 'teal' },
] as const;

export const weeklyScore = {
  value: 86,
  label: 'Puntuación semanal',
  breakdown: [
    { label: 'Entrenos', value: 92 },
    { label: 'Nutrición', value: 88 },
    { label: 'Pasos', value: 79 },
    { label: 'Descanso', value: 74 },
  ],
};

export const workoutWeek = [
  { label: 'L', value: 100, highlight: true },
  { label: 'M', value: 100, highlight: true },
  { label: 'X', value: 0, highlight: false },
  { label: 'J', value: 100, highlight: true },
  { label: 'V', value: 60, highlight: true },
  { label: 'S', value: 0, highlight: false },
  { label: 'D', value: 0, highlight: false },
];

export const macros = {
  calories: 1850,
  target: 1900,
  items: [
    { key: 'prot', label: 'Proteínas', grams: 140, target: 150, tone: 'primary' },
    { key: 'carbs', label: 'Carbohidratos', grams: 180, target: 200, tone: 'gold' },
    { key: 'fats', label: 'Grasas', grams: 55, target: 60, tone: 'teal' },
  ],
} as const;

export const meals = [
  { name: 'Desayuno', kcal: 420, time: '08:00', items: 'Avena, claras y fruta', icon: 'cafe-outline' },
  { name: 'Comida', kcal: 620, time: '14:00', items: 'Pollo, arroz y verduras', icon: 'restaurant-outline' },
  { name: 'Merienda', kcal: 240, time: '18:00', items: 'Yogur griego y nueces', icon: 'nutrition-outline' },
  { name: 'Cena', kcal: 480, time: '21:00', items: 'Salmón y ensalada', icon: 'fish-outline' },
] as const;

export const shoppingList = [
  { item: 'Pechuga de pollo', qty: '1 kg', done: true },
  { item: 'Arroz integral', qty: '500 g', done: true },
  { item: 'Salmón fresco', qty: '400 g', done: false },
  { item: 'Yogur griego', qty: '4 uds', done: false },
  { item: 'Espinacas', qty: '2 bolsas', done: false },
  { item: 'Avena', qty: '1 kg', done: true },
  { item: 'Huevos', qty: '12 uds', done: false },
];

export const supplements: {
  name: string;
  dose: string;
  when: string;
  icon: Ionicon;
}[] = [
  { name: 'Proteína Whey', dose: '1 scoop', when: 'Post-entreno', icon: 'flask-outline' },
  { name: 'Creatina', dose: '5 g', when: 'Diario', icon: 'water-outline' },
  { name: 'Omega 3', dose: '2 cáps', when: 'Con la comida', icon: 'leaf-outline' },
  { name: 'Vitamina D', dose: '1 cáp', when: 'Desayuno', icon: 'sunny-outline' },
];

export type ExerciseType = 'strength' | 'cardio';

export type Exercise = {
  name: string;
  /** Descripción de series, p. ej. "4 x 8-10" (fuerza) o "15 min" (cardio). */
  sets: string;
  rest: string;
  type: ExerciseType;
  /** Nº de series a registrar (solo fuerza). */
  seriesCount?: number;
  /** Rango de repeticiones objetivo por serie (solo fuerza). */
  repRange?: { min: number; max: number };
  /** Unidad del rango: repeticiones o segundos (p. ej. plancha). */
  repUnit?: 'reps' | 's';
  /** Objetivos de cardio. */
  targetKm?: number;
};

/** Formatea el rango de reps/segundos para mostrar en UI. */
export function formatRepRange(exercise: Exercise): string {
  if (!exercise.repRange) return '—';
  const { min, max } = exercise.repRange;
  const suffix = exercise.repUnit === 's' ? 's' : '';
  if (min === max) return `${min}${suffix}`;
  return `${min}-${max}${suffix}`;
}

export type RoutineDay = {
  day: string;
  focus: string;
  done: boolean;
  duration: string;
  exercises: Exercise[];
};

export const routine: RoutineDay[] = [
  {
    day: 'Día A',
    focus: 'Tren superior',
    done: true,
    duration: '55 min',
    exercises: [
      { name: 'Press banca', sets: '4 x 8-10', rest: '90s', type: 'strength', seriesCount: 4, repRange: { min: 8, max: 10 } },
      { name: 'Remo con barra', sets: '4 x 8-12', rest: '90s', type: 'strength', seriesCount: 4, repRange: { min: 8, max: 12 } },
      { name: 'Press militar', sets: '3 x 8-10', rest: '60s', type: 'strength', seriesCount: 3, repRange: { min: 8, max: 10 } },
      { name: 'Curl bíceps', sets: '3 x 10-12', rest: '45s', type: 'strength', seriesCount: 3, repRange: { min: 10, max: 12 } },
    ],
  },
  {
    day: 'Día B',
    focus: 'Tren inferior',
    done: true,
    duration: '60 min',
    exercises: [
      { name: 'Sentadilla', sets: '4 x 6-8', rest: '120s', type: 'strength', seriesCount: 4, repRange: { min: 6, max: 8 } },
      { name: 'Peso muerto rumano', sets: '4 x 8-10', rest: '90s', type: 'strength', seriesCount: 4, repRange: { min: 8, max: 10 } },
      { name: 'Zancadas', sets: '3 x 10-12', rest: '60s', type: 'strength', seriesCount: 3, repRange: { min: 10, max: 12 } },
      { name: 'Gemelos', sets: '4 x 12-15', rest: '45s', type: 'strength', seriesCount: 4, repRange: { min: 12, max: 15 } },
    ],
  },
  {
    day: 'Día C',
    focus: 'Full body',
    done: true,
    duration: '50 min',
    exercises: [
      { name: 'Hip thrust', sets: '4 x 8-12', rest: '90s', type: 'strength', seriesCount: 4, repRange: { min: 8, max: 12 } },
      { name: 'Dominadas asistidas', sets: '3 x 6-8', rest: '90s', type: 'strength', seriesCount: 3, repRange: { min: 6, max: 8 } },
      { name: 'Fondos', sets: '3 x 8-12', rest: '60s', type: 'strength', seriesCount: 3, repRange: { min: 8, max: 12 } },
      { name: 'Plancha', sets: '3 x 40-45s', rest: '30s', type: 'strength', seriesCount: 3, repRange: { min: 40, max: 45 }, repUnit: 's' },
    ],
  },
  {
    day: 'Día D',
    focus: 'Core y cardio',
    done: false,
    duration: '45 min',
    exercises: [
      { name: 'Elevaciones de piernas', sets: '4 x 10-12', rest: '45s', type: 'strength', seriesCount: 4, repRange: { min: 10, max: 12 } },
      { name: 'Rueda abdominal', sets: '3 x 8-10', rest: '60s', type: 'strength', seriesCount: 3, repRange: { min: 8, max: 10 } },
      { name: 'Carrera continua', sets: '5 km', rest: '—', type: 'cardio', targetKm: 5 },
      { name: 'Cinta / HIIT', sets: '15 min', rest: '—', type: 'cardio', targetKm: 3 },
    ],
  },
];

export const adherenceWeeks = [
  { label: 'S1', value: 70, highlight: true },
  { label: 'S2', value: 85, highlight: true },
  { label: 'S3', value: 80, highlight: true },
  { label: 'S4', value: 95, highlight: true },
  { label: 'S5', value: 88, highlight: true },
  { label: 'S6', value: 100, highlight: true },
];

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

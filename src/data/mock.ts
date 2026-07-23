import { Ionicons } from '@expo/vector-icons';

/**
 * Datos de ejemplo (estáticos) para la maqueta de REGENESIS.
 * NO contienen lógica: solo alimentan el diseño de las pantallas.
 */

type Ionicon = keyof typeof Ionicons.glyphMap;

/**
 * Las 3 fases del programa de 12 semanas.
 * El avance de fase lo gestiona el entrenador; aquí solo se refleja el estado actual.
 */
export const programPhases = [
  {
    id: 1,
    name: 'Adaptación',
    description: 'Hábitos, técnica y base metabólica',
  },
  {
    id: 2,
    name: 'Progresión',
    description: 'Intensidad y ajuste del plan',
  },
  {
    id: 3,
    name: 'Optimización',
    description: 'Refino final y consolidación',
  },
] as const;

export type ProgramPhase = (typeof programPhases)[number];

/** Catálogo de programas disponibles. */
export const programs = [
  {
    id: 1,
    name: 'Nutrición',
    description: 'Plan nutricional personalizado',
  },
  {
    id: 2,
    name: 'Entrenamiento',
    description: 'Rutina y seguimiento de entrenos',
  },
  {
    id: 3,
    name: 'Nutrición + Entrenamiento',
    description: 'Programa completo de recomposición',
  },
] as const;

export type Program = (typeof programs)[number];

export const client = {
  name: 'Rubén',
  fullName: 'Rubén Zubicoa',
  email: 'ruben.zubicoa@email.com',
  telefono: '+34 612 345 678',
  contraseña: 'regenesis123',
  goal: 'Recomposición corporal',
  coach: 'Onatz Health Coach',
  plan: 'Método Regenesis',
  /** Id del programa asignado (ver `programs`). */
  program: 3,
  startDate: '2026-06-11',
  endDate: '2026-09-03',
  week: 6,
  totalWeeks: 12,
  /** Fase actual del programa (1–3). La asigna el entrenador. */
  phase: 2,
  totalPhases: 3,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
};

/** Programa asignado al cliente. */
export function getClientProgram(): Program {
  return programs.find((p) => p.id === client.program) ?? programs[0];
}

/** Fase activa del cliente según el valor que ha fijado el entrenador. */
export function getCurrentPhase(): ProgramPhase {
  return programPhases.find((p) => p.id === client.phase) ?? programPhases[0];
}

/** Días restantes hasta la fecha de fin del programa. */
export function getDaysLeft(from: Date = new Date()): number {
  const end = new Date(`${client.endDate}T23:59:59`);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - from.getTime()) / msPerDay);
  return Math.max(0, diff);
}

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

export const dailySteps = {
  goal: 10000,
  /** Índice del día actual en la semana (0 = Lunes). */
  todayIndex: 4,
  week: [
    { label: 'L', value: 11240 },
    { label: 'M', value: 9850 },
    { label: 'X', value: 10320 },
    { label: 'J', value: 8760 },
    { label: 'V', value: 8420 },
    { label: 'S', value: 0 },
    { label: 'D', value: 0 },
  ],
};

export const macros = {
  calories: 1850,
  target: 1900,
  items: [
    { key: 'prot', label: 'Proteínas', shortLabel: 'Proteínas', grams: 140, target: 150, tone: 'primary' },
    { key: 'carbs', label: 'Carbohidratos', shortLabel: 'Carbohidratos', grams: 180, target: 200, tone: 'gold' },
    { key: 'fats', label: 'Grasas', shortLabel: 'Grasas', grams: 55, target: 60, tone: 'teal' },
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

export type StrengthSetLog = {
  set: number;
  weightKg: number;
  reps: number;
};

export type CardioLog = {
  km: number;
  speedKmh: number;
  avgHr: number;
};

export type ExerciseLog = {
  name: string;
  type: ExerciseType;
  strengthSets?: StrengthSetLog[];
  cardio?: CardioLog;
};

export type WorkoutHistoryEntry = {
  id: string;
  week: number;
  date: string;
  day: string;
  focus: string;
  duration: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
};

/** Histórico de sesiones completadas (datos estáticos de ejemplo). */
export const workoutHistory: WorkoutHistoryEntry[] = [
  {
    id: 'w6-dia-c',
    week: 6,
    date: 'Lun 26 may',
    day: 'Día C',
    focus: 'Full body',
    duration: '52 min',
    durationMinutes: 52,
    exercises: [
      {
        name: 'Hip thrust',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 80, reps: 10 },
          { set: 2, weightKg: 80, reps: 10 },
          { set: 3, weightKg: 85, reps: 9 },
          { set: 4, weightKg: 85, reps: 8 },
        ],
      },
      {
        name: 'Dominadas asistidas',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 7 },
          { set: 2, weightKg: 0, reps: 7 },
          { set: 3, weightKg: 0, reps: 6 },
        ],
      },
      {
        name: 'Fondos',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 10 },
          { set: 2, weightKg: 0, reps: 9 },
          { set: 3, weightKg: 0, reps: 9 },
        ],
      },
      {
        name: 'Plancha',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 42 },
          { set: 2, weightKg: 0, reps: 45 },
          { set: 3, weightKg: 0, reps: 43 },
        ],
      },
    ],
  },
  {
    id: 'w6-dia-b',
    week: 6,
    date: 'Vie 23 may',
    day: 'Día B',
    focus: 'Tren inferior',
    duration: '58 min',
    durationMinutes: 58,
    exercises: [
      {
        name: 'Sentadilla',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 70, reps: 8 },
          { set: 2, weightKg: 70, reps: 8 },
          { set: 3, weightKg: 75, reps: 7 },
          { set: 4, weightKg: 75, reps: 6 },
        ],
      },
      {
        name: 'Peso muerto rumano',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 60, reps: 10 },
          { set: 2, weightKg: 60, reps: 10 },
          { set: 3, weightKg: 62.5, reps: 9 },
          { set: 4, weightKg: 62.5, reps: 9 },
        ],
      },
      {
        name: 'Zancadas',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 20, reps: 12 },
          { set: 2, weightKg: 20, reps: 12 },
          { set: 3, weightKg: 22.5, reps: 11 },
        ],
      },
      {
        name: 'Gemelos',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 40, reps: 15 },
          { set: 2, weightKg: 40, reps: 14 },
          { set: 3, weightKg: 45, reps: 13 },
          { set: 4, weightKg: 45, reps: 12 },
        ],
      },
    ],
  },
  {
    id: 'w6-dia-a',
    week: 6,
    date: 'Mié 21 may',
    day: 'Día A',
    focus: 'Tren superior',
    duration: '54 min',
    durationMinutes: 54,
    exercises: [
      {
        name: 'Press banca',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 50, reps: 10 },
          { set: 2, weightKg: 52.5, reps: 9 },
          { set: 3, weightKg: 52.5, reps: 9 },
          { set: 4, weightKg: 55, reps: 8 },
        ],
      },
      {
        name: 'Remo con barra',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 45, reps: 10 },
          { set: 2, weightKg: 47.5, reps: 10 },
          { set: 3, weightKg: 47.5, reps: 9 },
          { set: 4, weightKg: 50, reps: 8 },
        ],
      },
      {
        name: 'Press militar',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 30, reps: 10 },
          { set: 2, weightKg: 32.5, reps: 9 },
          { set: 3, weightKg: 32.5, reps: 8 },
        ],
      },
      {
        name: 'Curl bíceps',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 12, reps: 12 },
          { set: 2, weightKg: 12, reps: 11 },
          { set: 3, weightKg: 14, reps: 10 },
        ],
      },
    ],
  },
  {
    id: 'w5-dia-d',
    week: 5,
    date: 'Lun 19 may',
    day: 'Día D',
    focus: 'Core y cardio',
    duration: '47 min',
    durationMinutes: 47,
    exercises: [
      {
        name: 'Elevaciones de piernas',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 12 },
          { set: 2, weightKg: 0, reps: 11 },
          { set: 3, weightKg: 0, reps: 11 },
          { set: 4, weightKg: 0, reps: 10 },
        ],
      },
      {
        name: 'Rueda abdominal',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 10 },
          { set: 2, weightKg: 0, reps: 9 },
          { set: 3, weightKg: 0, reps: 8 },
        ],
      },
      {
        name: 'Carrera continua',
        type: 'cardio',
        cardio: { km: 5.2, speedKmh: 9.8, avgHr: 148 },
      },
      {
        name: 'Cinta / HIIT',
        type: 'cardio',
        cardio: { km: 2.8, speedKmh: 11.2, avgHr: 162 },
      },
    ],
  },
  {
    id: 'w5-dia-c',
    week: 5,
    date: 'Vie 16 may',
    day: 'Día C',
    focus: 'Full body',
    duration: '51 min',
    durationMinutes: 51,
    exercises: [
      {
        name: 'Hip thrust',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 75, reps: 10 },
          { set: 2, weightKg: 75, reps: 10 },
          { set: 3, weightKg: 80, reps: 9 },
          { set: 4, weightKg: 80, reps: 8 },
        ],
      },
      {
        name: 'Dominadas asistidas',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 6 },
          { set: 2, weightKg: 0, reps: 6 },
          { set: 3, weightKg: 0, reps: 5 },
        ],
      },
      {
        name: 'Fondos',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 9 },
          { set: 2, weightKg: 0, reps: 8 },
          { set: 3, weightKg: 0, reps: 8 },
        ],
      },
      {
        name: 'Plancha',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 0, reps: 40 },
          { set: 2, weightKg: 0, reps: 42 },
          { set: 3, weightKg: 0, reps: 40 },
        ],
      },
    ],
  },
  {
    id: 'w4-dia-a',
    week: 4,
    date: 'Mié 7 may',
    day: 'Día A',
    focus: 'Tren superior',
    duration: '56 min',
    durationMinutes: 56,
    exercises: [
      {
        name: 'Press banca',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 47.5, reps: 9 },
          { set: 2, weightKg: 50, reps: 8 },
          { set: 3, weightKg: 50, reps: 8 },
          { set: 4, weightKg: 52.5, reps: 7 },
        ],
      },
      {
        name: 'Remo con barra',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 42.5, reps: 10 },
          { set: 2, weightKg: 45, reps: 9 },
          { set: 3, weightKg: 45, reps: 9 },
          { set: 4, weightKg: 47.5, reps: 8 },
        ],
      },
      {
        name: 'Press militar',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 27.5, reps: 10 },
          { set: 2, weightKg: 30, reps: 9 },
          { set: 3, weightKg: 30, reps: 8 },
        ],
      },
      {
        name: 'Curl bíceps',
        type: 'strength',
        strengthSets: [
          { set: 1, weightKg: 10, reps: 12 },
          { set: 2, weightKg: 12, reps: 11 },
          { set: 3, weightKg: 12, reps: 10 },
        ],
      },
    ],
  },
];

/** Agrupa el histórico por semana (orden descendente). */
export function groupWorkoutHistoryByWeek(entries: WorkoutHistoryEntry[]) {
  const map = new Map<number, WorkoutHistoryEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.week) ?? [];
    list.push(entry);
    map.set(entry.week, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b - a)
    .map(([week, items]) => ({ week, items }));
}

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

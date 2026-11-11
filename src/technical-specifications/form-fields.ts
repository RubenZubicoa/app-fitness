import type {
  DailyRecall,
  EatingHabits,
  ExerciseHabits,
  Lifestyle,
  PersonalHistory,
  TechnicalSectionKey,
} from '@/types/technical-specifications';

export type FormFieldKind = 'text' | 'textarea' | 'choice';

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldConfig<K extends string = string> = {
  key: K;
  label: string;
  placeholder?: string;
  helper?: string;
  kind: FormFieldKind;
  options?: FormFieldOption[];
};

export type DailyRecallMealConfig = {
  key: keyof DailyRecall;
  label: string;
};

export const PERSONAL_HISTORY_FIELDS: FormFieldConfig<keyof PersonalHistory>[] = [
  {
    key: 'diseases',
    label: 'Enfermedades actuales o diagnosticadas',
    placeholder: 'Indica enfermedades actuales o diagnosticadas',
    kind: 'textarea',
  },
  {
    key: 'injuries',
    label: 'Lesiones importantes',
    placeholder: 'Lesiones que puedan limitar la actividad física',
    helper: 'También puedes incluir ingresos u operaciones relevantes.',
    kind: 'textarea',
  },
  {
    key: 'medications',
    label: 'Medicamentos actuales',
    placeholder: 'Nombre, frecuencia y dosis',
    kind: 'textarea',
  },
  {
    key: 'supplements',
    label: 'Suplementación',
    placeholder: 'Suplementos que tomas o has tomado (cuál y cantidades)',
    kind: 'textarea',
  },
  {
    key: 'allergies',
    label: 'Alergias / intolerancias alimentarias',
    placeholder: 'Ej. lactosa, gluten…',
    kind: 'textarea',
  },
  {
    key: 'bowelHabit',
    label: 'Hábito intestinal',
    placeholder: 'Describe tu hábito intestinal habitual',
    kind: 'text',
  },
  {
    key: 'contraceptives',
    label: 'Anticonceptivos',
    placeholder: 'Sí / No (y detalles si aplica)',
    kind: 'choice',
    options: [
      { label: 'Sí', value: 'Sí' },
      { label: 'No', value: 'No' },
    ],
  },
];

export const EATING_HABITS_FIELDS: FormFieldConfig<keyof EatingHabits>[] = [
  {
    key: 'numberOfMeals',
    label: 'Ingestas al día',
    placeholder: 'Las que realizas o quieres realizar',
    kind: 'text',
  },
  {
    key: 'snacks',
    label: 'Picoteos',
    placeholder: '¿Picas entre horas? ¿Qué y cuándo?',
    kind: 'textarea',
  },
  {
    key: 'drinks',
    label: '¿Bebes durante las comidas?',
    placeholder: 'Sí/No — cuánto y qué',
    kind: 'textarea',
  },
  {
    key: 'bread',
    label: '¿Acompañas las comidas con pan?',
    placeholder: 'Sí/No y detalles',
    kind: 'text',
  },
  {
    key: 'favoriteFoods',
    label: 'Alimentos preferentes',
    placeholder: 'Alimentos y preparaciones que más te gustan o consumes',
    kind: 'textarea',
  },
  {
    key: 'rejectedFoods',
    label: 'Alimentos rechazados',
    placeholder: 'Alimentos que no te gustan o no quieres en la dieta',
    kind: 'textarea',
  },
];

export const LIFESTYLE_FIELDS: FormFieldConfig<keyof Lifestyle>[] = [
  {
    key: 'sleep',
    label: 'Ciclo de sueño',
    placeholder: 'Horas de sueño al día',
    kind: 'text',
  },
  {
    key: 'smoking',
    label: 'Fumador/a',
    placeholder: 'Sí/No — cantidad',
    kind: 'textarea',
  },
  {
    key: 'alcohol',
    label: 'Consumo de alcohol',
    placeholder: 'Sí/No — cantidad',
    kind: 'textarea',
  },
  {
    key: 'waterIntake',
    label: 'Consumo de agua',
    placeholder: '¿Menos o más de 1,5–2 L/día?',
    kind: 'text',
  },
];

export const EXERCISE_HABITS_FIELDS: FormFieldConfig<keyof ExerciseHabits>[] = [
  {
    key: 'sport',
    label: 'Deporte que más has practicado',
    placeholder: 'Tipo de deporte y si lo practicas actualmente',
    kind: 'textarea',
  },
  {
    key: 'exerciseFrequency',
    label: 'Horas de ejercicio a la semana',
    placeholder: 'Ej. 3–4 horas',
    kind: 'text',
  },
  {
    key: 'strengthLevel',
    label: 'Nivel en entrenamiento de fuerza',
    kind: 'choice',
    options: [
      {
        label: 'Nunca lo he practicado',
        value: 'Nunca lo he practicado y no entiendo de ejercicios ni técnicas',
      },
      {
        label: 'Nivel bajo',
        value: 'Alguna cosa he hecho pero mi nivel es bajo',
      },
      {
        label: 'Nivel intermedio',
        value:
          'Conozco bastantes ejercicios y los he hecho con cierta frecuencia (nivel intermedio)',
      },
      {
        label: 'Nivel avanzado',
        value:
          'El entrenamiento forma parte de mi vida; conozco muchos ejercicios y los ejecuto correctamente',
      },
    ],
  },
  {
    key: 'strengthTrainingFrequency',
    label: 'Días a la semana para trabajo de fuerza',
    placeholder: 'Ej. 3 días',
    kind: 'text',
  },
  {
    key: 'material',
    label: 'Material disponible para entrenar',
    placeholder: 'Gimnasio, mancuernas, bandas…',
    kind: 'textarea',
  },
];

export const DAILY_RECALL_MEALS: DailyRecallMealConfig[] = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'morningSnack', label: 'Almuerzo' },
  { key: 'lunch', label: 'Comida' },
  { key: 'afternoonSnack', label: 'Merienda' },
  { key: 'dinner', label: 'Cena' },
];

export const DAILY_RECALL_ENTRY_FIELDS: FormFieldConfig<
  'ingredients' | 'quantities' | 'timeAndPlace'
>[] = [
  {
    key: 'ingredients',
    label: 'Ingredientes / menú',
    placeholder: 'Qué sueles comer',
    kind: 'textarea',
  },
  {
    key: 'quantities',
    label: 'Cantidades',
    placeholder: 'Aprox. cantidades',
    kind: 'text',
  },
  {
    key: 'timeAndPlace',
    label: 'Hora y lugar',
    placeholder: 'Ej. 08:00 en casa',
    kind: 'text',
  },
];

export type TechnicalSectionMeta = {
  key: TechnicalSectionKey;
  title: string;
  subtitle: string;
};

export const TECHNICAL_SECTION_META: Record<TechnicalSectionKey, TechnicalSectionMeta> = {
  personalHistory: {
    key: 'personalHistory',
    title: 'Antecedentes personales',
    subtitle: 'Salud, medicación y limitaciones relevantes',
  },
  eatingHabits: {
    key: 'eatingHabits',
    title: 'Hábitos alimentarios',
    subtitle: 'Ingestas, bebidas y preferencias',
  },
  lifestyle: {
    key: 'lifestyle',
    title: 'Hábitos de vida',
    subtitle: 'Sueño, tabaco, alcohol y agua',
  },
  exerciseHabits: {
    key: 'exerciseHabits',
    title: 'Ejercicio físico',
    subtitle: 'Deporte, fuerza y material',
  },
  dailyRecall: {
    key: 'dailyRecall',
    title: 'Recordatorio 24 h',
    subtitle: 'Un día normal de alimentación',
  },
  observations: {
    key: 'observations',
    title: 'Observaciones',
    subtitle: 'Cualquier detalle extra que quieras añadir',
  },
};

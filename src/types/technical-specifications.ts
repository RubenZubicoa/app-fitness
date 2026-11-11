import { normalizeId } from '@/types/program';

export interface TechnicalSpecifications {
  _id: string;
  clientId: string;
  personalHistory: PersonalHistory;
  eatingHabits: EatingHabits;
  lifestyle: Lifestyle;
  exerciseHabits: ExerciseHabits;
  dailyRecall: DailyRecall;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export type PersonalHistory = {
  diseases: string;
  injuries: string;
  medications: string;
  supplements: string;
  allergies: string;
  bowelHabit: string;
  contraceptives: string;
};

export type EatingHabits = {
  numberOfMeals: string;
  snacks: string;
  drinks: string;
  bread: string;
  favoriteFoods: string;
  rejectedFoods: string;
};

export type Lifestyle = {
  smoking: string;
  alcohol: string;
  sleep: string;
  waterIntake: string;
};

export type ExerciseHabits = {
  sport: string;
  exerciseFrequency: string;
  strengthLevel: string;
  strengthTrainingFrequency: string;
  material: string;
};

export type DailyRecallEntry = {
  ingredients: string;
  quantities: string;
  timeAndPlace: string;
};

export type DailyRecall = {
  breakfast: DailyRecallEntry;
  morningSnack: DailyRecallEntry;
  lunch: DailyRecallEntry;
  afternoonSnack: DailyRecallEntry;
  dinner: DailyRecallEntry;
};

/** Claves de sección editables (sin meta del documento). */
export type TechnicalSectionKey =
  | 'personalHistory'
  | 'eatingHabits'
  | 'lifestyle'
  | 'exerciseHabits'
  | 'dailyRecall'
  | 'observations';

/** Datos para crear una ficha técnica (sin `_id`). */
export type CreateTechnicalSpecificationsInput = {
  clientId: string;
  personalHistory?: PersonalHistory;
  eatingHabits?: EatingHabits;
  lifestyle?: Lifestyle;
  exerciseHabits?: ExerciseHabits;
  dailyRecall?: DailyRecall;
  observations?: string;
};

/** Datos parciales para actualizar una ficha técnica. */
export type UpdateTechnicalSpecificationsInput = Partial<
  Omit<TechnicalSpecifications, '_id' | 'createdAt' | 'clientId'>
>;

function asString(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

function isFilled(value: string): boolean {
  return value.trim().length > 0;
}

export function emptyDailyRecallEntry(): DailyRecallEntry {
  return { ingredients: '', quantities: '', timeAndPlace: '' };
}

export function emptyPersonalHistory(): PersonalHistory {
  return {
    diseases: '',
    injuries: '',
    medications: '',
    supplements: '',
    allergies: '',
    bowelHabit: '',
    contraceptives: '',
  };
}

export function emptyEatingHabits(): EatingHabits {
  return {
    numberOfMeals: '',
    snacks: '',
    drinks: '',
    bread: '',
    favoriteFoods: '',
    rejectedFoods: '',
  };
}

export function emptyLifestyle(): Lifestyle {
  return {
    smoking: '',
    alcohol: '',
    sleep: '',
    waterIntake: '',
  };
}

export function emptyExerciseHabits(): ExerciseHabits {
  return {
    sport: '',
    exerciseFrequency: '',
    strengthLevel: '',
    strengthTrainingFrequency: '',
    material: '',
  };
}

export function emptyDailyRecall(): DailyRecall {
  return {
    breakfast: emptyDailyRecallEntry(),
    morningSnack: emptyDailyRecallEntry(),
    lunch: emptyDailyRecallEntry(),
    afternoonSnack: emptyDailyRecallEntry(),
    dinner: emptyDailyRecallEntry(),
  };
}

function normalizeDailyRecallEntry(raw: unknown): DailyRecallEntry {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    ingredients: asString(item.ingredients),
    quantities: asString(item.quantities),
    timeAndPlace: asString(item.timeAndPlace),
  };
}

export function normalizePersonalHistory(raw: unknown): PersonalHistory {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    diseases: asString(item.diseases),
    injuries: asString(item.injuries),
    medications: asString(item.medications),
    supplements: asString(item.supplements),
    allergies: asString(item.allergies),
    bowelHabit: asString(item.bowelHabit),
    contraceptives: asString(item.contraceptives),
  };
}

export function normalizeEatingHabits(raw: unknown): EatingHabits {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    numberOfMeals: asString(item.numberOfMeals),
    snacks: asString(item.snacks),
    drinks: asString(item.drinks),
    bread: asString(item.bread),
    favoriteFoods: asString(item.favoriteFoods),
    rejectedFoods: asString(item.rejectedFoods),
  };
}

export function normalizeLifestyle(raw: unknown): Lifestyle {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    smoking: asString(item.smoking),
    alcohol: asString(item.alcohol),
    sleep: asString(item.sleep),
    waterIntake: asString(item.waterIntake),
  };
}

export function normalizeExerciseHabits(raw: unknown): ExerciseHabits {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    sport: asString(item.sport),
    exerciseFrequency: asString(item.exerciseFrequency),
    strengthLevel: asString(item.strengthLevel),
    strengthTrainingFrequency: asString(item.strengthTrainingFrequency),
    material: asString(item.material),
  };
}

export function normalizeDailyRecall(raw: unknown): DailyRecall {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    breakfast: normalizeDailyRecallEntry(item.breakfast),
    morningSnack: normalizeDailyRecallEntry(item.morningSnack),
    lunch: normalizeDailyRecallEntry(item.lunch),
    afternoonSnack: normalizeDailyRecallEntry(item.afternoonSnack),
    dinner: normalizeDailyRecallEntry(item.dinner),
  };
}

export function normalizeTechnicalSpecifications(
  raw: Record<string, unknown>,
): TechnicalSpecifications {
  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    personalHistory: normalizePersonalHistory(raw.personalHistory),
    eatingHabits: normalizeEatingHabits(raw.eatingHabits),
    lifestyle: normalizeLifestyle(raw.lifestyle),
    exerciseHabits: normalizeExerciseHabits(raw.exerciseHabits),
    dailyRecall: normalizeDailyRecall(raw.dailyRecall),
    observations: asString(raw.observations),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
  };
}

export function isPersonalHistoryComplete(value: PersonalHistory): boolean {
  return Object.values(value).every(isFilled);
}

export function isEatingHabitsComplete(value: EatingHabits): boolean {
  return Object.values(value).every(isFilled);
}

export function isLifestyleComplete(value: Lifestyle): boolean {
  return Object.values(value).every(isFilled);
}

export function isExerciseHabitsComplete(value: ExerciseHabits): boolean {
  return Object.values(value).every(isFilled);
}

export function isDailyRecallEntryComplete(value: DailyRecallEntry): boolean {
  return Object.values(value).every(isFilled);
}

export function isDailyRecallComplete(value: DailyRecall): boolean {
  return Object.values(value).every(isDailyRecallEntryComplete);
}

/**
 * Observations es opcional en contenido, pero el paso se considera hecho
 * cuando el usuario lo confirma (guardado). Si hay texto, también cuenta.
 */
export function isObservationsComplete(
  observations: string,
  confirmed: boolean,
): boolean {
  return confirmed || isFilled(observations);
}

export function isTechnicalSectionComplete(
  specs: TechnicalSpecifications | null,
  section: TechnicalSectionKey,
  options?: { observationsConfirmed?: boolean },
): boolean {
  if (!specs) return false;
  switch (section) {
    case 'personalHistory':
      return isPersonalHistoryComplete(specs.personalHistory);
    case 'eatingHabits':
      return isEatingHabitsComplete(specs.eatingHabits);
    case 'lifestyle':
      return isLifestyleComplete(specs.lifestyle);
    case 'exerciseHabits':
      return isExerciseHabitsComplete(specs.exerciseHabits);
    case 'dailyRecall':
      return isDailyRecallComplete(specs.dailyRecall);
    case 'observations':
      return isObservationsComplete(
        specs.observations,
        Boolean(options?.observationsConfirmed),
      );
    default:
      return false;
  }
}

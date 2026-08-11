import { normalizeId } from '@/types/program';
import type { Client } from '@/types/client';
import type { DailySteps } from '@/types/daily-steps';
import type { Measurement, MeasurementMaster } from '@/types/measurement';
import type { Weight } from '@/types/weight';
import type { Wellness, WellnessMaster } from '@/types/wellness';
import type { WorkoutHistoryEntry, WorkoutMedia } from '@/types/workout-history';

/**
 * Tipos de logro del feed social.
 * Cada kind apunta a un registro de dominio existente (o fotos/retos futuros).
 */
export type SocialFeedKind =
  | 'workout'
  | 'weight'
  | 'measurement'
  | 'steps'
  | 'wellness'
  | 'photos'
  | 'challenge';

/** Autor denormalizado para renderizar el feed sin joins. */
export type SocialFeedAuthor = {
  clientId: string;
  fullName: string;
  avatar: string;
};

type SocialFeedBase = {
  _id: string;
  clientId: string;
  author: SocialFeedAuthor;
  /** ISO datetime de publicación. */
  createdAt: string;
  likes: number;
  comments: number;
};

/** Entreno → WorkoutHistoryEntry */
export type SocialFeedWorkout = SocialFeedBase & {
  kind: 'workout';
  workoutHistoryId: string;
  week: number;
  day: string;
  focus: string;
  duration: string;
  durationMinutes: number;
  exerciseCount: number;
  media?: WorkoutMedia[];
};

/** Peso → Weight (punto de la serie labels/data) */
export type SocialFeedWeight = SocialFeedBase & {
  kind: 'weight';
  weightId: string;
  label: string;
  previousKg: number;
  currentKg: number;
  unit: string;
};

/** Medida → Measurement (+ master) */
export type SocialFeedMeasurement = SocialFeedBase & {
  kind: 'measurement';
  measurementId: string;
  MeasurementId: string;
  label: string;
  unit: string;
  value: number;
  delta: number;
  date: string;
};

/** Pasos → DailySteps (día concreto) */
export type SocialFeedSteps = SocialFeedBase & {
  kind: 'steps';
  dailyStepsId: string;
  week: number;
  dayLabel: string;
  steps: number;
  goal: number;
};

/** Bienestar → varios Wellness del mismo registro/día */
export type SocialFeedWellnessItem = {
  wellnessId: string;
  masterId: string;
  key: string;
  label: string;
  value: number;
};

export type SocialFeedWellness = SocialFeedBase & {
  kind: 'wellness';
  date: string;
  items: SocialFeedWellnessItem[];
};

/** Fotos de progreso (modelo futuro; por ahora URLs + semana) */
export type SocialFeedPhotos = SocialFeedBase & {
  kind: 'photos';
  week: number;
  photos: string[];
};

/** Reto comunitario (modelo futuro) */
export type SocialFeedChallenge = SocialFeedBase & {
  kind: 'challenge';
  title: string;
  completedDays: number;
  totalDays: number;
  completed: boolean;
};

export type SocialFeedEntry =
  | SocialFeedWorkout
  | SocialFeedWeight
  | SocialFeedMeasurement
  | SocialFeedSteps
  | SocialFeedWellness
  | SocialFeedPhotos
  | SocialFeedChallenge;

export function authorFromClient(client: Pick<Client, '_id' | 'fullName' | 'avatar'>): SocialFeedAuthor {
  return {
    clientId: client._id,
    fullName: client.fullName,
    avatar: client.avatar,
  };
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hace 1 d';
  if (days < 7) return `hace ${days} d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function socialFeedAction(entry: SocialFeedEntry): string {
  switch (entry.kind) {
    case 'workout':
      return `completó ${entry.day} · ${entry.focus}`;
    case 'weight': {
      const delta = entry.currentKg - entry.previousKg;
      if (delta < 0) return `bajó ${Math.abs(delta).toFixed(1).replace('.', ',')} ${entry.unit}`;
      if (delta > 0) return `subió ${delta.toFixed(1).replace('.', ',')} ${entry.unit}`;
      return `registró ${entry.currentKg} ${entry.unit}`;
    }
    case 'measurement': {
      const abs = Math.abs(entry.delta);
      if (entry.delta < 0) return `mejoró ${entry.label.toLowerCase()} ${abs} ${entry.unit}`;
      if (entry.delta > 0) return `registró ${entry.label.toLowerCase()} +${abs} ${entry.unit}`;
      return `registró ${entry.label.toLowerCase()}`;
    }
    case 'steps':
      return `alcanzó ${entry.steps.toLocaleString('es-ES')} pasos`;
    case 'wellness':
      return 'registró sensaciones del día';
    case 'photos':
      return `subió fotos de progreso · Semana ${entry.week}`;
    case 'challenge':
      return entry.completed
        ? `superó el reto “${entry.title}”`
        : `avanza en el reto “${entry.title}”`;
  }
}

export function socialFeedDetail(entry: SocialFeedEntry): string {
  switch (entry.kind) {
    case 'workout':
      return `${entry.exerciseCount} ejercicios · ${entry.duration} · Semana ${entry.week}`;
    case 'weight':
      return `${entry.previousKg} ${entry.unit} → ${entry.currentKg} ${entry.unit}`;
    case 'measurement':
      return `${entry.label}: ${entry.value} ${entry.unit} (Δ ${entry.delta > 0 ? '+' : ''}${entry.delta})`;
    case 'steps':
      return `Objetivo ${entry.goal.toLocaleString('es-ES')} · ${entry.dayLabel} · Semana ${entry.week}`;
    case 'wellness':
      return entry.items.map((i) => `${i.label} ${i.value}/10`).join(' · ');
    case 'photos':
      return `${entry.photos.length} foto${entry.photos.length === 1 ? '' : 's'}`;
    case 'challenge':
      return `Racha de ${entry.completedDays}/${entry.totalDays} días`;
  }
}

export function socialFeedMetric(entry: SocialFeedEntry): string | undefined {
  switch (entry.kind) {
    case 'weight': {
      const delta = entry.currentKg - entry.previousKg;
      const sign = delta > 0 ? '+' : '';
      return `${sign}${delta.toFixed(1).replace('.', ',')} ${entry.unit}`;
    }
    case 'measurement':
      return `${entry.delta > 0 ? '+' : ''}${entry.delta} ${entry.unit}`;
    case 'steps':
      return `${(entry.steps / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    case 'challenge':
      return `${entry.completedDays}/${entry.totalDays}`;
    default:
      return undefined;
  }
}

/** Factories para generar entradas del feed a partir de registros de dominio. */

export function createWorkoutFeedEntry(input: {
  _id: string;
  author: SocialFeedAuthor;
  workout: WorkoutHistoryEntry;
  createdAt?: string;
  likes?: number;
  comments?: number;
}): SocialFeedWorkout {
  return {
    _id: input._id,
    clientId: input.author.clientId,
    author: input.author,
    createdAt: input.createdAt ?? new Date().toISOString(),
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    kind: 'workout',
    workoutHistoryId: input.workout._id,
    week: input.workout.week,
    day: input.workout.day,
    focus: input.workout.focus,
    duration: input.workout.duration,
    durationMinutes: input.workout.durationMinutes,
    exerciseCount: input.workout.exercises.length,
    ...(input.workout.media?.length ? { media: input.workout.media } : {}),
  };
}

export function createWeightFeedEntry(input: {
  _id: string;
  author: SocialFeedAuthor;
  weight: Weight;
  previousKg: number;
  currentKg: number;
  label: string;
  createdAt?: string;
  likes?: number;
  comments?: number;
}): SocialFeedWeight {
  return {
    _id: input._id,
    clientId: input.author.clientId,
    author: input.author,
    createdAt: input.createdAt ?? new Date().toISOString(),
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    kind: 'weight',
    weightId: input.weight._id,
    label: input.label,
    previousKg: input.previousKg,
    currentKg: input.currentKg,
    unit: input.weight.unit || 'kg',
  };
}

export function createMeasurementFeedEntry(input: {
  _id: string;
  author: SocialFeedAuthor;
  measurement: Measurement;
  master: MeasurementMaster;
  createdAt?: string;
  likes?: number;
  comments?: number;
}): SocialFeedMeasurement {
  return {
    _id: input._id,
    clientId: input.author.clientId,
    author: input.author,
    createdAt: input.createdAt ?? new Date().toISOString(),
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    kind: 'measurement',
    measurementId: input.measurement._id,
    MeasurementId: input.measurement.MeasurementId,
    label: input.master.label,
    unit: input.master.unit,
    value: input.measurement.value,
    delta: input.measurement.delta,
    date: input.measurement.date,
  };
}

export function createStepsFeedEntry(input: {
  _id: string;
  author: SocialFeedAuthor;
  dailySteps: DailySteps;
  dayLabel: string;
  steps: number;
  createdAt?: string;
  likes?: number;
  comments?: number;
}): SocialFeedSteps {
  return {
    _id: input._id,
    clientId: input.author.clientId,
    author: input.author,
    createdAt: input.createdAt ?? new Date().toISOString(),
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    kind: 'steps',
    dailyStepsId: input.dailySteps._id,
    week: input.dailySteps.week,
    dayLabel: input.dayLabel,
    steps: input.steps,
    goal: input.dailySteps.goal,
  };
}

export function createWellnessFeedEntry(input: {
  _id: string;
  author: SocialFeedAuthor;
  date: string;
  records: Wellness[];
  masters: WellnessMaster[];
  createdAt?: string;
  likes?: number;
  comments?: number;
}): SocialFeedWellness {
  const masterById = new Map(input.masters.map((m) => [m._id, m]));
  return {
    _id: input._id,
    clientId: input.author.clientId,
    author: input.author,
    createdAt: input.createdAt ?? new Date().toISOString(),
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    kind: 'wellness',
    date: input.date,
    items: input.records.map((r) => {
      const master = masterById.get(r.wellnessId);
      return {
        wellnessId: r._id,
        masterId: r.wellnessId,
        key: master?.key ?? r.wellnessId,
        label: master?.label ?? 'Sensación',
        value: r.value,
      };
    }),
  };
}

export function createPhotosFeedEntry(input: {
  _id: string;
  author: SocialFeedAuthor;
  week: number;
  photos: string[];
  createdAt?: string;
  likes?: number;
  comments?: number;
}): SocialFeedPhotos {
  return {
    _id: input._id,
    clientId: input.author.clientId,
    author: input.author,
    createdAt: input.createdAt ?? new Date().toISOString(),
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    kind: 'photos',
    week: input.week,
    photos: input.photos,
  };
}

export function normalizeSocialFeedEntry(raw: Record<string, unknown>): SocialFeedEntry | null {
  const kind = String(raw.kind ?? '') as SocialFeedKind;
  const authorRaw = (raw.author ?? {}) as Record<string, unknown>;
  const base = {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId ?? authorRaw.clientId),
    author: {
      clientId: normalizeId(authorRaw.clientId ?? raw.clientId),
      fullName: String(authorRaw.fullName ?? ''),
      avatar: String(authorRaw.avatar ?? ''),
    },
    createdAt: String(raw.createdAt ?? ''),
    likes: Number(raw.likes ?? 0),
    comments: Number(raw.comments ?? 0),
  };

  switch (kind) {
    case 'workout': {
      const mediaRaw = Array.isArray(raw.media) ? raw.media : [];
      const media: WorkoutMedia[] = mediaRaw
        .map((entry) => {
          const item = (entry ?? {}) as Record<string, unknown>;
          const uri = String(item.uri ?? '').trim();
          const typeRaw = String(item.type ?? '').trim();
          const type: WorkoutMedia['type'] | null =
            typeRaw === 'video' ? 'video' : typeRaw === 'image' ? 'image' : null;
          if (!uri || !type) return null;
          return {
            uri,
            type,
            ...(item.mimeType ? { mimeType: String(item.mimeType) } : {}),
          };
        })
        .filter((item): item is WorkoutMedia => item != null);

      return {
        ...base,
        kind,
        workoutHistoryId: normalizeId(raw.workoutHistoryId),
        week: Number(raw.week ?? 0),
        day: String(raw.day ?? ''),
        focus: String(raw.focus ?? ''),
        duration: String(raw.duration ?? ''),
        durationMinutes: Number(raw.durationMinutes ?? 0),
        exerciseCount: Number(raw.exerciseCount ?? 0),
        ...(media.length > 0 ? { media } : {}),
      };
    }
    case 'weight':
      return {
        ...base,
        kind,
        weightId: normalizeId(raw.weightId),
        label: String(raw.label ?? ''),
        previousKg: Number(raw.previousKg ?? 0),
        currentKg: Number(raw.currentKg ?? 0),
        unit: String(raw.unit ?? 'kg'),
      };
    case 'measurement':
      return {
        ...base,
        kind,
        measurementId: normalizeId(raw.measurementId),
        MeasurementId: normalizeId(raw.MeasurementId),
        label: String(raw.label ?? ''),
        unit: String(raw.unit ?? ''),
        value: Number(raw.value ?? 0),
        delta: Number(raw.delta ?? 0),
        date: String(raw.date ?? ''),
      };
    case 'steps':
      return {
        ...base,
        kind,
        dailyStepsId: normalizeId(raw.dailyStepsId),
        week: Number(raw.week ?? 0),
        dayLabel: String(raw.dayLabel ?? ''),
        steps: Number(raw.steps ?? 0),
        goal: Number(raw.goal ?? 0),
      };
    case 'wellness': {
      const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
      return {
        ...base,
        kind,
        date: String(raw.date ?? ''),
        items: itemsRaw.map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          return {
            wellnessId: normalizeId(row.wellnessId),
            masterId: normalizeId(row.masterId),
            key: String(row.key ?? ''),
            label: String(row.label ?? ''),
            value: Number(row.value ?? 0),
          };
        }),
      };
    }
    case 'photos':
      return {
        ...base,
        kind,
        week: Number(raw.week ?? 0),
        photos: Array.isArray(raw.photos) ? raw.photos.map(String) : [],
      };
    case 'challenge':
      return {
        ...base,
        kind,
        title: String(raw.title ?? ''),
        completedDays: Number(raw.completedDays ?? 0),
        totalDays: Number(raw.totalDays ?? 0),
        completed: Boolean(raw.completed),
      };
    default:
      return null;
  }
}

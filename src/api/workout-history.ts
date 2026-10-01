import { apiRequest } from '@/api/http';
import {
  normalizeWorkoutHistory,
  type ExerciseLog,
  type WorkoutHistoryEntry,
  type WorkoutMedia,
} from '@/types/workout-history';

/** Histórico de un cliente: GET /api/workout-history/:clientId */
export async function fetchClientWorkoutHistory(
  clientId: string,
): Promise<WorkoutHistoryEntry[]> {
  const data = await apiRequest<unknown[]>(
    `/api/workout-history/${encodeURIComponent(clientId)}`,
  );
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeWorkoutHistory(item as Record<string, unknown>));
}

export type CreateWorkoutHistoryPayload = {
  clientId: string;
  week: number;
  date: string;
  day: string;
  focus: string;
  duration: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  media?: WorkoutMedia[];
  shareInCommunity?: boolean;
};

/** Crea sesión: POST /api/workout-history */
export async function createWorkoutHistory(
  payload: CreateWorkoutHistoryPayload,
): Promise<WorkoutHistoryEntry> {
  const raw = await apiRequest<Record<string, unknown>>('/api/workout-history', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeWorkoutHistory(raw);
}

/** Actualiza sesión: PUT /api/workout-history/:id */
export async function updateWorkoutHistory(
  id: string,
  payload: { exercises?: ExerciseLog[] },
): Promise<WorkoutHistoryEntry> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/workout-history/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeWorkoutHistory(raw);
}

/** Elimina sesión: DELETE /api/workout-history/:id */
export async function deleteWorkoutHistory(id: string): Promise<void> {
  await apiRequest<void>(
    `/api/workout-history/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

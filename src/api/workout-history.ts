import { API_URL } from '@/constants/api';
import {
  normalizeWorkoutHistory,
  type ExerciseLog,
  type WorkoutHistoryEntry,
} from '@/types/workout-history';

type ApiErrorBody = { message?: string };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { allowEmpty?: boolean },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      ...init,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  if (options?.allowEmpty && res.status === 204) {
    return undefined as T;
  }

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

/** Histórico de un cliente: GET /api/workout-history/:clientId */
export async function fetchClientWorkoutHistory(
  clientId: string,
): Promise<WorkoutHistoryEntry[]> {
  const data = await request<unknown[]>(
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
};

/** Crea sesión: POST /api/workout-history */
export async function createWorkoutHistory(
  payload: CreateWorkoutHistoryPayload,
): Promise<WorkoutHistoryEntry> {
  const raw = await request<Record<string, unknown>>('/api/workout-history', {
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
  const raw = await request<Record<string, unknown>>(
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
  await request<void>(
    `/api/workout-history/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

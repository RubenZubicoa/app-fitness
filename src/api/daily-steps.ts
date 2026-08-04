import { API_URL } from '@/constants/api';
import {
  normalizeDailySteps,
  type DailySteps,
  type DaySteps,
} from '@/types/daily-steps';

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

/** Pasos de un cliente: GET /api/daily-steps/:clientId */
export async function fetchClientDailySteps(clientId: string): Promise<DailySteps[]> {
  const raw = await request<unknown[]>(`/api/daily-steps/${encodeURIComponent(clientId)}`);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeDailySteps(item as Record<string, unknown>));
}

/** Actualiza registro de pasos: PUT /api/daily-steps/:id */
export async function updateDailySteps(
  id: string,
  payload: { days?: DaySteps[]; goal?: number; week?: number },
): Promise<DailySteps> {
  const raw = await request<Record<string, unknown>>(
    `/api/daily-steps/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeDailySteps(raw);
}

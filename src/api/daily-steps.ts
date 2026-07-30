import { API_URL } from '@/constants/api';
import { normalizeDailySteps, type DailySteps } from '@/types/daily-steps';

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

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
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

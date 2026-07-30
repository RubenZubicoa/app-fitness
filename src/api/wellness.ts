import { API_URL } from '@/constants/api';
import {
  normalizeWellness,
  normalizeWellnessMaster,
  type Wellness,
  type WellnessMaster,
} from '@/types/wellness';

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

/** Lista tipos de sensación (tabla maestra): GET /api/wellness-masters */
export async function fetchWellnessMasters(): Promise<WellnessMaster[]> {
  const raw = await request<unknown[]>('/api/wellness-masters');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeWellnessMaster(item as Record<string, unknown>));
}

/** Sensaciones de un cliente: GET /api/wellness/:clientId */
export async function fetchClientWellness(clientId: string): Promise<Wellness[]> {
  const raw = await request<unknown[]>(`/api/wellness/${encodeURIComponent(clientId)}`);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeWellness(item as Record<string, unknown>));
}

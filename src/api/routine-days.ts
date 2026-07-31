import { API_URL } from '@/constants/api';
import { normalizeRoutineDay, type RoutineDay } from '@/types/routine-day';

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

/** Días de rutina de un cliente: GET /api/routine-days/:clientId */
export async function fetchClientRoutineDays(clientId: string): Promise<RoutineDay[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/routine-days/${encodeURIComponent(clientId)}`, {
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

  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeRoutineDay(item as Record<string, unknown>));
}

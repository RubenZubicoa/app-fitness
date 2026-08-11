import { API_URL } from '@/constants/api';
import { normalizeMeal, type Meal } from '@/types/meal';

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

/** Plan de comidas de un cliente: GET /api/meals/client/:clientId */
export async function fetchClientMeals(clientId: string): Promise<Meal | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/meals/client/${encodeURIComponent(clientId)}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  if (res.status === 404) return null;

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  if (!data || typeof data !== 'object') return null;
  return normalizeMeal(data as Record<string, unknown>);
}

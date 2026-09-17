import { apiFetch, parseJson } from '@/api/http';
import { normalizeMeal, type Meal } from '@/types/meal';

/** Plan de comidas de un cliente: GET /api/meals/client/:clientId */
export async function fetchClientMeals(clientId: string): Promise<Meal | null> {
  const res = await apiFetch(`/api/meals/client/${encodeURIComponent(clientId)}`);

  if (res.status === 404) return null;

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  if (!data || typeof data !== 'object') return null;
  return normalizeMeal(data as Record<string, unknown>);
}

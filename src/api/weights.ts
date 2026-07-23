import { API_URL } from '@/constants/api';
import { normalizeWeight, type Weight } from '@/types/weight';

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

/** Serie de peso de un cliente: GET /api/clients/:id/weights */
export async function fetchClientWeight(clientId: string): Promise<Weight | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/clients/${encodeURIComponent(clientId)}/weights`, {
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
  return normalizeWeight(data as Record<string, unknown>);
}

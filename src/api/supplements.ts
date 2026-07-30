import { API_URL } from '@/constants/api';
import { normalizeSupplements, type Supplements } from '@/types/supplements';

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

/** Suplementos de un cliente: GET /api/supplements/:clientId */
export async function fetchClientSupplements(clientId: string): Promise<Supplements | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/supplements/${encodeURIComponent(clientId)}`, {
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
  return normalizeSupplements(data as Record<string, unknown>);
}

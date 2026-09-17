import { apiFetch, parseJson } from '@/api/http';
import { normalizeSupplements, type Supplements } from '@/types/supplements';

/** Suplementos de un cliente: GET /api/supplements/:clientId */
export async function fetchClientSupplements(clientId: string): Promise<Supplements | null> {
  const res = await apiFetch(`/api/supplements/${encodeURIComponent(clientId)}`);

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
  return normalizeSupplements(data as Record<string, unknown>);
}

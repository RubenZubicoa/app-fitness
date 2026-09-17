import { apiFetch, parseJson } from '@/api/http';
import { normalizeMacros, type Macros } from '@/types/macros';

/** Macros de un cliente: GET /api/macros/:clientId */
export async function fetchClientMacros(clientId: string): Promise<Macros | null> {
  const res = await apiFetch(`/api/macros/${encodeURIComponent(clientId)}`);

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
  return normalizeMacros(data as Record<string, unknown>);
}

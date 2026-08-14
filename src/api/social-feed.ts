import { API_URL } from '@/constants/api';
import {
  normalizeSocialFeedEntry,
  type SocialFeedEntry,
  type SocialFeedKind,
} from '@/types/social-feed';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

/** Feed comunitario: GET /api/social-feed?kind=...&limit=... */
export async function fetchSocialFeed(options?: {
  kind?: SocialFeedKind;
  limit?: number;
}): Promise<SocialFeedEntry[]> {
  const params = new URLSearchParams();
  if (options?.kind) params.set('kind', options.kind);
  if (options?.limit != null) params.set('limit', String(options.limit));

  const query = params.toString();
  const raw = await request<unknown[]>(`/api/social-feed${query ? `?${query}` : ''}`);
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => normalizeSocialFeedEntry(item as Record<string, unknown>))
    .filter((item): item is SocialFeedEntry => item != null);
}

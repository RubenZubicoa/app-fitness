import { API_URL } from '@/constants/api';
import { fetchAllClients } from '@/api/clients';
import { fetchStepsRanking } from '@/api/daily-steps';
import { fetchClientWorkoutHistory } from '@/api/workout-history';
import {
  normalizeSocialFeedEntry,
  type SocialFeedEntry,
  type SocialFeedKind,
} from '@/types/social-feed';
import {
  normalizeCommunityStats,
  type CommunityStats,
} from '@/types/community-stats';

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

function startOfCalendarWeek(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const weekday = d.getDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  d.setDate(d.getDate() - mondayOffset);
  return d;
}

function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Calcula estadísticas con endpoints ya desplegados (fallback si /stats no existe). */
async function fetchCommunityStatsFallback(): Promise<CommunityStats> {
  const weekStartIso = formatIsoDate(startOfCalendarWeek());

  const [clients, ranking] = await Promise.all([
    fetchAllClients(),
    fetchStepsRanking('week'),
  ]);

  const histories = await Promise.all(
    clients.map((client) => fetchClientWorkoutHistory(client._id).catch(() => [])),
  );

  let weeklyWorkouts = 0;
  for (const history of histories) {
    weeklyWorkouts += history.filter((entry) => entry.date >= weekStartIso).length;
  }

  const weeklySteps = ranking.reduce((sum, entry) => sum + entry.steps, 0);

  return {
    activeMembers: clients.length,
    weeklyWorkouts,
    weeklySteps,
  };
}

/** Estadísticas de comunidad: GET /api/social-feed/stats (con fallback). */
export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    const raw = await request<Record<string, unknown>>('/api/social-feed/stats');
    return normalizeCommunityStats(raw);
  } catch {
    return fetchCommunityStatsFallback();
  }
}

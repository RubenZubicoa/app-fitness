import { apiRequest } from '@/api/http';
import {
  normalizeDailySteps,
  type DailySteps,
  type DaySteps,
} from '@/types/daily-steps';
import {
  normalizeStepsRankingEntry,
  type StepsRankingEntry,
} from '@/types/steps-ranking';

/** Pasos de un cliente: GET /api/daily-steps/:clientId */
export async function fetchClientDailySteps(clientId: string): Promise<DailySteps[]> {
  const raw = await apiRequest<unknown[]>(`/api/daily-steps/${encodeURIComponent(clientId)}`);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeDailySteps(item as Record<string, unknown>));
}

/** Ranking comunitario de pasos: GET /api/daily-steps/ranking?period=week|month */
export async function fetchStepsRanking(period: 'week' | 'month'): Promise<StepsRankingEntry[]> {
  const raw = await apiRequest<unknown[]>(
    `/api/daily-steps/ranking?period=${encodeURIComponent(period)}`,
  );
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeStepsRankingEntry(item as Record<string, unknown>));
}

/** Actualiza registro de pasos: PUT /api/daily-steps/:id */
export async function updateDailySteps(
  id: string,
  payload: { days?: DaySteps[]; goal?: number; week?: number; shareInCommunity?: boolean },
): Promise<DailySteps> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/daily-steps/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeDailySteps(raw);
}

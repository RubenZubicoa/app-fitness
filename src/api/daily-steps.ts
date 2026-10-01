import { apiRequest } from '@/api/http';
import {
  normalizeDailySteps,
  type DailySteps,
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

export type CreateDailyStepsPayload = {
  clientId: string;
  date: string;
  steps: number;
  goal?: number;
  shareInCommunity?: boolean;
};

/** Crea registro diario: POST /api/daily-steps */
export async function createDailySteps(
  payload: CreateDailyStepsPayload,
): Promise<DailySteps> {
  const raw = await apiRequest<Record<string, unknown>>('/api/daily-steps', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeDailySteps(raw);
}

export type UpdateDailyStepsPayload = {
  steps?: number;
  goal?: number;
  date?: string;
  shareInCommunity?: boolean;
};

/** Actualiza registro de pasos: PUT /api/daily-steps/:id */
export async function updateDailySteps(
  id: string,
  payload: UpdateDailyStepsPayload,
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

import { apiRequest } from '@/api/http';
import {
  normalizeWellness,
  normalizeWellnessMaster,
  type Wellness,
  type WellnessMaster,
} from '@/types/wellness';

/** Lista tipos de sensación (tabla maestra): GET /api/wellness-masters */
export async function fetchWellnessMasters(): Promise<WellnessMaster[]> {
  const raw = await apiRequest<unknown[]>('/api/wellness-masters');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeWellnessMaster(item as Record<string, unknown>));
}

/** Sensaciones de un cliente: GET /api/wellness/:clientId */
export async function fetchClientWellness(clientId: string): Promise<Wellness[]> {
  const raw = await apiRequest<unknown[]>(`/api/wellness/${encodeURIComponent(clientId)}`);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeWellness(item as Record<string, unknown>));
}

export type CreateWellnessPayload = {
  clientId: string;
  wellnessId: string;
  value: number;
  date: string;
  shareInCommunity?: boolean;
};

/** Crea sensación: POST /api/wellness */
export async function createWellness(payload: CreateWellnessPayload): Promise<Wellness> {
  const raw = await apiRequest<Record<string, unknown>>('/api/wellness', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeWellness(raw);
}

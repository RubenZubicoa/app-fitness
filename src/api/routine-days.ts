import { apiRequest } from '@/api/http';
import { normalizeRoutineDay, type RoutineDay } from '@/types/routine-day';

/** Días de rutina de un cliente: GET /api/routine-days/:clientId */
export async function fetchClientRoutineDays(clientId: string): Promise<RoutineDay[]> {
  const data = await apiRequest<unknown[]>(
    `/api/routine-days/${encodeURIComponent(clientId)}`,
  );
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeRoutineDay(item as Record<string, unknown>));
}

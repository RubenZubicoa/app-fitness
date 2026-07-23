import { API_URL } from '@/constants/api';
import {
  normalizeMeasurement,
  normalizeMeasurementMaster,
  type Measurement,
  type MeasurementMaster,
} from '@/types/measurement';

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

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
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

/** Lista tipos de medida (tabla maestra). */
export async function fetchMeasurementMasters(): Promise<MeasurementMaster[]> {
  const raw = await request<unknown[]>('/api/measurement-masters');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeMeasurementMaster(item as Record<string, unknown>));
}

/** Medidas de un cliente: GET /api/clients/:id/measurements */
export async function fetchClientMeasurements(clientId: string): Promise<Measurement[]> {
  const raw = await request<unknown[]>(`/api/clients/${encodeURIComponent(clientId)}/measurements`);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeMeasurement(item as Record<string, unknown>));
}

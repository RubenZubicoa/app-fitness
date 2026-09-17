import { apiRequest } from '@/api/http';
import {
  normalizeMeasurement,
  normalizeMeasurementMaster,
  type Measurement,
  type MeasurementMaster,
} from '@/types/measurement';

/** Lista tipos de medida (tabla maestra). */
export async function fetchMeasurementMasters(): Promise<MeasurementMaster[]> {
  const raw = await apiRequest<unknown[]>('/api/measurement-masters');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeMeasurementMaster(item as Record<string, unknown>));
}

/** Medidas de un cliente: GET /api/clients/:id/measurements */
export async function fetchClientMeasurements(clientId: string): Promise<Measurement[]> {
  const raw = await apiRequest<unknown[]>(`/api/clients/${encodeURIComponent(clientId)}/measurements`);
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeMeasurement(item as Record<string, unknown>));
}

export type CreateMeasurementPayload = {
  client: string;
  MeasurementId: string;
  value: number;
  delta: number;
  date: string;
  shareInCommunity?: boolean;
};

/** Crea medida: POST /api/measurements */
export async function createMeasurement(
  payload: CreateMeasurementPayload,
): Promise<Measurement> {
  const raw = await apiRequest<Record<string, unknown>>('/api/measurements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeMeasurement(raw);
}

export type UpdateMeasurementPayload = {
  value?: number;
  delta?: number;
  date?: string;
  MeasurementId?: string;
};

/** Actualiza medida: PUT /api/measurements/:id */
export async function updateMeasurement(
  id: string,
  payload: UpdateMeasurementPayload,
): Promise<Measurement> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/measurements/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeMeasurement(raw);
}

/** Elimina medida: DELETE /api/measurements/:id */
export async function deleteMeasurement(id: string): Promise<void> {
  await apiRequest<void>(
    `/api/measurements/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

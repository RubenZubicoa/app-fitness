import { apiFetch, apiRequest, parseJson } from '@/api/http';
import {
  normalizeTechnicalSpecifications,
  type CreateTechnicalSpecificationsInput,
  type TechnicalSpecifications,
  type UpdateTechnicalSpecificationsInput,
} from '@/types/technical-specifications';

/** Ficha técnica del cliente: GET /api/technical-specifications/client/:clientId */
export async function fetchClientTechnicalSpecifications(
  clientId: string,
): Promise<TechnicalSpecifications | null> {
  const res = await apiFetch(
    `/api/technical-specifications/client/${encodeURIComponent(clientId)}`,
  );

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
  return normalizeTechnicalSpecifications(data as Record<string, unknown>);
}

/** Alta: POST /api/technical-specifications */
export async function createTechnicalSpecifications(
  payload: CreateTechnicalSpecificationsInput,
): Promise<TechnicalSpecifications> {
  const raw = await apiRequest<Record<string, unknown>>('/api/technical-specifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeTechnicalSpecifications(raw);
}

/** Actualización: PUT /api/technical-specifications/:id */
export async function updateTechnicalSpecifications(
  id: string,
  payload: UpdateTechnicalSpecificationsInput,
): Promise<TechnicalSpecifications> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/technical-specifications/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeTechnicalSpecifications(raw);
}

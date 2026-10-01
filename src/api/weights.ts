import { apiFetch, apiRequest, parseJson } from '@/api/http';
import { normalizeWeight, type Weight } from '@/types/weight';

/** Serie de peso de un cliente: GET /api/clients/:id/weights */
export async function fetchClientWeight(clientId: string): Promise<Weight | null> {
  const res = await apiFetch(`/api/clients/${encodeURIComponent(clientId)}/weights`);

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
  return normalizeWeight(data as Record<string, unknown>);
}

export type CreateWeightPayload = {
  clientId: string;
  labels: string[];
  data: number[];
  start: number;
  current: number;
  target: number;
  unit: string;
};

/** Crea serie de peso: POST /api/weights */
export async function createWeight(
  payload: CreateWeightPayload & { shareInCommunity?: boolean },
): Promise<Weight> {
  const raw = await apiRequest<Record<string, unknown>>('/api/weights', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeWeight(raw);
}

/** Actualiza serie de peso: PUT /api/weights/:id */
export async function updateWeight(
  id: string,
  payload: Partial<Omit<CreateWeightPayload, 'clientId'>> & {
    clientId?: string;
    shareInCommunity?: boolean;
  },
): Promise<Weight> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/weights/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeWeight(raw);
}

/** Añade un punto a la serie de peso del cliente (crea la serie si no existe). */
export async function appendWeightEntry(input: {
  clientId: string;
  value: number;
  date: string;
  existing: Weight | null;
  target?: number;
  unit?: string;
  shareInCommunity?: boolean;
}): Promise<Weight> {
  const { clientId, value, date, existing, shareInCommunity } = input;
  const unit = input.unit ?? existing?.unit ?? 'kg';
  const target = input.target ?? existing?.target ?? value;

  if (!existing) {
    return createWeight({
      clientId,
      labels: [date],
      data: [value],
      start: value,
      current: value,
      target,
      unit,
      shareInCommunity,
    });
  }

  // Alinea longitudes por si el documento quedó inconsistente.
  const len = Math.min(existing.labels.length, existing.data.length);
  const labels = existing.labels.slice(0, len);
  const data = existing.data.slice(0, len);

  // Si ya hay un punto para la misma fecha, lo sustituye.
  const sameDateIndex = labels.lastIndexOf(date);
  if (sameDateIndex >= 0) {
    const nextLabels = [...labels];
    const nextData = [...data];
    nextData[sameDateIndex] = value;
    return updateWeight(existing._id, {
      labels: nextLabels,
      data: nextData,
      current: value,
      shareInCommunity,
    });
  }

  return updateWeight(existing._id, {
    labels: [...labels, date],
    data: [...data, value],
    current: value,
    shareInCommunity,
  });
}

/** Actualiza un punto de la serie de peso por índice. */
export async function updateWeightEntryAtIndex(input: {
  existing: Weight;
  index: number;
  value: number;
  date?: string;
}): Promise<Weight> {
  const { existing, index, value } = input;
  const len = Math.min(existing.labels.length, existing.data.length);
  if (index < 0 || index >= len) {
    throw new Error('Registro de peso no encontrado');
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('El peso debe ser mayor que 0');
  }

  const labels = existing.labels.slice(0, len);
  const data = existing.data.slice(0, len);
  data[index] = value;
  if (input.date) labels[index] = input.date;

  return updateWeight(existing._id, {
    labels,
    data,
    current: data[data.length - 1] ?? existing.current,
  });
}

/** Elimina un punto de la serie de peso por índice. */
export async function deleteWeightEntryAtIndex(input: {
  existing: Weight;
  index: number;
}): Promise<Weight> {
  const { existing, index } = input;
  const len = Math.min(existing.labels.length, existing.data.length);
  if (index < 0 || index >= len) {
    throw new Error('Registro de peso no encontrado');
  }

  const labels = existing.labels.slice(0, len);
  const data = existing.data.slice(0, len);
  labels.splice(index, 1);
  data.splice(index, 1);

  return updateWeight(existing._id, {
    labels,
    data,
    current: data.length > 0 ? data[data.length - 1] : existing.start,
    ...(data.length === 0 ? { start: existing.start } : {}),
  });
}

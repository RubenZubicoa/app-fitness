import { API_URL } from '@/constants/api';
import { normalizeWeight, type Weight } from '@/types/weight';

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

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { allowEmpty?: boolean },
): Promise<T> {
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

  if (options?.allowEmpty && res.status === 204) {
    return undefined as T;
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

/** Serie de peso de un cliente: GET /api/clients/:id/weights */
export async function fetchClientWeight(clientId: string): Promise<Weight | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/clients/${encodeURIComponent(clientId)}/weights`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  if (res.status === 404) return null;

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
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
  const raw = await request<Record<string, unknown>>('/api/weights', {
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
  const raw = await request<Record<string, unknown>>(
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

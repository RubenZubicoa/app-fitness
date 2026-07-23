import { normalizeId } from '@/types/program';

export type Weight = {
  _id: string;
  clientId: string;
  labels: string[];
  data: number[];
  start: number;
  current: number;
  target: number;
  unit: string;
};

export function normalizeWeight(raw: Record<string, unknown>): Weight {
  const labels = Array.isArray(raw.labels) ? raw.labels.map(String) : [];
  const data = Array.isArray(raw.data) ? raw.data.map((n) => Number(n)) : [];

  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    labels,
    data,
    start: Number(raw.start ?? 0),
    current: Number(raw.current ?? 0),
    target: Number(raw.target ?? 0),
    unit: String(raw.unit ?? 'kg'),
  };
}

/** Último peso registrado en la serie (fallback a `current`). */
export function getLatestWeightValue(weight: Weight): number {
  if (weight.data.length > 0) {
    return weight.data[weight.data.length - 1];
  }
  return weight.current;
}

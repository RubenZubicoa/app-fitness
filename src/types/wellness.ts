import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { normalizeId } from '@/types/program';

type Ionicon = ComponentProps<typeof Ionicons>['name'];

export type WellnessMaster = {
  _id: string;
  key: string;
  label: string;
  icon: string;
  tone: string;
};

export type Wellness = {
  _id: string;
  clientId: string;
  wellnessId: string;
  value: number;
  date: string;
};

export type EnrichedWellness = Wellness & {
  key: string;
  label: string;
  icon: Ionicon;
  tone: string;
};

export function normalizeWellnessMaster(raw: Record<string, unknown>): WellnessMaster {
  return {
    _id: normalizeId(raw._id),
    key: String(raw.key ?? ''),
    label: String(raw.label ?? ''),
    icon: String(raw.icon ?? 'pulse-outline'),
    tone: String(raw.tone ?? 'gold'),
  };
}

function normalizeDate(value: unknown): string {
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value && typeof value === 'object' && '$date' in value) {
    return String((value as { $date: string }).$date).slice(0, 10);
  }
  return String(value ?? '');
}

export function normalizeWellness(raw: Record<string, unknown>): Wellness {
  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    wellnessId: normalizeId(raw.wellnessId),
    value: Number(raw.value ?? 0),
    date: normalizeDate(raw.date),
  };
}

export function getWellnessMasterById(
  masters: WellnessMaster[],
  id: string,
): WellnessMaster | undefined {
  const byId = masters.find((m) => m._id === id);
  if (byId) return byId;
  const key = id.startsWith('well-') ? id.slice(5) : id;
  return masters.find((m) => m.key === key);
}

export function getWellnessMasterByKey(
  masters: WellnessMaster[],
  key: string,
): WellnessMaster | undefined {
  return masters.find((m) => m.key === key);
}

/** Último registro por tipo de bienestar (más reciente primero). */
export function latestWellnessByType(records: Wellness[]): Wellness[] {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Set<string>();
  const latest: Wellness[] = [];
  for (const record of sorted) {
    if (seen.has(record.wellnessId)) continue;
    seen.add(record.wellnessId);
    latest.push(record);
  }
  return latest;
}

/** Registro enriquecido con datos de la maestra. */
export function enrichWellness(record: Wellness, masters: WellnessMaster[]): EnrichedWellness {
  const master = getWellnessMasterById(masters, record.wellnessId);
  return {
    ...record,
    key: master?.key ?? record.wellnessId,
    label: master?.label ?? 'Sensación',
    icon: (master?.icon as Ionicon) ?? 'pulse-outline',
    tone: master?.tone ?? 'gold',
  };
}

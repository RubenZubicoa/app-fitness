import { normalizeId } from '@/types/program';

export type MeasurementMaster = {
  _id: string;
  key: string;
  label: string;
  unit: string;
  icon: string;
};

export type Measurement = {
  _id: string;
  client: string;
  MeasurementId: string;
  value: number;
  delta: number;
  date: string;
};

export type EnrichedMeasurement = Measurement & {
  label: string;
  unit: string;
  icon: string;
  key: string;
};

export function normalizeMeasurementMaster(raw: Record<string, unknown>): MeasurementMaster {
  return {
    _id: normalizeId(raw._id),
    key: String(raw.key ?? ''),
    label: String(raw.label ?? ''),
    unit: String(raw.unit ?? ''),
    icon: String(raw.icon ?? 'body-outline'),
  };
}

export function normalizeMeasurement(raw: Record<string, unknown>): Measurement {
  return {
    _id: normalizeId(raw._id),
    client: normalizeId(raw.client),
    MeasurementId: normalizeId(raw.MeasurementId),
    value: Number(raw.value ?? 0),
    delta: Number(raw.delta ?? 0),
    date: String(raw.date ?? ''),
  };
}

export function enrichMeasurement(
  record: Measurement,
  masters: MeasurementMaster[],
): EnrichedMeasurement {
  const master = masters.find((m) => m._id === record.MeasurementId);
  return {
    ...record,
    label: master?.label ?? record.MeasurementId,
    unit: master?.unit ?? '',
    icon: master?.icon ?? 'body-outline',
    key: master?.key ?? record.MeasurementId,
  };
}

/** Última medida por cada tipo (MeasurementId). */
export function latestMeasurementsByType(records: Measurement[]): Measurement[] {
  const seen = new Set<string>();
  const latest: Measurement[] = [];
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  for (const record of sorted) {
    if (seen.has(record.MeasurementId)) continue;
    seen.add(record.MeasurementId);
    latest.push(record);
  }
  return latest;
}

/** Serie temporal de valores por MeasurementId (orden cronológico). */
export type MeasurementSeriesPoint = {
  value: number;
  date: string;
};

export function buildMeasurementSeries(
  records: Measurement[],
): Record<string, MeasurementSeriesPoint[]> {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const series: Record<string, MeasurementSeriesPoint[]> = {};
  for (const record of sorted) {
    if (!series[record.MeasurementId]) series[record.MeasurementId] = [];
    series[record.MeasurementId].push({
      value: record.value,
      date: record.date,
    });
  }
  return series;
}

/** Etiqueta corta para el eje X del gráfico (ej. "20 jul"). */
export function formatChartDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

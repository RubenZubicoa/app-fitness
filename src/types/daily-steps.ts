import { normalizeId } from '@/types/program';

export type DailySteps = {
  _id: string;
  clientId: string;
  /** Fecha del registro (ISO YYYY-MM-DD). */
  date: string;
  steps: number;
  /** Objetivo diario de pasos. */
  goal?: number;
};

export function normalizeDailySteps(raw: Record<string, unknown>): DailySteps {
  const goalRaw = raw.goal;
  const goal =
    goalRaw == null || goalRaw === ''
      ? undefined
      : Number(goalRaw);

  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    date: String(raw.date ?? '').slice(0, 10),
    steps: Number(raw.steps ?? 0),
    goal: goal != null && Number.isFinite(goal) ? goal : undefined,
  };
}

/** Hoy en ISO YYYY-MM-DD (local). */
export function toISODate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Índice del día en la semana (0 = lunes … 6 = domingo). */
export function getTodayWeekdayIndex(date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
const WEEKDAY_CHART = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export function weekdayShortFromISO(isoDate: string): string {
  const parsed = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return WEEKDAY_SHORT[getTodayWeekdayIndex(parsed)] ?? isoDate;
}

export function weekdayChartLabelFromISO(isoDate: string): string {
  const parsed = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return WEEKDAY_CHART[getTodayWeekdayIndex(parsed)] ?? '';
}

/** Formato legible (ej. "22 mar 2026"). */
export function formatDailyStepsDate(isoDate: string): string {
  const parsed = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Registro del día indicado (por defecto hoy). */
export function pickDailyStepsForDate(
  records: DailySteps[],
  date: string = toISODate(),
): DailySteps | null {
  const target = date.slice(0, 10);
  return records.find((r) => r.date === target) ?? null;
}

/** Orden ascendente por fecha. */
export function sortDailyStepsByDate(records: DailySteps[]): DailySteps[] {
  return [...records].sort((a, b) => a.date.localeCompare(b.date));
}

export type DateRangeFilter = {
  from?: string | null;
  to?: string | null;
};

/** Filtra registros inclusivos por from/to (YYYY-MM-DD). */
export function filterDailyStepsByDateRange(
  records: DailySteps[],
  range?: DateRangeFilter,
): DailySteps[] {
  const from = range?.from?.trim().slice(0, 10) || null;
  const to = range?.to?.trim().slice(0, 10) || null;
  if (!from && !to) return records;
  return records.filter((r) => {
    const date = r.date.slice(0, 10);
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}

/** Lista ISO YYYY-MM-DD inclusiva entre from y to. */
export function enumerateISODates(from: string, to: string): string[] {
  const start = from.slice(0, 10);
  const end = to.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return [];
  }
  if (start > end) return [];

  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = shiftISODate(cursor, 1);
    if (dates.length > 400) break;
  }
  return dates;
}

export type DailyStepsListRow = {
  date: string;
  record: DailySteps | null;
  steps: number;
  goal?: number;
};

/**
 * Filas editables del rango: un día por fecha.
 * Si no hay from/to, usa solo los registros existentes (orden desc).
 */
export function buildDailyStepsListRows(
  records: DailySteps[],
  range?: DateRangeFilter,
): DailyStepsListRow[] {
  const from = range?.from?.trim().slice(0, 10) || null;
  const to = range?.to?.trim().slice(0, 10) || null;
  const byDate = new Map(records.map((r) => [r.date.slice(0, 10), r]));

  if (from && to) {
    return enumerateISODates(from, to)
      .map((date) => {
        const record = byDate.get(date) ?? null;
        return {
          date,
          record,
          steps: record?.steps ?? 0,
          goal: record?.goal,
        };
      })
      .reverse();
  }

  return sortDailyStepsByDate(filterDailyStepsByDateRange(records, range))
    .reverse()
    .map((record) => ({
      date: record.date.slice(0, 10),
      record,
      steps: record.steps,
      goal: record.goal,
    }));
}

/** Lunes–domingo de la semana que contiene `date` (local). */
export function getWeekDateRange(date = new Date()): { from: string; to: string } {
  const idx = getTodayWeekdayIndex(date);
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - idx);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toISODate(monday), to: toISODate(sunday) };
}

/** Registros de la semana calendario actual (L–D). */
export function getWeekDailySteps(
  records: DailySteps[],
  date = new Date(),
): DailySteps[] {
  const range = getWeekDateRange(date);
  return filterDailyStepsByDateRange(records, range);
}

export type WeekDayBar = {
  label: string;
  date: string;
  value: number;
  record: DailySteps | null;
};

/** Barras L–D de la semana actual a partir de registros diarios. */
export function buildCurrentWeekBars(
  records: DailySteps[],
  date = new Date(),
): WeekDayBar[] {
  const { from } = getWeekDateRange(date);
  const byDate = new Map(records.map((r) => [r.date, r]));
  const start = new Date(`${from}T12:00:00`);

  return WEEKDAY_CHART.map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toISODate(d);
    const record = byDate.get(iso) ?? null;
    return {
      label,
      date: iso,
      value: record?.steps ?? 0,
      record,
    };
  });
}

/** Objetivo efectivo: el del registro, o el último goal conocido. */
export function resolveStepsGoal(
  record: DailySteps | null | undefined,
  records: DailySteps[] = [],
  fallback = 10000,
): number {
  if (record?.goal != null && record.goal > 0) return record.goal;
  const withGoal = sortDailyStepsByDate(records)
    .reverse()
    .find((r) => r.goal != null && r.goal > 0);
  return withGoal?.goal ?? fallback;
}

export type DailyStepsHistoryPoint = {
  label: string;
  value: number;
  date: string;
  recordId: string;
};

/** Serie histórica ordenada por fecha para gráficos. */
export function buildDailyStepsHistory(
  records: DailySteps[],
): DailyStepsHistoryPoint[] {
  return sortDailyStepsByDate(records).map((record) => ({
    label: formatDailyStepsDate(record.date),
    value: record.steps,
    date: record.date,
    recordId: record._id,
  }));
}

/** Resta N días a una fecha ISO. */
export function shiftISODate(isoDate: string, days: number): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

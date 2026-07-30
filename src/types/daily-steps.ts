import { normalizeId } from '@/types/program';

export type DaySteps = {
  label: string;
  value: number;
};

export type DailySteps = {
  _id: string;
  clientId: string;
  week: number;
  goal: number;
  days: DaySteps[];
};

export function normalizeDailySteps(raw: Record<string, unknown>): DailySteps {
  const daysRaw = Array.isArray(raw.days) ? raw.days : [];
  const days: DaySteps[] = daysRaw.map((item) => {
    const day = (item ?? {}) as Record<string, unknown>;
    return {
      label: String(day.label ?? ''),
      value: Number(day.value ?? 0),
    };
  });

  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    week: Number(raw.week ?? 0),
    goal: Number(raw.goal ?? 0),
    days,
  };
}

/** Índice del día actual en la semana (0 = lunes … 6 = domingo). */
export function getTodayWeekdayIndex(date = new Date()): number {
  const day = date.getDay(); // 0 = domingo
  return day === 0 ? 6 : day - 1;
}

/** Elige el registro de la semana del cliente, o el más reciente. */
export function pickCurrentDailySteps(
  records: DailySteps[],
  week?: number,
): DailySteps | null {
  if (records.length === 0) return null;
  if (week != null) {
    const match = records.find((r) => r.week === week);
    if (match) return match;
  }
  return [...records].sort((a, b) => b.week - a.week)[0] ?? null;
}

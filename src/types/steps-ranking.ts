/** Entrada del ranking de pasos (semana o mes). */
export type StepsRankingEntry = {
  clientId: string;
  fullName: string;
  avatar: string;
  /** Total de pasos en el periodo. */
  steps: number;
  /** Promedio diario en el periodo (útil en ranking mensual). */
  avgDaily?: number;
};

export type StepsRankingPeriod = 'week' | 'month';

export function formatStepsCount(steps: number): string {
  return steps.toLocaleString('es-ES');
}

export function normalizeStepsRankingEntry(raw: Record<string, unknown>): StepsRankingEntry {
  return {
    clientId: String(raw.clientId ?? ''),
    fullName: String(raw.fullName ?? ''),
    avatar: String(raw.avatar ?? ''),
    steps: Number(raw.steps ?? 0),
    avgDaily: raw.avgDaily != null ? Number(raw.avgDaily) : undefined,
  };
}

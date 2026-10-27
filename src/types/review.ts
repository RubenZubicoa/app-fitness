import { normalizeId } from '@/types/program';

export type ReviewStatus = 'upcoming' | 'done' | 'canceled';

export type Review = {
  _id: string;
  clientId: string;
  title: string;
  date: string;
  status: ReviewStatus;
  note: string;
};

export function normalizeReview(raw: Record<string, unknown>): Review {
  return {
    _id: normalizeId(raw._id),
    clientId: String(raw.clientId ?? ''),
    title: String(raw.title ?? ''),
    date: String(raw.date ?? ''),
    status: (['upcoming', 'done', 'canceled'].includes(String(raw.status))
      ? raw.status
      : 'upcoming') as ReviewStatus,
    note: String(raw.note ?? ''),
  };
}

/** Interpreta `date` (ISO o YYYY-MM-DD) en hora local. */
export function parseReviewDate(dateStr: string): Date | null {
  const raw = dateStr.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Primera revisión `upcoming` en las próximas `hours` horas
 * (incluye las que acaban de empezar, hasta 1 h de margen).
 */
export function findUpcomingReviewWithinHours(
  reviews: Review[],
  hours = 24,
  from: Date = new Date(),
): Review | null {
  const now = from.getTime();
  const windowMs = hours * 60 * 60 * 1000;
  const gracePastMs = 60 * 60 * 1000;

  const candidates = reviews
    .filter((r) => r.status === 'upcoming')
    .map((r) => {
      const parsed = parseReviewDate(r.date);
      return parsed ? { review: r, time: parsed.getTime() } : null;
    })
    .filter((item): item is { review: Review; time: number } => item != null)
    .filter(({ time }) => time >= now - gracePastMs && time - now <= windowMs)
    .sort((a, b) => a.time - b.time);

  return candidates[0]?.review ?? null;
}

/** Texto legible de la fecha de revisión. */
export function formatReviewDateLabel(dateStr: string): string {
  const parsed = parseReviewDate(dateStr);
  if (!parsed) return dateStr;
  const hasTime = !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
  return parsed.toLocaleString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

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

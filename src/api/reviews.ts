import { apiFetch, apiRequest } from '@/api/http';
import { normalizeReview, type Review, type ReviewStatus } from '@/types/review';

/** GET /api/reviews?status=... */
export async function fetchReviews(status?: ReviewStatus): Promise<Review[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const raw = await apiRequest<unknown[]>(`/api/reviews${query}`);
  return raw.map((r) => normalizeReview(r as Record<string, unknown>));
}

/** GET /api/reviews/client/:clientId */
export async function fetchReviewsByClient(clientId: string): Promise<Review[]> {
  const raw = await apiRequest<unknown[]>(
    `/api/reviews/client/${encodeURIComponent(clientId)}`,
  );
  return raw.map((r) => normalizeReview(r as Record<string, unknown>));
}

/** POST /api/reviews */
export async function createReview(
  payload: Omit<Review, '_id'>,
): Promise<Review> {
  const raw = await apiRequest<Record<string, unknown>>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeReview(raw);
}

/** PUT /api/reviews/:id */
export async function updateReview(
  id: string,
  payload: Partial<Omit<Review, '_id'>>,
): Promise<Review> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/reviews/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeReview(raw);
}

/** DELETE /api/reviews/:id */
export async function deleteReview(id: string): Promise<void> {
  await apiFetch(`/api/reviews/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

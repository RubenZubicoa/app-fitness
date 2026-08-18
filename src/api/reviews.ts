import { API_URL } from '@/constants/api';
import { normalizeReview, type Review, type ReviewStatus } from '@/types/review';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

/** GET /api/reviews?status=... */
export async function fetchReviews(status?: ReviewStatus): Promise<Review[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const raw = await request<unknown[]>(`/api/reviews${query}`);
  return raw.map((r) => normalizeReview(r as Record<string, unknown>));
}

/** GET /api/reviews/client/:clientId */
export async function fetchReviewsByClient(clientId: string): Promise<Review[]> {
  const raw = await request<unknown[]>(
    `/api/reviews/client/${encodeURIComponent(clientId)}`,
  );
  return raw.map((r) => normalizeReview(r as Record<string, unknown>));
}

/** POST /api/reviews */
export async function createReview(
  payload: Omit<Review, '_id'>,
): Promise<Review> {
  const raw = await request<Record<string, unknown>>('/api/reviews', {
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
  const raw = await request<Record<string, unknown>>(
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
  await fetch(`${API_URL}/api/reviews/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
}

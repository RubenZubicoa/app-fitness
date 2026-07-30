import { API_URL } from '@/constants/api';
import {
  normalizeShoppingList,
  type ShoppingList,
  type ShoppingListItem,
} from '@/types/shopping-list';

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

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { allowEmpty?: boolean },
): Promise<T> {
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

  if (options?.allowEmpty && res.status === 204) {
    return undefined as T;
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

/** Lista de la compra de un cliente: GET /api/shopping-lists/:clientId */
export async function fetchClientShoppingList(clientId: string): Promise<ShoppingList | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/shopping-lists/${encodeURIComponent(clientId)}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  if (res.status === 404) return null;

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  if (!data || typeof data !== 'object') return null;
  return normalizeShoppingList(data as Record<string, unknown>);
}

/** Crea lista: POST /api/shopping-lists */
export async function createShoppingList(
  clientId: string,
  list: ShoppingListItem[] = [],
): Promise<ShoppingList> {
  const raw = await request<Record<string, unknown>>('/api/shopping-lists', {
    method: 'POST',
    body: JSON.stringify({ clientId, list }),
  });
  return normalizeShoppingList(raw);
}

/** Actualiza lista: PUT /api/shopping-lists/:id */
export async function updateShoppingList(
  id: string,
  payload: { list?: ShoppingListItem[]; clientId?: string },
): Promise<ShoppingList> {
  const raw = await request<Record<string, unknown>>(
    `/api/shopping-lists/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeShoppingList(raw);
}

/** Elimina lista: DELETE /api/shopping-lists/:id */
export async function deleteShoppingList(id: string): Promise<void> {
  await request<void>(
    `/api/shopping-lists/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

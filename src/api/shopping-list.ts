import { apiFetch, apiRequest, parseJson } from '@/api/http';
import {
  normalizeShoppingList,
  type ShoppingList,
  type ShoppingListItem,
} from '@/types/shopping-list';

/** Lista de la compra de un cliente: GET /api/shopping-lists/:clientId */
export async function fetchClientShoppingList(clientId: string): Promise<ShoppingList | null> {
  const res = await apiFetch(`/api/shopping-lists/${encodeURIComponent(clientId)}`);

  if (res.status === 404) return null;

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
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
  const raw = await apiRequest<Record<string, unknown>>('/api/shopping-lists', {
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
  const raw = await apiRequest<Record<string, unknown>>(
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
  await apiRequest<void>(
    `/api/shopping-lists/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

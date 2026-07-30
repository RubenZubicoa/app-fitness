import { normalizeId } from '@/types/program';

export type ShoppingListItem = {
  item: string;
  qty: string;
  done: boolean;
};

export type ShoppingList = {
  _id: string;
  clientId: string;
  list: ShoppingListItem[];
};

export function normalizeShoppingList(raw: Record<string, unknown>): ShoppingList {
  const listRaw = Array.isArray(raw.list) ? raw.list : [];
  const list: ShoppingListItem[] = listRaw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      item: String(item.item ?? ''),
      qty: String(item.qty ?? ''),
      done: Boolean(item.done),
    };
  });

  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    list,
  };
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createShoppingList as createShoppingListApi,
  deleteShoppingList as deleteShoppingListApi,
  fetchClientShoppingList,
  updateShoppingList as updateShoppingListApi,
} from '@/api/shopping-list';
import { useClient } from '@/context/client-context';
import type { ShoppingList, ShoppingListItem } from '@/types/shopping-list';

type ShoppingListContextValue = {
  shoppingList: ShoppingList | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshShoppingList: () => Promise<void>;
  toggleItemDone: (itemName: string) => Promise<void>;
  addItem: (item: string, qty: string) => Promise<void>;
  removeItem: (itemName: string) => Promise<void>;
  createEmptyList: () => Promise<void>;
  deleteList: () => Promise<void>;
};

const ShoppingListContext = createContext<ShoppingListContextValue | undefined>(undefined);

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshShoppingList = useCallback(async () => {
    if (!client?._id) {
      setShoppingList(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const list = await fetchClientShoppingList(client._id);
      setShoppingList(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la lista de la compra');
      setShoppingList(null);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshShoppingList();
  }, [refreshShoppingList]);

  const toggleItemDone = useCallback(
    async (itemName: string) => {
      if (!shoppingList) return;
      const nextList = shoppingList.list.map((entry) =>
        entry.item === itemName ? { ...entry, done: !entry.done } : entry,
      );
      setSaving(true);
      setError(null);
      try {
        const updated = await updateShoppingListApi(shoppingList._id, { list: nextList });
        setShoppingList(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar el artículo');
      } finally {
        setSaving(false);
      }
    },
    [shoppingList],
  );

  const addItem = useCallback(
    async (item: string, qty: string) => {
      if (!shoppingList) return;
      const trimmedItem = item.trim();
      const trimmedQty = qty.trim() || '1 ud';
      if (!trimmedItem) return;

      const nextList: ShoppingListItem[] = [
        ...shoppingList.list,
        { item: trimmedItem, qty: trimmedQty, done: false },
      ];
      setSaving(true);
      setError(null);
      try {
        const updated = await updateShoppingListApi(shoppingList._id, { list: nextList });
        setShoppingList(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo añadir el artículo');
      } finally {
        setSaving(false);
      }
    },
    [shoppingList],
  );

  const removeItem = useCallback(
    async (itemName: string) => {
      if (!shoppingList) return;
      const nextList = shoppingList.list.filter((entry) => entry.item !== itemName);
      setSaving(true);
      setError(null);
      try {
        const updated = await updateShoppingListApi(shoppingList._id, { list: nextList });
        setShoppingList(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo eliminar el artículo');
      } finally {
        setSaving(false);
      }
    },
    [shoppingList],
  );

  const createEmptyList = useCallback(async () => {
    if (!client?._id) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createShoppingListApi(client._id, []);
      setShoppingList(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la lista');
    } finally {
      setSaving(false);
    }
  }, [client?._id]);

  const deleteList = useCallback(async () => {
    if (!shoppingList) return;
    setSaving(true);
    setError(null);
    try {
      await deleteShoppingListApi(shoppingList._id);
      setShoppingList(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la lista');
    } finally {
      setSaving(false);
    }
  }, [shoppingList]);

  const value = useMemo<ShoppingListContextValue>(
    () => ({
      shoppingList,
      loading,
      saving,
      error,
      refreshShoppingList,
      toggleItemDone,
      addItem,
      removeItem,
      createEmptyList,
      deleteList,
    }),
    [
      shoppingList,
      loading,
      saving,
      error,
      refreshShoppingList,
      toggleItemDone,
      addItem,
      removeItem,
      createEmptyList,
      deleteList,
    ],
  );

  return (
    <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList debe usarse dentro de ShoppingListProvider');
  }
  return context;
}

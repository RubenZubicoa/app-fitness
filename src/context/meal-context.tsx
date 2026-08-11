import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientMeals } from '@/api/meals';
import { useClient } from '@/context/client-context';
import type { Meal } from '@/types/meal';

type MealContextValue = {
  meal: Meal | null;
  loading: boolean;
  error: string | null;
  refreshMeals: () => Promise<void>;
};

const MealContext = createContext<MealContextValue | undefined>(undefined);

export function MealProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMeals = useCallback(async () => {
    if (!client?._id) {
      setMeal(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientMeals(client._id);
      setMeal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las comidas');
      setMeal(null);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshMeals();
  }, [refreshMeals]);

  const value = useMemo<MealContextValue>(
    () => ({ meal, loading, error, refreshMeals }),
    [meal, loading, error, refreshMeals],
  );

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
}

export function useMeals() {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals debe usarse dentro de MealProvider');
  }
  return context;
}

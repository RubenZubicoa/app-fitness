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
  deleteWeightEntryAtIndex,
  fetchClientWeight,
  updateWeightEntryAtIndex,
} from '@/api/weights';
import { useClient } from '@/context/client-context';
import type { Weight } from '@/types/weight';

type WeightsContextValue = {
  weight: Weight | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshWeight: () => Promise<void>;
  updateWeightEntry: (index: number, value: number, date?: string) => Promise<void>;
  deleteWeightEntry: (index: number) => Promise<void>;
};

const WeightsContext = createContext<WeightsContextValue | undefined>(undefined);

export function WeightsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [weight, setWeight] = useState<Weight | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWeight = useCallback(async () => {
    if (!client?._id) {
      setWeight(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const series = await fetchClientWeight(client._id);
      setWeight(series);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el peso');
      setWeight(null);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshWeight();
  }, [refreshWeight]);

  const updateWeightEntry = useCallback(
    async (index: number, value: number, date?: string) => {
      if (!weight) throw new Error('No hay serie de peso');
      setSaving(true);
      setError(null);
      try {
        const updated = await updateWeightEntryAtIndex({
          existing: weight,
          index,
          value,
          date,
        });
        setWeight(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar el peso');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [weight],
  );

  const deleteWeightEntry = useCallback(
    async (index: number) => {
      if (!weight) throw new Error('No hay serie de peso');
      setSaving(true);
      setError(null);
      try {
        const updated = await deleteWeightEntryAtIndex({ existing: weight, index });
        setWeight(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo eliminar el peso');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [weight],
  );

  const value = useMemo<WeightsContextValue>(
    () => ({
      weight,
      loading,
      saving,
      error,
      refreshWeight,
      updateWeightEntry,
      deleteWeightEntry,
    }),
    [weight, loading, saving, error, refreshWeight, updateWeightEntry, deleteWeightEntry],
  );

  return <WeightsContext.Provider value={value}>{children}</WeightsContext.Provider>;
}

export function useWeights() {
  const context = useContext(WeightsContext);
  if (!context) {
    throw new Error('useWeights debe usarse dentro de WeightsProvider');
  }
  return context;
}

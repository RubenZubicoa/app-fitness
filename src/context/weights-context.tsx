import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientWeight } from '@/api/weights';
import { useClient } from '@/context/client-context';
import type { Weight } from '@/types/weight';

type WeightsContextValue = {
  weight: Weight | null;
  loading: boolean;
  error: string | null;
  refreshWeight: () => Promise<void>;
};

const WeightsContext = createContext<WeightsContextValue | undefined>(undefined);

export function WeightsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [weight, setWeight] = useState<Weight | null>(null);
  const [loading, setLoading] = useState(false);
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

  const value = useMemo<WeightsContextValue>(
    () => ({
      weight,
      loading,
      error,
      refreshWeight,
    }),
    [weight, loading, error, refreshWeight],
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

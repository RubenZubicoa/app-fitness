import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientSupplements } from '@/api/supplements';
import { useClient } from '@/context/client-context';
import type { Supplements } from '@/types/supplements';

type SupplementsContextValue = {
  supplements: Supplements | null;
  loading: boolean;
  error: string | null;
  refreshSupplements: () => Promise<void>;
};

const SupplementsContext = createContext<SupplementsContextValue | undefined>(undefined);

export function SupplementsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [supplements, setSupplements] = useState<Supplements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSupplements = useCallback(async () => {
    if (!client?._id) {
      setSupplements(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientSupplements(client._id);
      setSupplements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los suplementos');
      setSupplements(null);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshSupplements();
  }, [refreshSupplements]);

  const value = useMemo<SupplementsContextValue>(
    () => ({
      supplements,
      loading,
      error,
      refreshSupplements,
    }),
    [supplements, loading, error, refreshSupplements],
  );

  return <SupplementsContext.Provider value={value}>{children}</SupplementsContext.Provider>;
}

export function useSupplements() {
  const context = useContext(SupplementsContext);
  if (!context) {
    throw new Error('useSupplements debe usarse dentro de SupplementsProvider');
  }
  return context;
}

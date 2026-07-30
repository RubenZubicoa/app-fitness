import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientMacros } from '@/api/macros';
import { useClient } from '@/context/client-context';
import type { Macros } from '@/types/macros';

type MacrosContextValue = {
  macros: Macros | null;
  loading: boolean;
  error: string | null;
  refreshMacros: () => Promise<void>;
};

const MacrosContext = createContext<MacrosContextValue | undefined>(undefined);

export function MacrosProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [macros, setMacros] = useState<Macros | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMacros = useCallback(async () => {
    if (!client?._id) {
      setMacros(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientMacros(client._id);
      setMacros(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los macros');
      setMacros(null);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshMacros();
  }, [refreshMacros]);

  const value = useMemo<MacrosContextValue>(
    () => ({
      macros,
      loading,
      error,
      refreshMacros,
    }),
    [macros, loading, error, refreshMacros],
  );

  return <MacrosContext.Provider value={value}>{children}</MacrosContext.Provider>;
}

export function useMacros() {
  const context = useContext(MacrosContext);
  if (!context) {
    throw new Error('useMacros debe usarse dentro de MacrosProvider');
  }
  return context;
}

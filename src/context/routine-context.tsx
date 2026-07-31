import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientRoutineDays } from '@/api/routine-days';
import { useClient } from '@/context/client-context';
import type { RoutineDay } from '@/types/routine-day';

type RoutineContextValue = {
  routine: RoutineDay[];
  loading: boolean;
  error: string | null;
  refreshRoutine: () => Promise<void>;
};

const RoutineContext = createContext<RoutineContextValue | undefined>(undefined);

export function RoutineProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [routine, setRoutine] = useState<RoutineDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRoutine = useCallback(async () => {
    if (!client?._id) {
      setRoutine([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const days = await fetchClientRoutineDays(client._id);
      setRoutine(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la rutina');
      setRoutine([]);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshRoutine();
  }, [refreshRoutine]);

  const value = useMemo<RoutineContextValue>(
    () => ({
      routine,
      loading,
      error,
      refreshRoutine,
    }),
    [routine, loading, error, refreshRoutine],
  );

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine debe usarse dentro de RoutineProvider');
  }
  return context;
}

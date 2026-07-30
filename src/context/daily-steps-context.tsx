import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientDailySteps } from '@/api/daily-steps';
import { useClient } from '@/context/client-context';
import { pickCurrentDailySteps, type DailySteps } from '@/types/daily-steps';

type DailyStepsContextValue = {
  records: DailySteps[];
  /** Registro de la semana actual del cliente (o el más reciente). */
  current: DailySteps | null;
  loading: boolean;
  error: string | null;
  refreshDailySteps: () => Promise<void>;
};

const DailyStepsContext = createContext<DailyStepsContextValue | undefined>(undefined);

export function DailyStepsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [records, setRecords] = useState<DailySteps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDailySteps = useCallback(async () => {
    if (!client?._id) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const list = await fetchClientDailySteps(client._id);
      setRecords(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los pasos');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshDailySteps();
  }, [refreshDailySteps]);

  const current = useMemo(
    () => pickCurrentDailySteps(records, client?.week),
    [records, client?.week],
  );

  const value = useMemo<DailyStepsContextValue>(
    () => ({
      records,
      current,
      loading,
      error,
      refreshDailySteps,
    }),
    [records, current, loading, error, refreshDailySteps],
  );

  return <DailyStepsContext.Provider value={value}>{children}</DailyStepsContext.Provider>;
}

export function useDailySteps() {
  const context = useContext(DailyStepsContext);
  if (!context) {
    throw new Error('useDailySteps debe usarse dentro de DailyStepsProvider');
  }
  return context;
}

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
  fetchClientDailySteps,
  updateDailySteps as updateDailyStepsApi,
} from '@/api/daily-steps';
import { useClient } from '@/context/client-context';
import {
  getTodayWeekdayIndex,
  pickCurrentDailySteps,
  type DailySteps,
  type DaySteps,
} from '@/types/daily-steps';

type DailyStepsContextValue = {
  records: DailySteps[];
  /** Registro de la semana actual del cliente (o el más reciente). */
  current: DailySteps | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshDailySteps: () => Promise<void>;
  /** Guarda los pasos de un día concreto (índice L–D) en un registro semanal. */
  saveDaySteps: (
    recordId: string,
    dayIndex: number,
    steps: number,
    shareInCommunity?: boolean,
  ) => Promise<void>;
  /** Guarda los pasos del día actual (índice L–D) en la BD. */
  saveTodaySteps: (steps: number, shareInCommunity?: boolean) => Promise<void>;
};

const DailyStepsContext = createContext<DailyStepsContextValue | undefined>(undefined);

export function DailyStepsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [records, setRecords] = useState<DailySteps[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const saveDaySteps = useCallback(
    async (recordId: string, dayIndex: number, steps: number, shareInCommunity = false) => {
      const record = records.find((item) => item._id === recordId);
      if (!record) {
        throw new Error('No se encontró el registro de pasos');
      }
      if (!Number.isFinite(steps) || steps < 0) {
        throw new Error('Introduce un número de pasos válido');
      }
      if (dayIndex < 0 || dayIndex >= record.days.length) {
        throw new Error('Día de la semana no válido');
      }

      const nextDays: DaySteps[] = record.days.map((day, index) =>
        index === dayIndex ? { ...day, value: Math.round(steps) } : day,
      );

      setSaving(true);
      setError(null);
      try {
        const updated = await updateDailyStepsApi(record._id, {
          days: nextDays,
          shareInCommunity,
        });
        setRecords((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron guardar los pasos');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [records],
  );

  const saveTodaySteps = useCallback(
    async (steps: number, shareInCommunity = false) => {
      if (!current) {
        throw new Error('No hay registro de pasos para esta semana');
      }
      await saveDaySteps(current._id, getTodayWeekdayIndex(), steps, shareInCommunity);
    },
    [current, saveDaySteps],
  );

  const value = useMemo<DailyStepsContextValue>(
    () => ({
      records,
      current,
      loading,
      saving,
      error,
      refreshDailySteps,
      saveDaySteps,
      saveTodaySteps,
    }),
    [records, current, loading, saving, error, refreshDailySteps, saveDaySteps, saveTodaySteps],
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

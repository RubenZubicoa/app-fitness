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
  createDailySteps as createDailyStepsApi,
  fetchClientDailySteps,
  updateDailySteps as updateDailyStepsApi,
} from '@/api/daily-steps';
import { useClient } from '@/context/client-context';
import {
  getWeekDailySteps,
  pickDailyStepsForDate,
  resolveStepsGoal,
  toISODate,
  type DailySteps,
} from '@/types/daily-steps';

type DailyStepsContextValue = {
  records: DailySteps[];
  /** Registro de hoy (si existe). */
  current: DailySteps | null;
  /** Registros de la semana calendario actual (L–D). */
  weekRecords: DailySteps[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshDailySteps: () => Promise<void>;
  /** Crea o actualiza los pasos de una fecha concreta. */
  saveStepsForDate: (
    date: string,
    steps: number,
    shareInCommunity?: boolean,
  ) => Promise<DailySteps>;
  /** Guarda los pasos de hoy. */
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
    () => pickDailyStepsForDate(records, toISODate()),
    [records],
  );

  const weekRecords = useMemo(() => getWeekDailySteps(records), [records]);

  const upsertRecord = useCallback((updated: DailySteps) => {
    setRecords((prev) => {
      const idx = prev.findIndex((item) => item._id === updated._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      const byDate = prev.findIndex((item) => item.date === updated.date);
      if (byDate >= 0) {
        const next = [...prev];
        next[byDate] = updated;
        return next;
      }
      return [...prev, updated];
    });
  }, []);

  const saveStepsForDate = useCallback(
    async (date: string, steps: number, shareInCommunity = false) => {
      if (!client?._id) {
        throw new Error('No hay cliente autenticado');
      }
      if (!Number.isFinite(steps) || steps < 0) {
        throw new Error('Introduce un número de pasos válido');
      }

      const isoDate = date.slice(0, 10);
      const existing = pickDailyStepsForDate(records, isoDate);
      const goal = resolveStepsGoal(existing, records);

      setSaving(true);
      setError(null);
      try {
        const updated = existing
          ? await updateDailyStepsApi(existing._id, {
              steps: Math.round(steps),
              goal,
              shareInCommunity,
            })
          : await createDailyStepsApi({
              clientId: client._id,
              date: isoDate,
              steps: Math.round(steps),
              goal,
              shareInCommunity,
            });
        upsertRecord(updated);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron guardar los pasos');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [client?._id, records, upsertRecord],
  );

  const saveTodaySteps = useCallback(
    async (steps: number, shareInCommunity = false) => {
      await saveStepsForDate(toISODate(), steps, shareInCommunity);
    },
    [saveStepsForDate],
  );

  const value = useMemo<DailyStepsContextValue>(
    () => ({
      records,
      current,
      weekRecords,
      loading,
      saving,
      error,
      refreshDailySteps,
      saveStepsForDate,
      saveTodaySteps,
    }),
    [
      records,
      current,
      weekRecords,
      loading,
      saving,
      error,
      refreshDailySteps,
      saveStepsForDate,
      saveTodaySteps,
    ],
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

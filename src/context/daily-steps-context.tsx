import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';

import {
  createDailySteps as createDailyStepsApi,
  fetchClientDailySteps,
  updateDailySteps as updateDailyStepsApi,
} from '@/api/daily-steps';
import { useClient } from '@/context/client-context';
import {
  beginAndroidSession,
  ensurePedometerReady,
  startBackgroundStepTracking,
  subscribeStepUpdates,
  type PedometerStatus,
} from '@/services/pedometer';
import {
  registerDailyStepsBackgroundTask,
  syncPedometerToApi,
} from '@/services/sync-daily-steps';
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
  /** Pasos de hoy según el sensor (pueden ir por delante del API). */
  liveSteps: number | null;
  pedometerStatus: PedometerStatus;
  /** Registros de la semana calendario actual (L–D). */
  weekRecords: DailySteps[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshDailySteps: () => Promise<void>;
  requestPedometerAccess: () => Promise<void>;
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
  const [liveSteps, setLiveSteps] = useState<number | null>(null);
  const [pedometerStatus, setPedometerStatus] = useState<PedometerStatus>('idle');
  const [accessKey, setAccessKey] = useState(0);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshDailySteps = useCallback(async (options?: { silent?: boolean }) => {
    if (!client?._id) {
      setRecords([]);
      setLoading(false);
      return;
    }

    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const list = await fetchClientDailySteps(client._id);
      setRecords(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los pasos');
      if (!options?.silent) setRecords([]);
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
    async (date: string, steps: number, shareInCommunity?: boolean) => {
      if (!client?._id) {
        throw new Error('No hay cliente autenticado');
      }
      if (!Number.isFinite(steps) || steps < 0) {
        throw new Error('Introduce un número de pasos válido');
      }

      const isoDate = date.slice(0, 10);
      const existing = pickDailyStepsForDate(records, isoDate);
      const goal = resolveStepsGoal(existing, records);
      // Nunca bajar el valor ya registrado (p. ej. re-sync del sensor).
      const nextSteps = Math.max(existing?.steps ?? 0, Math.round(steps));

      setSaving(true);
      setError(null);
      try {
        const payload = {
          steps: nextSteps,
          goal,
          ...(shareInCommunity != null ? { shareInCommunity } : {}),
        };
        const updated = existing
          ? await updateDailyStepsApi(existing._id, payload)
          : await createDailyStepsApi({
              clientId: client._id,
              date: isoDate,
              ...payload,
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
    async (steps: number, shareInCommunity?: boolean) => {
      await saveStepsForDate(toISODate(), steps, shareInCommunity);
    },
    [saveStepsForDate],
  );

  const requestPedometerAccess = useCallback(async () => {
    const status = await ensurePedometerReady();
    setPedometerStatus(status);
    setAccessKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!client?._id || Platform.OS === 'web') {
      setPedometerStatus(Platform.OS === 'web' ? 'unavailable' : 'idle');
      setLiveSteps(null);
      return;
    }

    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    const flushSync = async () => {
      const result = await syncPedometerToApi();
      if (cancelled) return;
      setPedometerStatus(result.status);
      if (result.todaySteps != null) setLiveSteps(result.todaySteps);
      await refreshDailySteps({ silent: true });
    };

    const queueSync = () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        void flushSync();
      }, 20000);
    };

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void flushSync();
        return;
      }
      if (state === 'background' || state === 'inactive') {
        if (syncTimer.current) {
          clearTimeout(syncTimer.current);
          syncTimer.current = null;
        }
        void flushSync();
      }
    });

    const start = async () => {
      const status = await ensurePedometerReady();
      if (cancelled) return;
      setPedometerStatus(status);
      if (status !== 'tracking') return;

      // Semilla Android con lo ya guardado en API/local para no reiniciar a 0.
      let apiToday = 0;
      try {
        const list = await fetchClientDailySteps(client._id);
        if (cancelled) return;
        setRecords(list);
        apiToday = pickDailyStepsForDate(list, toISODate())?.steps ?? 0;
      } catch {
        apiToday = 0;
      }

      const seeded = await beginAndroidSession(apiToday);
      if (cancelled) return;
      setLiveSteps(seeded);

      // Android: servicio nativo que sigue contando con la app cerrada.
      await startBackgroundStepTracking();
      // iOS/Android: sync periódico al API aunque la UI no esté abierta.
      await registerDailyStepsBackgroundTask();
      await flushSync();
      if (cancelled) return;

      subscription = subscribeStepUpdates((steps) => {
        if (cancelled) return;
        setLiveSteps(steps);
        queueSync();
      });
    };

    void start();

    return () => {
      cancelled = true;
      subscription?.remove();
      appStateSub.remove();
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
    };
  }, [accessKey, client?._id, refreshDailySteps]);

  const value = useMemo<DailyStepsContextValue>(
    () => ({
      records,
      current,
      liveSteps,
      pedometerStatus,
      weekRecords,
      loading,
      saving,
      error,
      refreshDailySteps,
      requestPedometerAccess,
      saveStepsForDate,
      saveTodaySteps,
    }),
    [
      records,
      current,
      liveSteps,
      pedometerStatus,
      weekRecords,
      loading,
      saving,
      error,
      refreshDailySteps,
      requestPedometerAccess,
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

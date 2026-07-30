import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchClientWellness, fetchWellnessMasters } from '@/api/wellness';
import { useClient } from '@/context/client-context';
import {
  enrichWellness,
  latestWellnessByType,
  type EnrichedWellness,
  type Wellness,
  type WellnessMaster,
} from '@/types/wellness';

type WellnessContextValue = {
  masters: WellnessMaster[];
  wellness: Wellness[];
  /** Último registro por tipo, enriquecido con la maestra. */
  enriched: EnrichedWellness[];
  loading: boolean;
  error: string | null;
  getMasterById: (id: string) => WellnessMaster | undefined;
  getMasterByKey: (key: string) => WellnessMaster | undefined;
  refreshWellness: () => Promise<void>;
};

const WellnessContext = createContext<WellnessContextValue | undefined>(undefined);

export function WellnessProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [masters, setMasters] = useState<WellnessMaster[]>([]);
  const [wellness, setWellness] = useState<Wellness[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWellness = useCallback(async () => {
    if (!client?._id) {
      setMasters([]);
      setWellness([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [masterList, wellnessList] = await Promise.all([
        fetchWellnessMasters(),
        fetchClientWellness(client._id),
      ]);
      setMasters(masterList);
      setWellness(wellnessList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las sensaciones');
      setMasters([]);
      setWellness([]);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshWellness();
  }, [refreshWellness]);

  const getMasterById = useCallback(
    (id: string) => masters.find((m) => m._id === id),
    [masters],
  );

  const getMasterByKey = useCallback(
    (key: string) => masters.find((m) => m.key === key),
    [masters],
  );

  const enriched = useMemo(
    () => latestWellnessByType(wellness).map((record) => enrichWellness(record, masters)),
    [wellness, masters],
  );

  const value = useMemo<WellnessContextValue>(
    () => ({
      masters,
      wellness,
      enriched,
      loading,
      error,
      getMasterById,
      getMasterByKey,
      refreshWellness,
    }),
    [masters, wellness, enriched, loading, error, getMasterById, getMasterByKey, refreshWellness],
  );

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness debe usarse dentro de WellnessProvider');
  }
  return context;
}

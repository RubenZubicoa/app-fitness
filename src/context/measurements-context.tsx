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
  deleteMeasurement as deleteMeasurementApi,
  fetchClientMeasurements,
  fetchMeasurementMasters,
  updateMeasurement as updateMeasurementApi,
  type UpdateMeasurementPayload,
} from '@/api/measurements';
import { useClient } from '@/context/client-context';
import {
  buildMeasurementSeries,
  enrichMeasurement,
  latestMeasurementsByType,
  type EnrichedMeasurement,
  type Measurement,
  type MeasurementMaster,
  type MeasurementSeriesPoint,
} from '@/types/measurement';

type MeasurementsContextValue = {
  masters: MeasurementMaster[];
  measurements: Measurement[];
  /** Última medida por tipo, enriquecida con la maestra. */
  enrichedLatest: EnrichedMeasurement[];
  seriesByMasterId: Record<string, MeasurementSeriesPoint[]>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  getMasterById: (id: string) => MeasurementMaster | undefined;
  getMasterByKey: (key: string) => MeasurementMaster | undefined;
  refreshMeasurements: () => Promise<void>;
  updateMeasurement: (id: string, payload: UpdateMeasurementPayload) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
};

const MeasurementsContext = createContext<MeasurementsContextValue | undefined>(undefined);

export function MeasurementsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [masters, setMasters] = useState<MeasurementMaster[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMeasurements = useCallback(async () => {
    if (!client?._id) {
      setMasters([]);
      setMeasurements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [masterList, measurementList] = await Promise.all([
        fetchMeasurementMasters(),
        fetchClientMeasurements(client._id),
      ]);
      setMasters(masterList);
      setMeasurements(measurementList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las medidas');
      setMasters([]);
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshMeasurements();
  }, [refreshMeasurements]);

  const getMasterById = useCallback(
    (id: string) => masters.find((m) => m._id === id),
    [masters],
  );

  const getMasterByKey = useCallback(
    (key: string) => masters.find((m) => m.key === key),
    [masters],
  );

  const enrichedLatest = useMemo(
    () => latestMeasurementsByType(measurements).map((m) => enrichMeasurement(m, masters)),
    [measurements, masters],
  );

  const seriesByMasterId = useMemo(() => buildMeasurementSeries(measurements), [measurements]);

  const updateMeasurement = useCallback(async (id: string, payload: UpdateMeasurementPayload) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMeasurementApi(id, payload);
      setMeasurements((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la medida');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteMeasurement = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteMeasurementApi(id);
      setMeasurements((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la medida');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo<MeasurementsContextValue>(
    () => ({
      masters,
      measurements,
      enrichedLatest,
      seriesByMasterId,
      loading,
      saving,
      error,
      getMasterById,
      getMasterByKey,
      refreshMeasurements,
      updateMeasurement,
      deleteMeasurement,
    }),
    [
      masters,
      measurements,
      enrichedLatest,
      seriesByMasterId,
      loading,
      saving,
      error,
      getMasterById,
      getMasterByKey,
      refreshMeasurements,
      updateMeasurement,
      deleteMeasurement,
    ],
  );

  return (
    <MeasurementsContext.Provider value={value}>{children}</MeasurementsContext.Provider>
  );
}

export function useMeasurements() {
  const context = useContext(MeasurementsContext);
  if (!context) {
    throw new Error('useMeasurements debe usarse dentro de MeasurementsProvider');
  }
  return context;
}

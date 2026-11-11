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
  createTechnicalSpecifications,
  fetchClientTechnicalSpecifications,
  updateTechnicalSpecifications,
} from '@/api/technical-specifications';
import { useClient } from '@/context/client-context';
import {
  emptyDailyRecall,
  emptyEatingHabits,
  emptyExerciseHabits,
  emptyLifestyle,
  emptyPersonalHistory,
  type DailyRecall,
  type EatingHabits,
  type ExerciseHabits,
  type Lifestyle,
  type PersonalHistory,
  type TechnicalSectionKey,
  type TechnicalSpecifications,
} from '@/types/technical-specifications';

type TechnicalSpecificationsContextValue = {
  specs: TechnicalSpecifications | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshSpecs: () => Promise<void>;
  savePersonalHistory: (value: PersonalHistory) => Promise<void>;
  saveEatingHabits: (value: EatingHabits) => Promise<void>;
  saveLifestyle: (value: Lifestyle) => Promise<void>;
  saveExerciseHabits: (value: ExerciseHabits) => Promise<void>;
  saveDailyRecall: (value: DailyRecall) => Promise<void>;
  saveObservations: (value: string) => Promise<void>;
};

const TechnicalSpecificationsContext = createContext<
  TechnicalSpecificationsContextValue | undefined
>(undefined);

async function upsertSection(
  clientId: string,
  existing: TechnicalSpecifications | null,
  patch: Partial<
    Pick<
      TechnicalSpecifications,
      | 'personalHistory'
      | 'eatingHabits'
      | 'lifestyle'
      | 'exerciseHabits'
      | 'dailyRecall'
      | 'observations'
    >
  >,
): Promise<TechnicalSpecifications> {
  if (existing?._id) {
    return updateTechnicalSpecifications(existing._id, patch);
  }

  return createTechnicalSpecifications({
    clientId,
    personalHistory: patch.personalHistory ?? emptyPersonalHistory(),
    eatingHabits: patch.eatingHabits ?? emptyEatingHabits(),
    lifestyle: patch.lifestyle ?? emptyLifestyle(),
    exerciseHabits: patch.exerciseHabits ?? emptyExerciseHabits(),
    dailyRecall: patch.dailyRecall ?? emptyDailyRecall(),
    observations: patch.observations ?? '',
  });
}

export function TechnicalSpecificationsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [specs, setSpecs] = useState<TechnicalSpecifications | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSpecs = useCallback(async () => {
    if (!client?._id) {
      setSpecs(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientTechnicalSpecifications(client._id);
      setSpecs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la ficha técnica',
      );
      setSpecs(null);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshSpecs();
  }, [refreshSpecs]);

  const saveSection = useCallback(
    async (
      patch: Parameters<typeof upsertSection>[2],
    ) => {
      if (!client?._id) throw new Error('Cliente no disponible');
      setSaving(true);
      setError(null);
      try {
        const next = await upsertSection(client._id, specs, patch);
        setSpecs(next);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo guardar la ficha técnica';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [client?._id, specs],
  );

  const value = useMemo<TechnicalSpecificationsContextValue>(
    () => ({
      specs,
      loading,
      saving,
      error,
      refreshSpecs,
      savePersonalHistory: (personalHistory) => saveSection({ personalHistory }),
      saveEatingHabits: (eatingHabits) => saveSection({ eatingHabits }),
      saveLifestyle: (lifestyle) => saveSection({ lifestyle }),
      saveExerciseHabits: (exerciseHabits) => saveSection({ exerciseHabits }),
      saveDailyRecall: (dailyRecall) => saveSection({ dailyRecall }),
      saveObservations: (observations) => saveSection({ observations }),
    }),
    [specs, loading, saving, error, refreshSpecs, saveSection],
  );

  return (
    <TechnicalSpecificationsContext.Provider value={value}>
      {children}
    </TechnicalSpecificationsContext.Provider>
  );
}

export function useTechnicalSpecifications() {
  const context = useContext(TechnicalSpecificationsContext);
  if (!context) {
    throw new Error(
      'useTechnicalSpecifications debe usarse dentro de TechnicalSpecificationsProvider',
    );
  }
  return context;
}

/** Helpers tipados para lecturas iniciales de formulario. */
export function getSectionDraft(
  specs: TechnicalSpecifications | null,
  section: TechnicalSectionKey,
) {
  switch (section) {
    case 'personalHistory':
      return specs?.personalHistory ?? emptyPersonalHistory();
    case 'eatingHabits':
      return specs?.eatingHabits ?? emptyEatingHabits();
    case 'lifestyle':
      return specs?.lifestyle ?? emptyLifestyle();
    case 'exerciseHabits':
      return specs?.exerciseHabits ?? emptyExerciseHabits();
    case 'dailyRecall':
      return specs?.dailyRecall ?? emptyDailyRecall();
    case 'observations':
      return specs?.observations ?? '';
    default:
      return null;
  }
}

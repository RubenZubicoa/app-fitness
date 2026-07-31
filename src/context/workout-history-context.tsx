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
  deleteWorkoutHistory as deleteWorkoutHistoryApi,
  fetchClientWorkoutHistory,
  updateWorkoutHistory as updateWorkoutHistoryApi,
} from '@/api/workout-history';
import { useClient } from '@/context/client-context';
import type { WorkoutHistoryEntry } from '@/types/workout-history';

type WorkoutHistoryContextValue = {
  workoutHistory: WorkoutHistoryEntry[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshWorkoutHistory: () => Promise<void>;
  getById: (id: string) => WorkoutHistoryEntry | undefined;
  removeExercise: (workoutId: string, exerciseName: string) => Promise<boolean>;
  deleteWorkout: (workoutId: string) => Promise<void>;
};

const WorkoutHistoryContext = createContext<WorkoutHistoryContextValue | undefined>(undefined);

export function WorkoutHistoryProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkoutHistory = useCallback(async () => {
    if (!client?._id) {
      setWorkoutHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const list = await fetchClientWorkoutHistory(client._id);
      setWorkoutHistory(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el histórico');
      setWorkoutHistory([]);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshWorkoutHistory();
  }, [refreshWorkoutHistory]);

  const getById = useCallback(
    (id: string) => workoutHistory.find((entry) => entry._id === id),
    [workoutHistory],
  );

  const deleteWorkout = useCallback(async (workoutId: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteWorkoutHistoryApi(workoutId);
      setWorkoutHistory((prev) => prev.filter((entry) => entry._id !== workoutId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el entrenamiento');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Elimina un ejercicio de la sesión.
   * Si era el último, elimina el entrenamiento completo.
   * @returns `true` si se eliminó toda la sesión.
   */
  const removeExercise = useCallback(
    async (workoutId: string, exerciseName: string) => {
      const current = workoutHistory.find((entry) => entry._id === workoutId);
      if (!current) {
        throw new Error('Sesión no encontrada');
      }

      const nextExercises = current.exercises.filter((ex) => ex.name !== exerciseName);
      if (nextExercises.length === current.exercises.length) {
        throw new Error('Ejercicio no encontrado');
      }

      if (nextExercises.length === 0) {
        await deleteWorkout(workoutId);
        return true;
      }

      setSaving(true);
      setError(null);
      try {
        const updated = await updateWorkoutHistoryApi(workoutId, { exercises: nextExercises });
        setWorkoutHistory((prev) =>
          prev.map((entry) => (entry._id === workoutId ? updated : entry)),
        );
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo eliminar el ejercicio');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [workoutHistory, deleteWorkout],
  );

  const value = useMemo<WorkoutHistoryContextValue>(
    () => ({
      workoutHistory,
      loading,
      saving,
      error,
      refreshWorkoutHistory,
      getById,
      removeExercise,
      deleteWorkout,
    }),
    [
      workoutHistory,
      loading,
      saving,
      error,
      refreshWorkoutHistory,
      getById,
      removeExercise,
      deleteWorkout,
    ],
  );

  return (
    <WorkoutHistoryContext.Provider value={value}>{children}</WorkoutHistoryContext.Provider>
  );
}

export function useWorkoutHistory() {
  const context = useContext(WorkoutHistoryContext);
  if (!context) {
    throw new Error('useWorkoutHistory debe usarse dentro de WorkoutHistoryProvider');
  }
  return context;
}

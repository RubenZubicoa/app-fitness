import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchPrograms } from '@/api/programs';
import { useClient } from '@/context/client-context';
import type { Program } from '@/types/program';

type ProgramsContextValue = {
  programs: Program[];
  loading: boolean;
  error: string | null;
  /** Programa del cliente autenticado (resuelto por `client.program`). */
  clientProgram: Program | null;
  getProgramById: (id: string) => Program | undefined;
  refreshPrograms: () => Promise<void>;
};

const ProgramsContext = createContext<ProgramsContextValue | undefined>(undefined);

export function ProgramsProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPrograms();
      setPrograms(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los programas');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPrograms();
  }, [refreshPrograms]);

  const getProgramById = useCallback(
    (id: string) => programs.find((p) => p._id === id),
    [programs],
  );

  const clientProgram = useMemo(() => {
    if (!client?.program) return null;
    return getProgramById(client.program) ?? null;
  }, [client?.program, getProgramById]);

  const value = useMemo<ProgramsContextValue>(
    () => ({
      programs,
      loading,
      error,
      clientProgram,
      getProgramById,
      refreshPrograms,
    }),
    [programs, loading, error, clientProgram, getProgramById, refreshPrograms],
  );

  return <ProgramsContext.Provider value={value}>{children}</ProgramsContext.Provider>;
}

export function usePrograms() {
  const context = useContext(ProgramsContext);
  if (!context) {
    throw new Error('usePrograms debe usarse dentro de ProgramsProvider');
  }
  return context;
}

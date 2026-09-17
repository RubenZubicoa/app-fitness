import { apiRequest } from '@/api/http';
import { normalizeProgram, type Program } from '@/types/program';

/** Lista todos los programas desde la base de datos. */
export async function fetchPrograms(): Promise<Program[]> {
  const raw = await apiRequest<unknown[]>('/api/programs');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeProgram(item as Record<string, unknown>));
}

/** Obtiene un programa por su id. */
export async function fetchProgramById(id: string): Promise<Program> {
  const raw = await apiRequest<Record<string, unknown>>(`/api/programs/${id}`);
  return normalizeProgram(raw);
}

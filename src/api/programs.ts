import { API_URL } from '@/constants/api';
import { normalizeProgram, type Program } from '@/types/program';

type ApiErrorBody = { message?: string };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

/** Lista todos los programas desde la base de datos. */
export async function fetchPrograms(): Promise<Program[]> {
  const raw = await request<unknown[]>('/api/programs');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeProgram(item as Record<string, unknown>));
}

/** Obtiene un programa por su id. */
export async function fetchProgramById(id: string): Promise<Program> {
  const raw = await request<Record<string, unknown>>(`/api/programs/${id}`);
  return normalizeProgram(raw);
}

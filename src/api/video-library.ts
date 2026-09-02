import { API_URL } from '@/constants/api';
import { normalizeVideoLibrary, type VideoLibraryCategory } from '@/types/video-library';

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

/** Videoteca formativa: GET /api/video-library?phase=... */
export async function fetchVideoLibrary(phase: number): Promise<VideoLibraryCategory[]> {
  const params = new URLSearchParams();
  params.set('phase', String(phase));

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/video-library?${params.toString()}`, {
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

  return normalizeVideoLibrary(data);
}

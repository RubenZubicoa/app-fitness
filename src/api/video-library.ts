import { apiRequest } from '@/api/http';
import { normalizeVideoLibrary, type VideoLibraryCategory } from '@/types/video-library';

/** Videoteca formativa: GET /api/video-library?phase=... */
export async function fetchVideoLibrary(phase: number): Promise<VideoLibraryCategory[]> {
  const params = new URLSearchParams();
  params.set('phase', String(phase));

  const data = await apiRequest<unknown>(`/api/video-library?${params.toString()}`);
  return normalizeVideoLibrary(data);
}

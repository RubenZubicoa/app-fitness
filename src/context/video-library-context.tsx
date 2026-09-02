import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchVideoLibrary } from '@/api/video-library';
import { useClient } from '@/context/client-context';
import type { VideoLibraryCategory } from '@/types/video-library';

type VideoLibraryContextValue = {
  videoLibrary: VideoLibraryCategory[];
  loading: boolean;
  error: string | null;
  refreshVideoLibrary: () => Promise<void>;
};

const VideoLibraryContext = createContext<VideoLibraryContextValue | undefined>(undefined);

export function VideoLibraryProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [videoLibrary, setVideoLibrary] = useState<VideoLibraryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshVideoLibrary = useCallback(async () => {
    if (!client?.phase) {
      setVideoLibrary([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchVideoLibrary(client.phase);
      setVideoLibrary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la videoteca');
      setVideoLibrary([]);
    } finally {
      setLoading(false);
    }
  }, [client?.phase]);

  useEffect(() => {
    void refreshVideoLibrary();
  }, [refreshVideoLibrary]);

  const value = useMemo<VideoLibraryContextValue>(
    () => ({
      videoLibrary,
      loading,
      error,
      refreshVideoLibrary,
    }),
    [videoLibrary, loading, error, refreshVideoLibrary],
  );

  return <VideoLibraryContext.Provider value={value}>{children}</VideoLibraryContext.Provider>;
}

export function useVideoLibrary() {
  const context = useContext(VideoLibraryContext);
  if (!context) {
    throw new Error('useVideoLibrary debe usarse dentro de VideoLibraryProvider');
  }
  return context;
}

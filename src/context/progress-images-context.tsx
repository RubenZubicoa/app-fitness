import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchProgressImages } from '@/api/progress-images';
import { useClient } from '@/context/client-context';
import type { ProgressImage } from '@/types/progress-image';

type ProgressImagesContextValue = {
  images: ProgressImage[];
  loading: boolean;
  error: string | null;
  refreshProgressImages: () => Promise<void>;
};

const ProgressImagesContext = createContext<ProgressImagesContextValue | undefined>(undefined);

export function ProgressImagesProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [images, setImages] = useState<ProgressImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProgressImages = useCallback(async () => {
    if (!client?._id) {
      setImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await fetchProgressImages(client._id);
      setImages(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las fotos');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [client?._id]);

  useEffect(() => {
    void refreshProgressImages();
  }, [refreshProgressImages]);

  const value = useMemo<ProgressImagesContextValue>(
    () => ({
      images,
      loading,
      error,
      refreshProgressImages,
    }),
    [images, loading, error, refreshProgressImages],
  );

  return (
    <ProgressImagesContext.Provider value={value}>{children}</ProgressImagesContext.Provider>
  );
}

export function useProgressImages() {
  const context = useContext(ProgressImagesContext);
  if (!context) {
    throw new Error('useProgressImages debe usarse dentro de ProgressImagesProvider');
  }
  return context;
}

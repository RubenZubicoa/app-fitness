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
  deleteProgressImage as deleteProgressImageApi,
  fetchProgressImages,
  replaceProgressImage as replaceProgressImageApi,
} from '@/api/progress-images';
import { useClient } from '@/context/client-context';
import type { ProgressImage } from '@/types/progress-image';

type ProgressImagesContextValue = {
  images: ProgressImage[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshProgressImages: () => Promise<void>;
  deleteProgressImage: (id: string) => Promise<void>;
  replaceProgressImage: (id: string, imageUri: string) => Promise<void>;
};

const ProgressImagesContext = createContext<ProgressImagesContextValue | undefined>(undefined);

export function ProgressImagesProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [images, setImages] = useState<ProgressImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const deleteProgressImage = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteProgressImageApi(id);
      setImages((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la foto');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const replaceProgressImage = useCallback(
    async (id: string, imageUri: string) => {
      if (!client?._id) throw new Error('Cliente no disponible');
      setSaving(true);
      setError(null);
      try {
        await replaceProgressImageApi(id, client._id, imageUri, `progress-${Date.now()}.jpg`);
        const next = await fetchProgressImages(client._id);
        setImages(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo reemplazar la foto');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [client?._id],
  );

  const value = useMemo<ProgressImagesContextValue>(
    () => ({
      images,
      loading,
      saving,
      error,
      refreshProgressImages,
      deleteProgressImage,
      replaceProgressImage,
    }),
    [
      images,
      loading,
      saving,
      error,
      refreshProgressImages,
      deleteProgressImage,
      replaceProgressImage,
    ],
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

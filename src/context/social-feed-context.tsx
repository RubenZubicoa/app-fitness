import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchSocialFeed } from '@/api/social-feed';
import type { SocialFeedEntry } from '@/types/social-feed';

type SocialFeedContextValue = {
  feed: SocialFeedEntry[];
  loading: boolean;
  error: string | null;
  refreshFeed: () => Promise<void>;
};

const SocialFeedContext = createContext<SocialFeedContextValue | undefined>(undefined);

export function SocialFeedProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<SocialFeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await fetchSocialFeed({ limit: 100 });
      setFeed(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la comunidad');
      setFeed([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFeed();
  }, [refreshFeed]);

  const value = useMemo(
    () => ({ feed, loading, error, refreshFeed }),
    [feed, loading, error, refreshFeed],
  );

  return <SocialFeedContext.Provider value={value}>{children}</SocialFeedContext.Provider>;
}

export function useSocialFeed() {
  const context = useContext(SocialFeedContext);
  if (!context) {
    throw new Error('useSocialFeed debe usarse dentro de SocialFeedProvider');
  }
  return context;
}

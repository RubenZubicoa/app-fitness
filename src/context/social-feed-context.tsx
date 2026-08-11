import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { socialFeed as mockSocialFeed } from '@/data/mock';
import { useClient } from '@/context/client-context';
import {
  authorFromClient,
  createWorkoutFeedEntry,
  type SocialFeedEntry,
} from '@/types/social-feed';
import type { WorkoutHistoryEntry } from '@/types/workout-history';

type SocialFeedContextValue = {
  feed: SocialFeedEntry[];
  publishWorkout: (workout: WorkoutHistoryEntry) => void;
};

const SocialFeedContext = createContext<SocialFeedContextValue | undefined>(undefined);

export function SocialFeedProvider({ children }: { children: ReactNode }) {
  const { client } = useClient();
  const [localFeed, setLocalFeed] = useState<SocialFeedEntry[]>([]);

  const publishWorkout = useCallback(
    (workout: WorkoutHistoryEntry) => {
      if (!client) return;

      const entry = createWorkoutFeedEntry({
        _id: `sf-local-${workout._id}`,
        author: authorFromClient(client),
        workout,
      });

      setLocalFeed((prev) => {
        if (prev.some((item) => item.kind === 'workout' && item.workoutHistoryId === workout._id)) {
          return prev;
        }
        return [entry, ...prev];
      });
    },
    [client],
  );

  const feed = useMemo(() => [...localFeed, ...mockSocialFeed], [localFeed]);

  const value = useMemo(
    () => ({ feed, publishWorkout }),
    [feed, publishWorkout],
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

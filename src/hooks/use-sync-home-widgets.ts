import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useClient } from '@/context/client-context';
import { useDailySteps } from '@/context/daily-steps-context';
import { useRoutine } from '@/context/routine-context';
import { useWorkoutHistory } from '@/context/workout-history-context';
import { syncHomeWidgets } from '@/services/sync-home-widgets';

/** Mantiene el widget iOS al día con pasos, plan y entrenos. */
export function useSyncHomeWidgets() {
  const { client } = useClient();
  const { records, liveSteps } = useDailySteps();
  const { routine } = useRoutine();
  const { workoutHistory } = useWorkoutHistory();

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    syncHomeWidgets({
      client,
      records,
      liveSteps,
      workoutHistory,
      workoutsPlanned: routine.length,
    });
  }, [client, records, liveSteps, workoutHistory, routine.length]);
}

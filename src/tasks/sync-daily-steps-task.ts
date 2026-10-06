import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import {
  SYNC_DAILY_STEPS_TASK,
  syncPedometerToApi,
} from '@/services/sync-daily-steps';

if (!TaskManager.isTaskDefined(SYNC_DAILY_STEPS_TASK)) {
  TaskManager.defineTask(SYNC_DAILY_STEPS_TASK, async () => {
    try {
      await syncPedometerToApi();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

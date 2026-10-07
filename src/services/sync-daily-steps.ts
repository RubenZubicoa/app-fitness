import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import {
  createDailySteps as createDailyStepsApi,
  fetchClientDailySteps,
  updateDailySteps as updateDailyStepsApi,
} from '@/api/daily-steps';
import { getAuthToken, setAuthToken } from '@/api/http';
import {
  isSessionWithinTtl,
  loadAuthToken,
  loadClientId,
} from '@/api/session-store';
import {
  getPedometerStatus,
  raiseAndroidStepsFloor,
  readStepsForDate,
  type PedometerStatus,
} from '@/services/pedometer';
import {
  pickDailyStepsForDate,
  resolveStepsGoal,
  shiftISODate,
  toISODate,
} from '@/types/daily-steps';

export const SYNC_DAILY_STEPS_TASK = 'regenesis-sync-daily-steps';

export type PedometerSyncResult = {
  todaySteps: number | null;
  status: PedometerStatus;
};

async function prepareAuthForBackground(): Promise<string | null> {
  if (!(await isSessionWithinTtl())) return null;

  if (!getAuthToken()) {
    const token = await loadAuthToken();
    if (token) setAuthToken(token);
  }
  if (!getAuthToken()) return null;
  return loadClientId();
}

/**
 * Lee el sensor y crea/actualiza los registros del API.
 * Nunca reduce los pasos ya guardados: siempre toma el máximo (sensor vs API).
 */
export async function syncPedometerToApi(): Promise<PedometerSyncResult> {
  const clientId = await prepareAuthForBackground();
  if (!clientId) {
    return { todaySteps: null, status: 'idle' };
  }

  const status = await getPedometerStatus();
  if (status !== 'tracking') {
    return { todaySteps: null, status };
  }

  const records = await fetchClientDailySteps(clientId);
  const today = toISODate();
  // iOS: Core Motion guarda ~7 días. Android (expo-android-pedometer): histórico local.
  const lookbackDays = Platform.OS === 'ios' ? 6 : Platform.OS === 'android' ? 1 : 0;
  const dates = Array.from({ length: lookbackDays + 1 }, (_, index) =>
    shiftISODate(today, index - lookbackDays),
  );

  let todaySteps: number | null = null;

  for (const date of dates) {
    const sensorSteps = await readStepsForDate(date);
    if (sensorSteps == null) continue;

    const existing = pickDailyStepsForDate(records, date);
    const existingSteps = existing?.steps ?? 0;
    // Nunca sobrescribir a la baja: se acumula el máximo conocido.
    const next = Math.max(existingSteps, Math.round(sensorSteps));

    if (date === today) {
      todaySteps = next;
      if (Platform.OS === 'android') {
        await raiseAndroidStepsFloor(next);
      }
    }

    if (next <= 0 && !existing) continue;
    if (existing && existing.steps === next) continue;

    const goal = resolveStepsGoal(existing, records);
    if (existing) {
      const updated = await updateDailyStepsApi(existing._id, { steps: next, goal });
      const idx = records.findIndex((item) => item._id === updated._id);
      if (idx >= 0) records[idx] = updated;
      else records.push(updated);
    } else {
      const created = await createDailyStepsApi({
        clientId,
        date,
        steps: next,
        goal,
      });
      records.push(created);
    }
  }

  return { todaySteps, status: 'tracking' };
}

export async function registerDailyStepsBackgroundTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  const available = await TaskManager.isAvailableAsync();
  if (!available) return;

  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;

  const registered = await TaskManager.isTaskRegisteredAsync(SYNC_DAILY_STEPS_TASK);
  if (registered) {
    // Re-registra para asegurar el intervalo mínimo tras actualizaciones.
    try {
      await BackgroundTask.unregisterTaskAsync(SYNC_DAILY_STEPS_TASK);
    } catch {
      // ignore
    }
  }

  await BackgroundTask.registerTaskAsync(SYNC_DAILY_STEPS_TASK, {
    minimumInterval: 15,
  });
}

export async function unregisterDailyStepsBackgroundTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(SYNC_DAILY_STEPS_TASK);
    if (registered) {
      await BackgroundTask.unregisterTaskAsync(SYNC_DAILY_STEPS_TASK);
    }
  } catch {
    // Si la tarea no está registrada, no hay nada que limpiar.
  }
}

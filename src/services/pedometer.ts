import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

import {
  loadAndroidStepsCache,
  persistAndroidStepsCache,
} from '@/api/session-store';
import { toISODate } from '@/types/daily-steps';

export type PedometerStatus = 'idle' | 'unavailable' | 'denied' | 'tracking';

function localDayBounds(isoDate: string): { start: Date; end: Date } {
  const start = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const now = new Date();
  return { start, end: end > now ? now : end };
}

export async function getPedometerStatus(): Promise<PedometerStatus> {
  if (Platform.OS === 'web') return 'unavailable';

  const available = await Pedometer.isAvailableAsync();
  if (!available) return 'unavailable';

  const permission = await Pedometer.getPermissionsAsync();
  return permission.granted ? 'tracking' : 'denied';
}

export async function ensurePedometerReady(): Promise<PedometerStatus> {
  const current = await getPedometerStatus();
  if (current !== 'denied') return current;

  const permission = await Pedometer.requestPermissionsAsync();
  return permission.granted ? 'tracking' : 'denied';
}

/**
 * En Android el watch se reinicia a 0 al abrir la app.
 * Conserva el acumulado del día y lo arranca al menos en `seedSteps` (p. ej. valor del API).
 */
export async function beginAndroidSession(seedSteps = 0): Promise<number> {
  if (Platform.OS !== 'android') {
    return Math.max(0, Math.round(seedSteps));
  }

  const today = toISODate();
  const cache = await loadAndroidStepsCache();
  const previous = cache?.date === today ? cache.steps : 0;
  const steps = Math.max(0, previous, Math.round(seedSteps));

  await persistAndroidStepsCache({
    date: today,
    steps,
    sessionWatch: 0,
  });

  return steps;
}

export async function readStepsForDate(isoDate: string): Promise<number | null> {
  const date = isoDate.slice(0, 10);
  const { start, end } = localDayBounds(date);
  if (start.getTime() >= end.getTime()) return 0;

  try {
    const result = await Pedometer.getStepCountAsync(start, end);
    return Math.max(0, Math.round(result.steps));
  } catch {
    if (date !== toISODate()) return null;
    const cache = await loadAndroidStepsCache();
    return cache?.date === date ? cache.steps : 0;
  }
}

/**
 * Actualiza el acumulado Android con el delta del watch.
 * Nunca reduce el total del día (parte de cache/API seed).
 */
export async function onPedometerWatch(watchSteps: number): Promise<number | null> {
  const safeWatch = Math.max(0, Math.round(watchSteps));

  if (Platform.OS === 'ios') {
    return readStepsForDate(toISODate());
  }

  if (Platform.OS !== 'android') return null;

  const today = toISODate();
  const cache = await loadAndroidStepsCache();
  const current =
    cache?.date === today ? cache : { date: today, steps: 0, sessionWatch: 0 };

  const delta = Math.max(0, safeWatch - current.sessionWatch);
  const total = Math.max(0, current.steps + delta);

  await persistAndroidStepsCache({
    date: today,
    steps: total,
    sessionWatch: safeWatch,
  });

  return total;
}

/** Asegura que la caché Android no quede por debajo del valor ya conocido (API). */
export async function raiseAndroidStepsFloor(floor: number): Promise<number | null> {
  if (Platform.OS !== 'android') return null;
  const today = toISODate();
  const cache = await loadAndroidStepsCache();
  const current =
    cache?.date === today ? cache : { date: today, steps: 0, sessionWatch: 0 };
  const steps = Math.max(current.steps, Math.max(0, Math.round(floor)));
  await persistAndroidStepsCache({
    ...current,
    date: today,
    steps,
  });
  return steps;
}

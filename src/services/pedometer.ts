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

/** En Android el watch se reinicia a 0 al abrir la app: conserva el acumulado del día. */
export async function beginAndroidSession(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const today = toISODate();
  const cache = await loadAndroidStepsCache();
  if (!cache || cache.date !== today) {
    await persistAndroidStepsCache({ date: today, steps: 0, sessionWatch: 0 });
    return;
  }
  await persistAndroidStepsCache({ ...cache, sessionWatch: 0 });
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
  const total = Math.max(0, current.steps + (safeWatch - current.sessionWatch));

  await persistAndroidStepsCache({
    date: today,
    steps: total,
    sessionWatch: safeWatch,
  });

  return total;
}

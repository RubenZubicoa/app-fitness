import { Pedometer as ExpoPedometer } from 'expo-sensors';
import { Platform } from 'react-native';

import {
  loadAndroidStepsCache,
  persistAndroidStepsCache,
} from '@/api/session-store';
import { toISODate } from '@/types/daily-steps';

export type PedometerStatus = 'idle' | 'unavailable' | 'denied' | 'tracking';

type AndroidPedometerModule = typeof import('expo-android-pedometer');

function getAndroidPedometer(): AndroidPedometerModule | null {
  if (Platform.OS !== 'android') return null;
  // Require dinámico: el módulo es no-op/ausente en iOS.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-android-pedometer') as AndroidPedometerModule;
}

function localDayBounds(isoDate: string): { start: Date; end: Date } {
  const start = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const now = new Date();
  return { start, end: end > now ? now : end };
}

export async function getPedometerStatus(): Promise<PedometerStatus> {
  if (Platform.OS === 'web') return 'unavailable';

  if (Platform.OS === 'android') {
    const AndroidPedometer = getAndroidPedometer();
    if (!AndroidPedometer) return 'unavailable';
    const available = await AndroidPedometer.isSensorAvailable();
    if (!available) return 'unavailable';
    const permission = await AndroidPedometer.getActivityPermissionStatus();
    return permission.granted ? 'tracking' : 'denied';
  }

  const available = await ExpoPedometer.isAvailableAsync();
  if (!available) return 'unavailable';
  const permission = await ExpoPedometer.getPermissionsAsync();
  return permission.granted ? 'tracking' : 'denied';
}

export async function ensurePedometerReady(): Promise<PedometerStatus> {
  if (Platform.OS === 'web') return 'unavailable';

  if (Platform.OS === 'android') {
    const AndroidPedometer = getAndroidPedometer();
    if (!AndroidPedometer) return 'unavailable';
    if (!(await AndroidPedometer.isSensorAvailable())) return 'unavailable';

    const activity = await AndroidPedometer.requestActivityPermissions();
    if (!activity.granted) return 'denied';
    // Necesaria para la notificación del servicio en primer plano (Android 13+).
    await AndroidPedometer.requestNotificationPermissions();
    return 'tracking';
  }

  const current = await getPedometerStatus();
  if (current !== 'denied') return current;
  const permission = await ExpoPedometer.requestPermissionsAsync();
  return permission.granted ? 'tracking' : 'denied';
}

/**
 * Android: arranca el servicio en primer plano que sigue contando con la app cerrada.
 * iOS: no-op (Core Motion acumula y se lee con getStepCountAsync).
 */
export async function startBackgroundStepTracking(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const AndroidPedometer = getAndroidPedometer();
  if (!AndroidPedometer) return false;

  const started = await AndroidPedometer.setupBackgroundUpdates({
    title: 'Regenesis',
    contentTemplate: 'Has dado %d pasos hoy',
    pausedTitle: 'Conteo de pasos pausado',
    pausedText: 'Toca para reanudar el conteo de pasos',
  });

  try {
    const exempt = await AndroidPedometer.isBatteryOptimizationExcluded();
    if (!exempt) {
      await AndroidPedometer.requestBatteryOptimizationExemption();
    }
  } catch {
    // El usuario puede denegar la excepción de batería; el servicio sigue activo.
  }

  return Boolean(started);
}

export async function stopBackgroundStepTracking(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const AndroidPedometer = getAndroidPedometer();
  if (!AndroidPedometer) return;
  try {
    await AndroidPedometer.stopBackgroundUpdates();
  } catch {
    // Si no estaba activo, no hay nada que limpiar.
  }
}

/**
 * Semilla de compatibilidad con la caché propia (fallback si el módulo nativo falla).
 */
export async function beginAndroidSession(seedSteps = 0): Promise<number> {
  if (Platform.OS !== 'android') {
    return Math.max(0, Math.round(seedSteps));
  }

  const AndroidPedometer = getAndroidPedometer();
  if (AndroidPedometer) {
    try {
      const nativeToday = await AndroidPedometer.getStepsCountAsync();
      const steps = Math.max(0, Math.round(nativeToday), Math.round(seedSteps));
      await persistAndroidStepsCache({
        date: toISODate(),
        steps,
        sessionWatch: 0,
      });
      return steps;
    } catch {
      // fallback a caché local
    }
  }

  const today = toISODate();
  const cache = await loadAndroidStepsCache();
  const previous = cache?.date === today ? cache.steps : 0;
  const steps = Math.max(0, previous, Math.round(seedSteps));
  await persistAndroidStepsCache({ date: today, steps, sessionWatch: 0 });
  return steps;
}

export async function readStepsForDate(isoDate: string): Promise<number | null> {
  const date = isoDate.slice(0, 10);

  if (Platform.OS === 'android') {
    const AndroidPedometer = getAndroidPedometer();
    if (AndroidPedometer) {
      try {
        const dayIso = new Date(`${date}T12:00:00`).toISOString();
        const steps = await AndroidPedometer.getStepsCountAsync(dayIso);
        return Math.max(0, Math.round(steps));
      } catch {
        // fallback
      }
    }
    if (date !== toISODate()) return null;
    const cache = await loadAndroidStepsCache();
    return cache?.date === date ? cache.steps : 0;
  }

  // iOS: Core Motion guarda el histórico aunque la app esté cerrada.
  const { start, end } = localDayBounds(date);
  if (start.getTime() >= end.getTime()) return 0;
  try {
    const result = await ExpoPedometer.getStepCountAsync(start, end);
    return Math.max(0, Math.round(result.steps));
  } catch {
    return null;
  }
}

/**
 * Suscripción a pasos del día.
 * Android: servicio nativo (incluye fondo). iOS: watch + lectura Core Motion.
 */
export function subscribeStepUpdates(
  onSteps: (steps: number) => void,
): { remove: () => void } {
  if (Platform.OS === 'android') {
    const AndroidPedometer = getAndroidPedometer();
    if (AndroidPedometer) {
      const sub = AndroidPedometer.subscribeToChanges((event) => {
        const steps = Math.max(0, Math.round(event.steps));
        void persistAndroidStepsCache({
          date: toISODate(),
          steps,
          sessionWatch: 0,
        });
        onSteps(steps);
      });
      return sub;
    }
  }

  const sub = ExpoPedometer.watchStepCount(() => {
    void (async () => {
      const steps = await readStepsForDate(toISODate());
      if (steps != null) onSteps(steps);
    })();
  });
  return sub;
}

/** @deprecated Preferir subscribeStepUpdates + readStepsForDate. */
export async function onPedometerWatch(watchSteps: number): Promise<number | null> {
  if (Platform.OS === 'ios') {
    return readStepsForDate(toISODate());
  }
  if (Platform.OS !== 'android') return null;

  const AndroidPedometer = getAndroidPedometer();
  if (AndroidPedometer) {
    try {
      return Math.max(0, Math.round(await AndroidPedometer.getStepsCountAsync()));
    } catch {
      // fallback cache
    }
  }

  const safeWatch = Math.max(0, Math.round(watchSteps));
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

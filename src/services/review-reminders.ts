import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { Platform } from 'react-native';

import {
  isSessionWithinTtl,
  loadReviewRemindersState,
  loadSessionExpiresAt,
  persistReviewRemindersState,
  type ReviewRemindersState,
} from '@/api/session-store';
import {
  formatReviewDateLabel,
  parseReviewDate,
  type Review,
} from '@/types/review';

const CHANNEL_ID = 'review-reminders';
const ID_PREFIX = 'review-reminder:';
const HOURS_BEFORE = 24;

let store: ReviewRemindersState = { notifiedIds: [], pending: {} };
let hydrated = false;
let listenersReady = false;

function notificationId(reviewId: string): string {
  return `${ID_PREFIX}${reviewId}`;
}

function isNative(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Momento en el que debe avisar: 24 h antes de la revisión. */
export function getReviewReminderAt(review: Review): Date | null {
  const date = parseReviewDate(review.date);
  if (!date) return null;
  return new Date(date.getTime() - HOURS_BEFORE * 60 * 60 * 1000);
}

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  if (isNative()) {
    store = await loadReviewRemindersState();
  }
  hydrated = true;
}

async function saveStore(next: ReviewRemindersState): Promise<void> {
  store = next;
  await persistReviewRemindersState(next);
}

async function ensurePermissions(): Promise<boolean> {
  if (!isNative()) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios de revisión',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E4A93C',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  return status === 'granted';
}

function buildContent(review: Review): Notifications.NotificationContentInput {
  const when = formatReviewDateLabel(review.date);
  return {
    title: 'Revisión pendiente',
    body: `${review.title || 'Tienes una revisión'} · ${when}`,
    data: { type: 'review-reminder', reviewId: review._id, href: '/revisiones' },
    sound: true,
    ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
  };
}

async function cancelOurScheduled(): Promise<void> {
  if (!isNative()) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Cancela recordatorios locales (logout / sesión caducada). */
export async function cancelReviewReminderNotifications(): Promise<void> {
  await ensureHydrated();
  await saveStore({ notifiedIds: [], pending: {} });
  try {
    await cancelOurScheduled();
  } catch {
    // Sin permisos o plataforma sin soporte.
  }
}

async function scheduleOne(review: Review, triggerAt: Date): Promise<void> {
  const now = Date.now();
  const delayMs = Math.max(2_000, triggerAt.getTime() - now);
  const seconds = Math.max(2, Math.ceil(delayMs / 1000));

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId(review._id),
    content: buildContent(review),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });
}

/**
 * Programa notificaciones locales 24 h antes de cada revisión `upcoming`,
 * solo si la sesión sigue vigente en el momento del aviso.
 */
export async function syncReviewReminderNotifications(reviews: Review[]): Promise<void> {
  if (!isNative()) return;

  await ensureHydrated();

  const withinTtl = await isSessionWithinTtl();
  if (!withinTtl) {
    await cancelReviewReminderNotifications();
    return;
  }

  const expiresAt = await loadSessionExpiresAt();
  if (expiresAt == null) {
    await cancelReviewReminderNotifications();
    return;
  }

  const granted = await ensurePermissions();
  if (!granted) return;

  const now = Date.now();
  const upcoming = reviews.filter((r) => r.status === 'upcoming' && r._id);

  await cancelOurScheduled();

  const nextNotified = new Set(store.notifiedIds);
  const nextPending: Record<string, number> = {};

  for (const review of upcoming) {
    const reminderAt = getReviewReminderAt(review);
    if (!reminderAt) continue;

    const reminderMs = reminderAt.getTime();

    // No programar si la sesión ya habría caducado al disparar.
    if (reminderMs >= expiresAt) continue;

    if (nextNotified.has(review._id)) continue;

    // Si ya debió dispararse con la app cerrada, marcar como hecho y no repetir.
    if (store.pending[review._id] != null && now >= store.pending[review._id]) {
      nextNotified.add(review._id);
      continue;
    }

    if (reminderMs <= now) {
      // Ya estamos en la ventana de 24 h: avisar en breve (una sola vez).
      await scheduleOne(review, new Date(now + 2_000));
      nextNotified.add(review._id);
      continue;
    }

    await scheduleOne(review, reminderAt);
    nextPending[review._id] = reminderMs;
  }

  await saveStore({
    notifiedIds: Array.from(nextNotified),
    pending: nextPending,
  });
}

/** Handler en primer plano + navegación al tocar la notificación. */
export function initReviewReminderNotifications(): () => void {
  if (!isNative()) return () => undefined;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (listenersReady) return () => undefined;
  listenersReady = true;

  const markDelivered = (reviewId: unknown) => {
    const id = String(reviewId ?? '').trim();
    if (!id) return;
    void ensureHydrated().then(async () => {
      const notifiedIds = store.notifiedIds.includes(id)
        ? store.notifiedIds
        : [...store.notifiedIds, id];
      const { [id]: _removed, ...pending } = store.pending;
      await saveStore({ notifiedIds, pending });
    });
  };

  const received = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data;
    if (data?.type === 'review-reminder') {
      markDelivered(data.reviewId);
    }
  });

  const response = Notifications.addNotificationResponseReceivedListener((res) => {
    const data = res.notification.request.content.data;
    if (data?.type !== 'review-reminder') return;
    markDelivered(data.reviewId);
    const href = typeof data.href === 'string' ? data.href : '/revisiones';
    try {
      router.push(href as Href);
    } catch {
      // Navegación no lista aún.
    }
  });

  return () => {
    received.remove();
    response.remove();
    listenersReady = false;
  };
}

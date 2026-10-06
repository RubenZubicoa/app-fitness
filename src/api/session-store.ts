import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Client } from '@/types/client';
import { normalizeClient } from '@/types/client';

const TOKEN_KEY = 'regenesis.authToken';
const CLIENT_ID_KEY = 'regenesis.clientId';
const CLIENT_SNAPSHOT_KEY = 'regenesis.clientSnapshot';
const SESSION_EXPIRES_KEY = 'regenesis.sessionExpiresAt';
const ANDROID_STEPS_KEY = 'regenesis.androidSteps';

/** Caducidad local de la sesión tras el login. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

async function write(key: string, value: string | null): Promise<void> {
  if (Platform.OS !== 'web') {
    try {
      if (value == null) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await SecureStore.setItemAsync(key, value, secureOptions);
      }
      return;
    } catch {
      // Si el Keychain falla, no bloqueamos el resto de la sesión.
    }
  }

  if (!canUseLocalStorage()) return;
  if (value == null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}

async function read(key: string): Promise<string | null> {
  if (Platform.OS !== 'web') {
    try {
      const value = await SecureStore.getItemAsync(key, secureOptions);
      if (value != null) return value;
    } catch {
      // Continúa al fallback web/local si existe.
    }
  }

  if (!canUseLocalStorage()) return null;
  return localStorage.getItem(key);
}

export async function persistAuthToken(token: string | null): Promise<void> {
  await write(TOKEN_KEY, token);
}

export async function loadAuthToken(): Promise<string | null> {
  const value = await read(TOKEN_KEY);
  return value?.trim() ? value.trim() : null;
}

export async function persistClientId(id: string | null): Promise<void> {
  await write(CLIENT_ID_KEY, id);
}

export async function loadClientId(): Promise<string | null> {
  const value = await read(CLIENT_ID_KEY);
  return value?.trim() ? value.trim() : null;
}

export async function persistSessionExpiresAt(expiresAt: number | null): Promise<void> {
  await write(
    SESSION_EXPIRES_KEY,
    expiresAt != null && Number.isFinite(expiresAt) ? String(Math.round(expiresAt)) : null,
  );
}

export async function loadSessionExpiresAt(): Promise<number | null> {
  const value = await read(SESSION_EXPIRES_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** True si hay caducidad guardada y aún no ha pasado. */
export async function isSessionWithinTtl(): Promise<boolean> {
  const expiresAt = await loadSessionExpiresAt();
  if (expiresAt == null) return false;
  return Date.now() < expiresAt;
}

export async function startSessionTtl(ttlMs: number = SESSION_TTL_MS): Promise<number> {
  const expiresAt = Date.now() + ttlMs;
  await persistSessionExpiresAt(expiresAt);
  return expiresAt;
}

export async function persistClientSnapshot(client: Client | null): Promise<void> {
  if (!client) {
    await write(CLIENT_SNAPSHOT_KEY, null);
    return;
  }
  await write(CLIENT_SNAPSHOT_KEY, JSON.stringify(client));
}

export async function loadClientSnapshot(): Promise<Client | null> {
  const raw = await read(CLIENT_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    return normalizeClient(parsed);
  } catch {
    return null;
  }
}

export type AndroidStepsCache = {
  date: string;
  steps: number;
  sessionWatch: number;
};

export async function loadAndroidStepsCache(): Promise<AndroidStepsCache | null> {
  const raw = await read(ANDROID_STEPS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AndroidStepsCache;
    if (!parsed?.date || !Number.isFinite(Number(parsed.steps))) return null;
    return {
      date: String(parsed.date).slice(0, 10),
      steps: Math.max(0, Math.round(Number(parsed.steps))),
      sessionWatch: Math.max(0, Math.round(Number(parsed.sessionWatch ?? 0))),
    };
  } catch {
    return null;
  }
}

export async function persistAndroidStepsCache(
  cache: AndroidStepsCache | null,
): Promise<void> {
  if (!cache) {
    await write(ANDROID_STEPS_KEY, null);
    return;
  }
  await write(ANDROID_STEPS_KEY, JSON.stringify(cache));
}

/** Limpia credenciales de sesión (no toca el acumulado de pasos del día). */
export async function clearAuthSessionStore(): Promise<void> {
  await persistAuthToken(null);
  await persistClientId(null);
  await persistSessionExpiresAt(null);
  await persistClientSnapshot(null);
}

export async function clearSessionStore(): Promise<void> {
  await clearAuthSessionStore();
  await persistAndroidStepsCache(null);
}

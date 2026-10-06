import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Client } from '@/types/client';
import { normalizeClient } from '@/types/client';

const TOKEN_KEY = 'regenesis.authToken';
const TOKEN_CHUNKS_KEY = 'regenesis.authToken.chunks';
const CLIENT_ID_KEY = 'regenesis.clientId';
const CLIENT_SNAPSHOT_KEY = 'regenesis.clientSnapshot';
const SESSION_EXPIRES_KEY = 'regenesis.sessionExpiresAt';
const ANDROID_STEPS_KEY = 'regenesis.androidSteps';

/** Caducidad local de la sesión tras el login. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** SecureStore suele limitar ~2048 bytes; troceamos el JWT si hace falta. */
const SECURE_CHUNK_SIZE = 1800;

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

async function write(key: string, value: string | null): Promise<boolean> {
  if (Platform.OS !== 'web') {
    try {
      if (value == null) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await SecureStore.setItemAsync(key, value, secureOptions);
      }
      return true;
    } catch {
      // Fallback debajo.
    }
  }

  if (!canUseLocalStorage()) return false;
  if (value == null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
  return true;
}

async function read(key: string): Promise<string | null> {
  if (Platform.OS !== 'web') {
    try {
      const value = await SecureStore.getItemAsync(key, secureOptions);
      if (value != null) return value;
    } catch {
      // Continúa al fallback.
    }
  }

  if (!canUseLocalStorage()) return null;
  return localStorage.getItem(key);
}

async function deleteChunkedToken(): Promise<void> {
  const chunksRaw = await read(TOKEN_CHUNKS_KEY);
  const count = chunksRaw ? Number(chunksRaw) : 0;
  if (Number.isFinite(count) && count > 0) {
    for (let i = 0; i < count; i++) {
      try {
        await write(`${TOKEN_KEY}.${i}`, null);
      } catch {
        // ignore
      }
    }
  }
  try {
    await write(TOKEN_CHUNKS_KEY, null);
  } catch {
    // ignore
  }
  try {
    await write(TOKEN_KEY, null);
  } catch {
    // ignore
  }
}

export async function persistAuthToken(token: string | null): Promise<void> {
  if (token == null || !token.trim()) {
    await deleteChunkedToken();
    return;
  }

  const value = token.trim();
  await deleteChunkedToken();

  if (value.length <= SECURE_CHUNK_SIZE) {
    const ok = await write(TOKEN_KEY, value);
    if (!ok) {
      throw new Error('No se pudo guardar el token de sesión en el dispositivo');
    }
    return;
  }

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += SECURE_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + SECURE_CHUNK_SIZE));
  }
  const metaOk = await write(TOKEN_CHUNKS_KEY, String(chunks.length));
  if (!metaOk) {
    throw new Error('No se pudo guardar el token de sesión en el dispositivo');
  }
  for (let i = 0; i < chunks.length; i++) {
    const ok = await write(`${TOKEN_KEY}.${i}`, chunks[i]);
    if (!ok) {
      await deleteChunkedToken();
      throw new Error('No se pudo guardar el token de sesión en el dispositivo');
    }
  }
}

export async function loadAuthToken(): Promise<string | null> {
  const single = await read(TOKEN_KEY);
  if (single?.trim()) return single.trim();

  const chunksRaw = await read(TOKEN_CHUNKS_KEY);
  const count = chunksRaw ? Number(chunksRaw) : 0;
  if (!Number.isFinite(count) || count <= 0) return null;

  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const part = await read(`${TOKEN_KEY}.${i}`);
    if (!part) return null;
    parts.push(part);
  }
  const joined = parts.join('').trim();
  return joined || null;
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

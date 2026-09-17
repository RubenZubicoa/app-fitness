import { API_URL } from '@/constants/api';

type ApiErrorBody = { message?: string };
type AuthFailureHandler = () => void;

let authToken: string | null = null;
let authFailureHandler: AuthFailureHandler | null = null;
let authFailureNotified = false;

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null): void {
  authToken = token && token.trim() ? token.trim() : null;
  if (authToken) {
    authFailureNotified = false;
  }
}

export function clearAuthToken(): void {
  authToken = null;
}

/** Registra el callback que limpia la sesión y redirige al login. */
export function setAuthFailureHandler(handler: AuthFailureHandler | null): void {
  authFailureHandler = handler;
}

function notifyAuthFailure(): void {
  clearAuthToken();
  if (authFailureNotified) return;
  authFailureNotified = true;
  authFailureHandler?.();
}

export function extractAuthToken(raw: Record<string, unknown>): string | null {
  const candidates = [raw.token, raw.accessToken, raw.jwt, raw.access_token];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export type ApiFetchOptions = {
  /** No envía Authorization (p. ej. login). */
  skipAuth?: boolean;
  /** Acepta 204 sin cuerpo. */
  allowEmpty?: boolean;
  /** No fuerza Content-Type JSON (útil para FormData). */
  rawBody?: boolean;
};

function isUnauthorizedStatus(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * fetch al API con Authorization Bearer cuando hay token de sesión.
 * Si el token expiró (401/403), limpia la sesión y notifica para redirigir al login.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const hasBody = init?.body != null;
  if (hasBody && !options?.rawBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options?.skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  if (!options?.skipAuth && isUnauthorizedStatus(res.status)) {
    notifyAuthFailure();
  }

  return res;
}

/** request JSON tipado sobre apiFetch. */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions,
): Promise<T> {
  const res = await apiFetch(path, init, options);

  if (options?.allowEmpty && res.status === 204) {
    return undefined as T;
  }

  const data = await parseJson(res);

  if (!res.ok) {
    if (!options?.skipAuth && isUnauthorizedStatus(res.status)) {
      throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    }
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

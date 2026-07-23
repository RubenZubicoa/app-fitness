import { API_URL } from '@/constants/api';
import { normalizeClient, type Client } from '@/types/client';

type ApiErrorBody = { message?: string };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está el API en marcha?');
  }

  const data = await parseJson(res);

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as ApiErrorBody).message)
        : `Error ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function loginClient(email: string, password: string): Promise<Client> {
  const raw = await request<Record<string, unknown>>('/api/clients/login', {
    method: 'POST',
    body: JSON.stringify({ email, contraseña: password, password }),
  });
  return normalizeClient(raw);
}

export async function fetchClientById(id: string): Promise<Client> {
  const raw = await request<Record<string, unknown>>(`/api/clients/${id}`);
  return normalizeClient(raw);
}

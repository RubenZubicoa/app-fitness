import { apiRequest, extractAuthToken, setAuthToken } from '@/api/http';
import { normalizeClient, type Client } from '@/types/client';

export async function loginClient(email: string, password: string): Promise<Client> {
  const raw = await apiRequest<Record<string, unknown>>(
    '/api/clients/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, contraseña: password, password }),
    },
    { skipAuth: true },
  );

  const token = extractAuthToken(raw);
  if (!token) {
    throw new Error('El servidor no devolvió un token de autenticación');
  }
  setAuthToken(token);

  const clientRaw =
    raw.client && typeof raw.client === 'object'
      ? (raw.client as Record<string, unknown>)
      : raw.user && typeof raw.user === 'object'
        ? (raw.user as Record<string, unknown>)
        : raw;

  return normalizeClient(clientRaw);
}

export async function fetchClientById(id: string): Promise<Client> {
  const raw = await apiRequest<Record<string, unknown>>(`/api/clients/${id}`);
  return normalizeClient(raw);
}

export type UpdateClientPayload = {
  name?: string;
  fullName?: string;
  email?: string;
  telefono?: string;
  goal?: string;
  avatar?: string;
  contraseña?: string;
  password?: string;
};

/** Actualiza datos del cliente: PUT /api/clients/:id */
export async function updateClient(
  id: string,
  payload: UpdateClientPayload,
): Promise<Client> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/clients/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
  return normalizeClient(raw);
}

/** Lista todos los clientes: GET /api/clients */
export async function fetchAllClients(): Promise<Client[]> {
  const raw = await apiRequest<unknown[]>('/api/clients');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeClient(item as Record<string, unknown>));
}

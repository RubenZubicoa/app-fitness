import { Platform } from 'react-native';

import { apiFetch, apiRequest, extractAuthToken, parseJson, setAuthToken } from '@/api/http';
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
  /** URI local de la nueva foto (file/content/blob) o URL remota sin cambio. */
  avatar?: string;
  contraseña?: string;
  password?: string;
};

function isLocalImageUri(uri: string): boolean {
  const value = uri.trim();
  return (
    value.startsWith('file:') ||
    value.startsWith('content:') ||
    value.startsWith('ph:') ||
    value.startsWith('assets-library:') ||
    value.startsWith('blob:') ||
    value.startsWith('data:')
  );
}

async function appendAvatarFile(
  formData: FormData,
  imageUri: string,
  filename: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error('No se pudo leer la imagen seleccionada');
    }
    const blob = await response.blob();
    const type =
      blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'image/jpeg';
    formData.append('avatar', new File([blob], filename, { type }));
    return;
  }

  formData.append('avatar', {
    uri: imageUri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob);
}

/**
 * Actualiza datos del cliente: PUT /api/clients/:id
 * Si hay imagen local nueva, envía multipart/form-data con el archivo en "avatar".
 */
export async function updateClient(
  id: string,
  payload: UpdateClientPayload,
): Promise<Client> {
  const path = `/api/clients/${encodeURIComponent(id)}`;
  const avatarUri = payload.avatar?.trim() || '';
  const hasLocalAvatar = Boolean(avatarUri && isLocalImageUri(avatarUri));

  if (hasLocalAvatar) {
    const formData = new FormData();
    if (payload.name != null) formData.append('name', payload.name);
    if (payload.fullName != null) formData.append('fullName', payload.fullName);
    if (payload.email != null) formData.append('email', payload.email);
    if (payload.telefono != null) formData.append('telefono', payload.telefono);
    if (payload.goal != null) formData.append('goal', payload.goal);
    if (payload.password) formData.append('password', payload.password);
    if (payload.contraseña) formData.append('contraseña', payload.contraseña);

    await appendAvatarFile(formData, avatarUri, 'avatar.jpg');

    const res = await apiFetch(
      path,
      { method: 'PUT', body: formData },
      { rawBody: true },
    );
    const data = await parseJson(res);
    if (!res.ok) {
      const message =
        data && typeof data === 'object' && 'message' in data
          ? String((data as { message?: string }).message)
          : `Error ${res.status}`;
      throw new Error(message);
    }
    return normalizeClient(data as Record<string, unknown>);
  }

  const jsonPayload: Record<string, unknown> = { ...payload };
  // No reenviar URLs remotas como si fueran path de archivo.
  if (!avatarUri || isLocalImageUri(avatarUri)) {
    delete jsonPayload.avatar;
  }

  const raw = await apiRequest<Record<string, unknown>>(path, {
    method: 'PUT',
    body: JSON.stringify(jsonPayload),
  });
  return normalizeClient(raw);
}

/** Lista todos los clientes: GET /api/clients */
export async function fetchAllClients(): Promise<Client[]> {
  const raw = await apiRequest<unknown[]>('/api/clients');
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeClient(item as Record<string, unknown>));
}

/** Elimina la cuenta del cliente: DELETE /api/clients/:id */
export async function deleteClient(id: string): Promise<void> {
  await apiRequest<void>(
    `/api/clients/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

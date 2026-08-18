import { Platform } from 'react-native';

import { API_URL } from '@/constants/api';
import { normalizeProgressImage, type ProgressImage } from '@/types/progress-image';

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
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
      ...init,
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

async function appendImageField(
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
    formData.append('image', new File([blob], filename, { type }));
    return;
  }

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob);
}

/** GET /api/progress-images?clientId=... */
export async function fetchProgressImages(clientId: string): Promise<ProgressImage[]> {
  const raw = await request<unknown[]>(
    `/api/progress-images?clientId=${encodeURIComponent(clientId)}`,
  );
  return raw.map((r) => normalizeProgressImage(r as Record<string, unknown>));
}

/** GET /api/progress-images/:id */
export async function fetchProgressImageById(id: string): Promise<ProgressImage> {
  const raw = await request<Record<string, unknown>>(
    `/api/progress-images/${encodeURIComponent(id)}`,
  );
  return normalizeProgressImage(raw);
}

/**
 * POST /api/progress-images
 * Envía multipart/form-data con los campos "image" (archivo) y "clientId".
 */
export async function uploadProgressImage(
  clientId: string,
  imageUri: string,
  filename = 'photo.jpg',
): Promise<ProgressImage> {
  const formData = new FormData();
  formData.append('clientId', clientId);
  await appendImageField(formData, imageUri, filename);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/progress-images`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
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

  return normalizeProgressImage(data as Record<string, unknown>);
}

/** DELETE /api/progress-images/:id */
export async function deleteProgressImage(id: string): Promise<void> {
  await fetch(`${API_URL}/api/progress-images/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
}

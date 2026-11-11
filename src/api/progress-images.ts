import { Platform } from 'react-native';

import { apiFetch, apiRequest, parseJson } from '@/api/http';
import { createImageFormPart } from '@/api/prepare-image-upload';
import { API_URL } from '@/constants/api';
import {
  normalizeProgressImage,
  type ProgressImage,
  type ProgressImagePose,
} from '@/types/progress-image';

async function appendImageField(
  formData: FormData,
  imageUri: string,
  filename: string,
  mimeType?: string | null,
): Promise<void> {
  console.log('[progress-images] appendImageField', {
    imageUri,
    filename,
    mimeType,
    platform: Platform.OS,
  });

  const part = await createImageFormPart(imageUri, filename, mimeType);
  console.log('[progress-images] FormData image field listo', {
    filename,
    partType: part?.constructor?.name,
    size: typeof part.size === 'number' ? part.size : undefined,
  });
  formData.append('image', part);
}

/** GET /api/progress-images?clientId=... */
export async function fetchProgressImages(clientId: string): Promise<ProgressImage[]> {
  const raw = await apiRequest<unknown[]>(
    `/api/progress-images?clientId=${encodeURIComponent(clientId)}`,
  );
  return raw.map((r) => normalizeProgressImage(r as Record<string, unknown>));
}

/** GET /api/progress-images/:id */
export async function fetchProgressImageById(id: string): Promise<ProgressImage> {
  const raw = await apiRequest<Record<string, unknown>>(
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
  mimeType?: string | null,
  pose?: ProgressImagePose | null,
): Promise<ProgressImage> {
  console.log('[progress-images] POST /api/progress-images inicio', {
    apiUrl: API_URL,
    clientId,
    imageUri,
    filename,
    mimeType,
    pose,
  });

  const formData = new FormData();
  formData.append('clientId', clientId);
  if (pose) formData.append('pose', pose);
  await appendImageField(formData, imageUri, filename, mimeType);

  console.log('[progress-images] Enviando FormData al back…');
  const res = await apiFetch(
    '/api/progress-images',
    { method: 'POST', body: formData },
    { rawBody: true },
  );

  const data = await parseJson(res);
  console.log('[progress-images] Respuesta back', {
    status: res.status,
    ok: res.ok,
    data,
  });

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : `Error ${res.status}`;
    console.error('[progress-images] Subida fallida', message);
    throw new Error(message);
  }

  console.log('[progress-images] Subida OK');
  return normalizeProgressImage(data as Record<string, unknown>);
}

/** DELETE /api/progress-images/:id */
export async function deleteProgressImage(id: string): Promise<void> {
  await apiRequest<unknown>(
    `/api/progress-images/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    { allowEmpty: true },
  );
}

/**
 * Reemplaza la imagen de un registro:
 * sube una nueva y elimina la anterior.
 */
export async function replaceProgressImage(
  existingId: string,
  clientId: string,
  imageUri: string,
  filename = 'photo.jpg',
  mimeType?: string | null,
  pose?: ProgressImagePose | null,
): Promise<ProgressImage> {
  const uploaded = await uploadProgressImage(
    clientId,
    imageUri,
    filename,
    mimeType,
    pose,
  );
  try {
    await deleteProgressImage(existingId);
  } catch {
    // La nueva imagen ya está guardada; el borrado antiguo puede reintentarse.
  }
  return uploaded;
}

import { Platform } from 'react-native';

import { apiFetch, apiRequest, parseJson } from '@/api/http';
import { normalizeProgressImage, type ProgressImage } from '@/types/progress-image';

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
): Promise<ProgressImage> {
  const formData = new FormData();
  formData.append('clientId', clientId);
  await appendImageField(formData, imageUri, filename);

  const res = await apiFetch(
    '/api/progress-images',
    { method: 'POST', body: formData },
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
): Promise<ProgressImage> {
  const uploaded = await uploadProgressImage(clientId, imageUri, filename);
  try {
    await deleteProgressImage(existingId);
  } catch {
    // La nueva imagen ya está guardada; el borrado antiguo puede reintentarse.
  }
  return uploaded;
}

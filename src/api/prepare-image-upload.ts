import { File as ExpoFile } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type PreparedUploadImage = {
  uri: string;
  name: string;
  type: string;
};

function guessMimeAndExt(
  uri: string,
  mimeType?: string | null,
): { type: string; ext: string } {
  const mime = (mimeType ?? '').trim().toLowerCase();
  if (mime.startsWith('image/')) {
    const subtype = mime.slice('image/'.length).replace('jpeg', 'jpg') || 'jpg';
    const type = mime === 'image/jpg' ? 'image/jpeg' : mime;
    return { type, ext: subtype === 'jpeg' ? 'jpg' : subtype };
  }

  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return { type: 'image/png', ext: 'png' };
  if (lower.includes('.webp')) return { type: 'image/webp', ext: 'webp' };
  if (lower.includes('.heic') || lower.includes('.heif')) {
    return { type: 'image/heic', ext: 'heic' };
  }
  return { type: 'image/jpeg', ext: 'jpg' };
}

/**
 * Prepara una URI local (copia content:// / ph:// a file:// en caché).
 */
export async function prepareLocalImageForUpload(
  imageUri: string,
  filenameBase = 'photo',
  mimeType?: string | null,
): Promise<PreparedUploadImage> {
  const { type, ext } = guessMimeAndExt(imageUri, mimeType);
  const name = filenameBase.includes('.') ? filenameBase : `${filenameBase}.${ext}`;
  let uri = imageUri.trim();

  if (Platform.OS === 'web') {
    return { uri, name, type };
  }

  const needsCopy =
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://');

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('No se pudo preparar la imagen para subir');
  }

  // Materializar en caché con nombre único + basename final (Expo File usa el basename).
  const dest = `${cacheDir}upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`;

  if (needsCopy || !uri.startsWith(cacheDir)) {
    console.log('[prepare-image] Copiando a caché', {
      from: uri,
      to: dest,
      platform: Platform.OS,
      needsCopy,
    });
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      uri = dest;
    } catch (err) {
      if (needsCopy) throw err;
      console.warn('[prepare-image] copyAsync falló; se usa URI original', err);
    }
  }

  if (Platform.OS === 'android' && uri.startsWith('/') && !uri.startsWith('file://')) {
    uri = `file://${uri}`;
  }

  console.log('[prepare-image] Listo', { uri, name, type, platform: Platform.OS });
  return { uri, name, type };
}

/**
 * Valor compatible con el fetch de Expo 57 (WinterCG).
 * No usar `{ uri, name, type }`: provoca "Unsupported FormDataPart implementation".
 */
export async function createImageFormPart(
  imageUri: string,
  filenameBase = 'photo',
  mimeType?: string | null,
): Promise<Blob> {
  const prepared = await prepareLocalImageForUpload(imageUri, filenameBase, mimeType);

  if (Platform.OS === 'web') {
    const response = await fetch(prepared.uri);
    if (!response.ok) {
      throw new Error('No se pudo leer la imagen seleccionada');
    }
    const blob = await response.blob();
    const type =
      blob.type && blob.type !== 'application/octet-stream'
        ? blob.type
        : prepared.type;
    return new File([blob], prepared.name, { type });
  }

  const expoFile = new ExpoFile(prepared.uri);
  console.log('[prepare-image] ExpoFile para FormData', {
    uri: expoFile.uri,
    name: expoFile.name,
    type: prepared.type,
  });
  // Expo 57 fetch (WinterCG) exige Blob / File con bytes(), no { uri, name, type }.
  return expoFile as unknown as Blob;
}

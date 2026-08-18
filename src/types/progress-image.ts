import { normalizeId } from '@/types/program';

export type ProgressImage = {
  _id: string;
  clientId: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export function normalizeProgressImage(raw: Record<string, unknown>): ProgressImage {
  return {
    _id: normalizeId(raw._id),
    clientId: String(raw.clientId ?? ''),
    image: String(raw.image ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

/** Formatea una fecha ISO o Date a "d mmm" (ej: "14 abr"). */
export function formatProgressImageDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

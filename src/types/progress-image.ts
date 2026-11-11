import { normalizeId } from "@/types/program";

export const PROGRESS_IMAGE_POSES = [
  "De frente",
  "Lateral",
  "De espaldas",
] as const;

export type ProgressImagePose = (typeof PROGRESS_IMAGE_POSES)[number];

export type ProgressImage = {
  _id: string;
  clientId: string;
  image: string;
  pose: ProgressImagePose;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_PROGRESS_IMAGE_POSE: ProgressImagePose = "De frente";

/** Devuelve una pose válida; si es nula o desconocida, "De frente". */
export function resolveProgressImagePose(raw: unknown): ProgressImagePose {
  const value = typeof raw === "string" ? raw.trim() : "";
  return (PROGRESS_IMAGE_POSES as readonly string[]).includes(value)
    ? (value as ProgressImagePose)
    : DEFAULT_PROGRESS_IMAGE_POSE;
}

export function normalizeProgressImage(
  raw: Record<string, unknown>,
): ProgressImage {
  return {
    _id: normalizeId(raw._id),
    clientId: String(raw.clientId ?? ""),
    image: String(raw.image ?? ""),
    pose: resolveProgressImagePose(raw.pose),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

/** Formatea una fecha ISO o Date a "d mmm" (ej: "14 abr"). */
export function formatProgressImageDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

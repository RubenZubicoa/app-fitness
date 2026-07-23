import { normalizeId } from '@/types/program';

export type Client = {
  _id: string;
  name: string;
  fullName: string;
  email: string;
  telefono: string;
  goal: string;
  coach: string;
  plan: string;
  /** Id del documento Program en la base de datos. */
  program: string;
  startDate: string;
  endDate: string;
  week: number;
  totalWeeks: number;
  phase: number;
  totalPhases: number;
  avatar: string;
};

export function normalizeClient(raw: Record<string, unknown>): Client {
  return {
    _id: normalizeId(raw._id),
    name: String(raw.name ?? ''),
    fullName: String(raw.fullName ?? ''),
    email: String(raw.email ?? ''),
    telefono: String(raw.telefono ?? ''),
    goal: String(raw.goal ?? ''),
    coach: String(raw.coach ?? ''),
    plan: String(raw.plan ?? ''),
    program: normalizeId(raw.program),
    startDate: String(raw.startDate ?? ''),
    endDate: String(raw.endDate ?? ''),
    week: Number(raw.week ?? 1),
    totalWeeks: Number(raw.totalWeeks ?? 12),
    phase: Number(raw.phase ?? 1),
    totalPhases: Number(raw.totalPhases ?? 3),
    avatar: String(raw.avatar ?? ''),
  };
}

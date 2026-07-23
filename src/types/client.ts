export type Client = {
  _id: string;
  name: string;
  fullName: string;
  email: string;
  telefono: string;
  goal: string;
  coach: string;
  plan: string;
  program: number;
  startDate: string;
  endDate: string;
  week: number;
  totalWeeks: number;
  phase: number;
  totalPhases: number;
  avatar: string;
};

function normalizeId(id: unknown): string {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object' && '$oid' in id) {
    return String((id as { $oid: string }).$oid);
  }
  return String(id);
}

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
    program: Number(raw.program ?? 0),
    startDate: String(raw.startDate ?? ''),
    endDate: String(raw.endDate ?? ''),
    week: Number(raw.week ?? 1),
    totalWeeks: Number(raw.totalWeeks ?? 12),
    phase: Number(raw.phase ?? 1),
    totalPhases: Number(raw.totalPhases ?? 3),
    avatar: String(raw.avatar ?? ''),
  };
}

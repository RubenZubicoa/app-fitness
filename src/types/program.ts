export type Program = {
  _id: string;
  name: string;
  description: string;
};

export function normalizeId(id: unknown): string {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object' && '$oid' in id) {
    return String((id as { $oid: string }).$oid);
  }
  return String(id);
}

export function normalizeProgram(raw: Record<string, unknown>): Program {
  return {
    _id: normalizeId(raw._id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
  };
}

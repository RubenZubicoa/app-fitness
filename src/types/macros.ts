import { normalizeId } from '@/types/program';

export type MacroItem = {
  key: string;
  label: string;
  shortLabel: string;
  grams: number;
  target: number;
  tone: string;
};

export type Macros = {
  _id: string;
  clientId: string;
  calories: number;
  target: number;
  items: MacroItem[];
};

export function normalizeMacros(raw: Record<string, unknown>): Macros {
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const items: MacroItem[] = itemsRaw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      key: String(item.key ?? ''),
      label: String(item.label ?? ''),
      shortLabel: String(item.shortLabel ?? ''),
      grams: Number(item.grams ?? 0),
      target: Number(item.target ?? 0),
      tone: String(item.tone ?? 'primary'),
    };
  });

  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    calories: Number(raw.calories ?? 0),
    target: Number(raw.target ?? 0),
    items,
  };
}

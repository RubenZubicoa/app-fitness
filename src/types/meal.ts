import { Ionicons } from '@expo/vector-icons';

import { normalizeId } from '@/types/program';

export type IoniconName = keyof typeof Ionicons.glyphMap;

/** Comida completa alternativa que el cliente puede elegir. */
export type MealOption = {
  name: string;
  kcal: number;
  description?: string;
};

export type MealSlot = {
  label: string;
  time: string;
  icon: IoniconName;
  options: MealOption[];
};

export type Meal = {
  _id: string;
  clientId: string;
  slots: MealSlot[];
};

function asIonicon(value: unknown): IoniconName {
  const name = String(value ?? 'restaurant-outline');
  if (name in Ionicons.glyphMap) return name as IoniconName;
  return 'restaurant-outline';
}

function normalizeMealOption(raw: unknown): MealOption {
  const item = (raw ?? {}) as Record<string, unknown>;
  const description =
    item.description !== undefined ? String(item.description) : undefined;
  return {
    name: String(item.name ?? ''),
    kcal: Number(item.kcal ?? 0),
    ...(description ? { description } : {}),
  };
}

function normalizeMealSlot(raw: unknown): MealSlot {
  const slot = (raw ?? {}) as Record<string, unknown>;
  // Compatibilidad con datos antiguos (`items`)
  const optionsRaw = Array.isArray(slot.options)
    ? slot.options
    : Array.isArray(slot.items)
      ? slot.items
      : [];
  return {
    label: String(slot.label ?? ''),
    time: String(slot.time ?? ''),
    icon: asIonicon(slot.icon),
    options: optionsRaw.map(normalizeMealOption),
  };
}

export function normalizeMeal(raw: Record<string, unknown>): Meal {
  const slotsRaw = Array.isArray(raw.slots) ? raw.slots : [];
  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    slots: slotsRaw.map(normalizeMealSlot),
  };
}

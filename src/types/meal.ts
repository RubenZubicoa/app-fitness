import { Ionicons } from '@expo/vector-icons';

import { normalizeId } from '@/types/program';

export type IoniconName = keyof typeof Ionicons.glyphMap;

export type MealItem = {
  name: string;
  kcal?: number;
};

export type MealSlot = {
  label: string;
  time: string;
  icon: IoniconName;
  kcal: number;
  items: MealItem[];
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

function normalizeMealItem(raw: unknown): MealItem {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    name: String(item.name ?? ''),
    ...(item.kcal !== undefined ? { kcal: Number(item.kcal) } : {}),
  };
}

function normalizeMealSlot(raw: unknown): MealSlot {
  const slot = (raw ?? {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(slot.items) ? slot.items : [];
  return {
    label: String(slot.label ?? ''),
    time: String(slot.time ?? ''),
    icon: asIonicon(slot.icon),
    kcal: Number(slot.kcal ?? 0),
    items: itemsRaw.map(normalizeMealItem),
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

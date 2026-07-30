import { Ionicons } from '@expo/vector-icons';

import { normalizeId } from '@/types/program';

export type IoniconName = keyof typeof Ionicons.glyphMap;

export type SupplementElement = {
  name: string;
  dose: string;
  when: string;
  icon: IoniconName;
};

export type Supplements = {
  _id: string;
  clientId: string;
  elements: SupplementElement[];
};

function asIonicon(value: unknown): IoniconName {
  const name = String(value ?? 'flask-outline');
  if (name in Ionicons.glyphMap) {
    return name as IoniconName;
  }
  return 'flask-outline';
}

export function normalizeSupplements(raw: Record<string, unknown>): Supplements {
  const elementsRaw = Array.isArray(raw.elements) ? raw.elements : [];
  const elements: SupplementElement[] = elementsRaw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      name: String(item.name ?? ''),
      dose: String(item.dose ?? ''),
      when: String(item.when ?? ''),
      icon: asIonicon(item.icon),
    };
  });

  return {
    _id: normalizeId(raw._id),
    clientId: normalizeId(raw.clientId),
    elements,
  };
}

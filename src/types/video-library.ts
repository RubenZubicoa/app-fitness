import { Ionicons } from '@expo/vector-icons';

import { normalizeId } from '@/types/program';

export type IoniconName = keyof typeof Ionicons.glyphMap;
export type VideoLibraryTone = 'gold' | 'primary' | 'purple';
export type VideoLibraryMediaType = 'Vídeo' | 'PDF';

export type VideoLibraryItem = {
  _id: string;
  title: string;
  type: VideoLibraryMediaType;
  length: string;
  phase: number;
  url: string;
};

export type VideoLibraryCategory = {
  _id: string;
  category: string;
  icon: IoniconName;
  tone: VideoLibraryTone;
  items: VideoLibraryItem[];
};

function asIonicon(value: unknown, fallback = 'play-circle-outline'): IoniconName {
  const name = String(value ?? fallback);
  if (name in Ionicons.glyphMap) {
    return name as IoniconName;
  }
  return fallback as IoniconName;
}

function asTone(value: unknown): VideoLibraryTone {
  const tone = String(value ?? 'primary');
  if (tone === 'gold' || tone === 'primary' || tone === 'purple') {
    return tone;
  }
  return 'primary';
}

function asMediaType(value: unknown): VideoLibraryMediaType {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (normalized === 'pdf') return 'PDF';
  return 'Vídeo';
}

function normalizeVideoLibraryItem(raw: unknown): VideoLibraryItem | null {
  const item = (raw ?? {}) as Record<string, unknown>;
  const title = String(item.title ?? '').trim();
  if (!title) return null;

  const url = String(item.url ?? item.link ?? '').trim();

  return {
    _id: normalizeId(item._id ?? item.id ?? title),
    title,
    type: asMediaType(item.type ?? item.mediaType),
    length: String(item.length ?? item.duration ?? ''),
    phase: Number(item.phase ?? 1),
    url,
  };
}

function normalizeVideoLibraryCategory(raw: unknown): VideoLibraryCategory | null {
  const entry = (raw ?? {}) as Record<string, unknown>;
  const category = String(entry.category ?? entry.name ?? '').trim();
  if (!category) return null;

  const itemsRaw = Array.isArray(entry.items) ? entry.items : [];
  const items = itemsRaw
    .map(normalizeVideoLibraryItem)
    .filter((item): item is VideoLibraryItem => item !== null);

  return {
    _id: normalizeId(entry._id ?? entry.id ?? category),
    category,
    icon: asIonicon(entry.icon, 'folder-outline'),
    tone: asTone(entry.tone),
    items,
  };
}

function groupFlatItems(items: VideoLibraryItem[]): VideoLibraryCategory[] {
  const categories = new Map<string, VideoLibraryCategory>();

  for (const item of items) {
    const source = item as VideoLibraryItem & {
      category?: string;
      icon?: IoniconName;
      tone?: VideoLibraryTone;
    };
    const categoryName = String(source.category ?? 'General').trim() || 'General';
    const key = categoryName.toLowerCase();

    if (!categories.has(key)) {
      categories.set(key, {
        _id: key,
        category: categoryName,
        icon: asIonicon(source.icon, 'folder-outline'),
        tone: asTone(source.tone),
        items: [],
      });
    }

    categories.get(key)!.items.push(item);
  }

  return Array.from(categories.values());
}

function normalizeFlatVideoLibraryEntry(raw: unknown): VideoLibraryItem | null {
  const entry = (raw ?? {}) as Record<string, unknown>;
  const item = normalizeVideoLibraryItem(entry);
  if (!item) return null;

  const category = String(entry.category ?? entry.categoryName ?? '').trim();
  const icon = entry.icon ? asIonicon(entry.icon, 'folder-outline') : undefined;
  const tone = entry.tone ? asTone(entry.tone) : undefined;

  return Object.assign(item, {
    ...(category ? { category } : {}),
    ...(icon ? { icon } : {}),
    ...(tone ? { tone } : {}),
  });
}

export function normalizeVideoLibrary(raw: unknown): VideoLibraryCategory[] {
  if (!Array.isArray(raw)) return [];
  if (raw.length === 0) return [];

  const first = (raw[0] ?? {}) as Record<string, unknown>;
  if (Array.isArray(first.items)) {
    return raw
      .map(normalizeVideoLibraryCategory)
      .filter((cat): cat is VideoLibraryCategory => cat !== null)
      .filter((cat) => cat.items.length > 0);
  }

  type FlatItem = VideoLibraryItem & {
    category?: string;
    icon?: IoniconName;
    tone?: VideoLibraryTone;
  };

  const flatItems = raw
    .map(normalizeFlatVideoLibraryEntry)
    .filter((item): item is FlatItem => item !== null);

  return groupFlatItems(flatItems).filter((cat) => cat.items.length > 0);
}

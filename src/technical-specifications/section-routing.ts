import type { TechnicalSectionKey } from '@/types/technical-specifications';

export const TECHNICAL_SECTION_SLUGS = [
  'personal-history',
  'eating-habits',
  'lifestyle',
  'exercise-habits',
  'daily-recall',
  'observations',
] as const;

export type TechnicalSectionSlug = (typeof TECHNICAL_SECTION_SLUGS)[number];

const SLUG_TO_KEY: Record<TechnicalSectionSlug, TechnicalSectionKey> = {
  'personal-history': 'personalHistory',
  'eating-habits': 'eatingHabits',
  lifestyle: 'lifestyle',
  'exercise-habits': 'exerciseHabits',
  'daily-recall': 'dailyRecall',
  observations: 'observations',
};

const KEY_TO_SLUG = Object.fromEntries(
  Object.entries(SLUG_TO_KEY).map(([slug, key]) => [key, slug]),
) as Record<TechnicalSectionKey, TechnicalSectionSlug>;

export function isTechnicalSectionSlug(value: string): value is TechnicalSectionSlug {
  return (TECHNICAL_SECTION_SLUGS as readonly string[]).includes(value);
}

export function sectionSlugToKey(slug: TechnicalSectionSlug): TechnicalSectionKey {
  return SLUG_TO_KEY[slug];
}

export function sectionKeyToSlug(key: TechnicalSectionKey): TechnicalSectionSlug {
  return KEY_TO_SLUG[key];
}

export function technicalSectionHref(key: TechnicalSectionKey): `/ficha-tecnica/${TechnicalSectionSlug}` {
  return `/ficha-tecnica/${sectionKeyToSlug(key)}`;
}

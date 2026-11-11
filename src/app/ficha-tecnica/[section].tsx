import { Redirect, useLocalSearchParams } from 'expo-router';

import { SectionFormScreen } from '@/components/technical-specifications/section-form-screen';
import {
  isTechnicalSectionSlug,
  sectionSlugToKey,
} from '@/technical-specifications/section-routing';

export default function FichaTecnicaSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const slug = Array.isArray(section) ? section[0] : section;

  if (!slug || !isTechnicalSectionSlug(slug)) {
    return <Redirect href="/onboarding" />;
  }

  return <SectionFormScreen section={sectionSlugToKey(slug)} />;
}

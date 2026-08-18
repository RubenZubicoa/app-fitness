import type { Ionicons } from '@expo/vector-icons';

export type CommunityStats = {
  activeMembers: number;
  weeklyWorkouts: number;
  weeklySteps: number;
};

export type CommunityHighlight = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function normalizeCommunityStats(raw: Record<string, unknown>): CommunityStats {
  return {
    activeMembers: Number(raw.activeMembers ?? 0),
    weeklyWorkouts: Number(raw.weeklyWorkouts ?? 0),
    weeklySteps: Number(raw.weeklySteps ?? raw.newPhotos ?? 0),
  };
}

export function communityStatsToHighlights(stats: CommunityStats): CommunityHighlight[] {
  return [
    {
      label: 'Miembros activos',
      value: String(stats.activeMembers),
      icon: 'people-outline',
    },
    {
      label: 'Entrenos esta semana',
      value: String(stats.weeklyWorkouts),
      icon: 'barbell-outline',
    },
    {
      label: 'Pasos esta semana',
      value: stats.weeklySteps.toLocaleString('es-ES'),
      icon: 'footsteps-outline',
    },
  ];
}

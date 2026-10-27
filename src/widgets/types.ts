export type RegenesisProgressProps = {
  isLoggedIn: boolean;
  clientName: string;
  steps: number;
  stepsGoal: number;
  stepsProgressPct: number;
  week: number;
  totalWeeks: number;
  phase: number;
  phaseName: string;
  daysLeft: number;
  programProgressPct: number;
  workoutsThisWeek: number;
  workoutsPlanned: number;
  updatedLabel: string;
  viewMode: 'overview' | 'steps' | 'plan';
};

export type RegenesisProgressConfiguration = {
  focus: 'overview' | 'steps' | 'plan';
};

export const EMPTY_REGENESIS_PROGRESS_PROPS: RegenesisProgressProps = {
  isLoggedIn: false,
  clientName: '',
  steps: 0,
  stepsGoal: 10000,
  stepsProgressPct: 0,
  week: 1,
  totalWeeks: 13,
  phase: 1,
  phaseName: 'Adaptación',
  daysLeft: 90,
  programProgressPct: 0,
  workoutsThisWeek: 0,
  workoutsPlanned: 0,
  updatedLabel: '',
  viewMode: 'overview',
};

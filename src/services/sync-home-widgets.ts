import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { getCurrentPhase, getDaysLeft, getProgramProgress } from '@/data/program';
import type { Client } from '@/types/client';
import {
  pickDailyStepsForDate,
  resolveStepsGoal,
  toISODate,
  type DailySteps,
} from '@/types/daily-steps';
import { countWorkoutsInWeek, type WorkoutHistoryEntry } from '@/types/workout-history';
import {
  EMPTY_REGENESIS_PROGRESS_PROPS,
  type RegenesisProgressProps,
} from '@/widgets/types';

export type HomeWidgetSyncInput = {
  client: Client | null;
  records: DailySteps[];
  liveSteps?: number | null;
  workoutHistory?: WorkoutHistoryEntry[];
  workoutsPlanned?: number;
};

type ProgressWidget = {
  updateSnapshot: (props: RegenesisProgressProps) => void;
  getTimeline: () => Promise<{ props: RegenesisProgressProps }[]>;
};

/** Widgets nativos no existen en Expo Go; solo en builds iOS reales. */
function canUseHomeWidgets(): boolean {
  return Platform.OS === 'ios' && !isRunningInExpoGo();
}

function loadProgressWidget(): ProgressWidget | null {
  if (!canUseHomeWidgets()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require('@/widgets/regenesis-progress') as { default: ProgressWidget }).default;
  } catch {
    return null;
  }
}

function formatUpdatedLabel(date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function buildRegenesisProgressProps(
  input: HomeWidgetSyncInput,
  viewMode: RegenesisProgressProps['viewMode'] = 'overview',
): RegenesisProgressProps {
  const { client, records, liveSteps, workoutHistory = [], workoutsPlanned = 0 } = input;

  if (!client) {
    return { ...EMPTY_REGENESIS_PROGRESS_PROPS };
  }

  const today = pickDailyStepsForDate(records, toISODate());
  const goal = resolveStepsGoal(today, records);
  const steps = Math.max(today?.steps ?? 0, liveSteps ?? 0);
  const stepsProgressPct = goal > 0 ? Math.min(100, (steps / goal) * 100) : 0;
  const programProgress = getProgramProgress(client.startDate, client.endDate);
  const phase = getCurrentPhase(client.phase);
  const workoutsThisWeek = countWorkoutsInWeek(workoutHistory, client.week, {
    startDate: client.startDate,
    endDate: client.endDate,
  });

  return {
    isLoggedIn: true,
    clientName: client.name || client.fullName || '',
    steps,
    stepsGoal: goal,
    stepsProgressPct,
    week: client.week,
    totalWeeks: client.totalWeeks,
    phase: client.phase,
    phaseName: phase.name,
    daysLeft: getDaysLeft(client.endDate),
    programProgressPct: programProgress * 100,
    workoutsThisWeek,
    workoutsPlanned,
    updatedLabel: formatUpdatedLabel(),
    viewMode,
  };
}

async function readCurrentViewMode(
  widget: ProgressWidget,
): Promise<RegenesisProgressProps['viewMode']> {
  try {
    const timeline = await widget.getTimeline();
    const latest = timeline.at(-1)?.props;
    if (latest?.viewMode === 'steps' || latest?.viewMode === 'plan' || latest?.viewMode === 'overview') {
      return latest.viewMode;
    }
  } catch {
    // ignore
  }
  return 'overview';
}

/** Empuja el snapshot al widget (solo iOS con build nativo; no-op en Expo Go). */
export function syncHomeWidgets(input: HomeWidgetSyncInput): void {
  if (!canUseHomeWidgets()) return;

  void (async () => {
    try {
      const widget = loadProgressWidget();
      if (!widget) return;
      const viewMode = input.client ? await readCurrentViewMode(widget) : 'overview';
      widget.updateSnapshot(buildRegenesisProgressProps(input, viewMode));
    } catch {
      // Stub / módulo no disponible.
    }
  })();
}

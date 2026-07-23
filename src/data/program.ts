import type { Client } from '@/types/client';

/**
 * Las 3 fases del programa de 12 semanas.
 * El avance de fase lo gestiona el entrenador; aquí solo se refleja el estado actual.
 */
export const programPhases = [
  {
    id: 1,
    name: 'Adaptación',
    description: 'Hábitos, técnica y base metabólica',
  },
  {
    id: 2,
    name: 'Progresión',
    description: 'Intensidad y ajuste del plan',
  },
  {
    id: 3,
    name: 'Optimización',
    description: 'Refino final y consolidación',
  },
] as const;

export type ProgramPhase = (typeof programPhases)[number];

/** Catálogo de programas disponibles. */
export const programs = [
  {
    id: 1,
    name: 'Nutrición',
    description: 'Plan nutricional personalizado',
  },
  {
    id: 2,
    name: 'Entrenamiento',
    description: 'Rutina y seguimiento de entrenos',
  },
  {
    id: 3,
    name: 'Nutrición + Entrenamiento',
    description: 'Programa completo de recomposición',
  },
] as const;

export type Program = (typeof programs)[number];

export function getClientProgram(programId: number): Program {
  return programs.find((p) => p.id === programId) ?? programs[0];
}

export function getCurrentPhase(phaseId: number): ProgramPhase {
  return programPhases.find((p) => p.id === phaseId) ?? programPhases[0];
}

export function getDaysLeft(endDate: string, from: Date = new Date()): number {
  const end = new Date(`${endDate}T23:59:59`);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil((end.getTime() - from.getTime()) / msPerDay);
  return Math.max(0, diff);
}

export function getPhaseFromClient(client: Pick<Client, 'phase'>): ProgramPhase {
  return getCurrentPhase(client.phase);
}

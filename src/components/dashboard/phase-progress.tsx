import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentPhase, programPhases, type ProgramPhase } from '@/data/mock';

type PhaseProgressProps = {
  /** Si true, se renderiza dentro de un Card. Por defecto true. */
  withCard?: boolean;
  /** Fase actual; por defecto la del cliente en mock. */
  currentPhaseId?: number;
};

/**
 * Indicador de las 3 fases del programa.
 * Solo lectura: el cambio de fase lo realiza el entrenador.
 */
export function PhaseProgress({ withCard = true, currentPhaseId }: PhaseProgressProps) {
  const theme = useTheme();
  const current = currentPhaseId
    ? (programPhases.find((p) => p.id === currentPhaseId) ?? getCurrentPhase())
    : getCurrentPhase();

  const content = (
    <View style={styles.body}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="label" themeColor="textMuted">
            FASE DEL PROGRAMA
          </ThemedText>
          <ThemedText type="h3">
            Fase {current.id} · {current.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {current.description}
          </ThemedText>
        </View>
        <View style={[styles.phaseBadge, { backgroundColor: theme.goldSoft }]}>
          <ThemedText type="smallBold" style={{ color: theme.gold }}>
            {current.id}/{programPhases.length}
          </ThemedText>
        </View>
      </View>

      <View style={styles.trackRow}>
        {programPhases.map((phase, index) => (
          <PhaseStep
            key={phase.id}
            phase={phase}
            currentId={current.id}
            isLast={index === programPhases.length - 1}
          />
        ))}
      </View>
    </View>
  );

  if (!withCard) return content;
  return <Card style={styles.card}>{content}</Card>;
}

function PhaseStep({
  phase,
  currentId,
  isLast,
}: {
  phase: ProgramPhase;
  currentId: number;
  isLast: boolean;
}) {
  const theme = useTheme();
  const isDone = phase.id < currentId;
  const isCurrent = phase.id === currentId;
  const isUpcoming = phase.id > currentId;

  const dotColor = isDone || isCurrent ? Brand.gold : theme.track;
  const labelColor = isCurrent ? theme.text : isDone ? theme.textSecondary : theme.textMuted;

  return (
    <View style={[styles.step, isLast && styles.stepLast]}>
      <View style={styles.stepTop}>
        <View
          style={[
            styles.dot,
            { backgroundColor: dotColor },
            isCurrent && styles.dotCurrent,
            isCurrent && { borderColor: Brand.goldLight },
          ]}
        />
        {!isLast && (
          <View
            style={[
              styles.connector,
              { backgroundColor: isDone ? Brand.gold : theme.track },
            ]}
          />
        )}
      </View>
      <ThemedText
        type={isCurrent ? 'smallBold' : 'caption'}
        style={{ color: labelColor }}
        numberOfLines={1}>
        {phase.name}
      </ThemedText>
      {isCurrent && (
        <ThemedText type="caption" style={{ color: theme.gold }}>
          Actual
        </ThemedText>
      )}
      {isUpcoming && (
        <ThemedText type="caption" themeColor="textMuted">
          Pendiente
        </ThemedText>
      )}
      {isDone && (
        <ThemedText type="caption" themeColor="textMuted">
          Completada
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
  },
  body: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  phaseBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: {
    flex: 1,
    gap: 4,
    paddingRight: Spacing.one,
  },
  stepLast: {
    paddingRight: 0,
  },
  stepTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
  },
  dotCurrent: {
    width: 16,
    height: 16,
    borderWidth: 3,
    backgroundColor: Brand.gold,
  },
  connector: {
    flex: 1,
    height: 3,
    marginLeft: 4,
    borderRadius: Radius.pill,
  },
});

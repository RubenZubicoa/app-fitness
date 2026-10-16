import {
  AccessoryWidgetBackground,
  Button,
  Gauge,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  gaugeStyle,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

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
  /** Vista activa (también se puede ciclar con el botón del widget). */
  viewMode: 'overview' | 'steps' | 'plan';
};

export type RegenesisProgressConfiguration = {
  focus: 'overview' | 'steps' | 'plan';
};

const EMPTY_PROPS: RegenesisProgressProps = {
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

function RegenesisProgressWidget(
  props: RegenesisProgressProps,
  environment: WidgetEnvironment<RegenesisProgressConfiguration>,
) {
  'widget';

  const navy = '#0A1B33';
  const gold = '#E4A93C';
  const blue = '#1863DC';
  const muted = '#8A98AE';
  const white = '#FFFFFF';

  const formatSteps = (value: number) => {
    const n = Math.max(0, Math.round(value));
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const clampPct = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
  const stepsPct = clampPct(props.stepsProgressPct);
  const programPct = clampPct(props.programProgressPct);
  const stepsRatio = stepsPct / 100;
  const programRatio = programPct / 100;

  // Preferencia al editar el widget; el botón «Cambiar vista» puede sobreescribirla.
  const configFocus = environment.configuration?.focus ?? 'overview';
  const mode = props.viewMode !== 'overview' ? props.viewMode : configFocus;
  const family = environment.widgetFamily;
  const isDark = environment.colorScheme === 'dark';
  const subtitleColor = isDark ? '#C5D0E0' : muted;

  const nextMode =
    mode === 'overview' ? 'steps' : mode === 'steps' ? 'plan' : 'overview';

  const cycleButton = (
    <Button
      label="Cambiar vista"
      systemImage="arrow.triangle.2.circlepath"
      target="cycleView"
      onPress={() => ({ ...props, viewMode: nextMode })}
    />
  );

  if (!props.isLoggedIn) {
    return (
      <VStack
        spacing={6}
        modifiers={[
          padding({ all: 14 }),
          containerBackground(navy, 'widget'),
          widgetURL('regenesis://'),
        ]}>
        <Image systemName="figure.run" size={22} color={gold} />
        <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(white)]}>
          Regenesis
        </Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle('#C5D0E0')]}>
          Abre la app e inicia sesión para ver tus pasos, semana y progreso.
        </Text>
      </VStack>
    );
  }

  if (family === 'accessoryCircular') {
    const ratio = mode === 'plan' ? programRatio : stepsRatio;
    const label = mode === 'plan' ? `${programPct}%` : `${stepsPct}%`;
    return (
      <VStack alignment="center" modifiers={[widgetURL('regenesis://home')]}>
        <AccessoryWidgetBackground />
        <Gauge
          value={ratio}
          min={0}
          max={1}
          modifiers={[gaugeStyle('circularCapacity'), foregroundStyle(gold)]}>
          <Text modifiers={[font({ weight: 'bold', size: 12 })]}>{label}</Text>
        </Gauge>
      </VStack>
    );
  }

  if (family === 'accessoryInline') {
    return (
      <Text>
        {mode === 'plan'
          ? `S${props.week}/${props.totalWeeks} · ${props.daysLeft}d`
          : `${formatSteps(props.steps)} / ${formatSteps(props.stepsGoal)}`}
      </Text>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack spacing={2} modifiers={[widgetURL('regenesis://home')]}>
        <AccessoryWidgetBackground />
        <Text modifiers={[font({ weight: 'semibold', size: 12 })]}>
          {props.clientName || 'Regenesis'}
        </Text>
        <Text modifiers={[font({ size: 11 })]}>
          {formatSteps(props.steps)} pasos · Sem {props.week}
        </Text>
        <Text modifiers={[font({ size: 11 })]}>
          {props.daysLeft} días · Fase {props.phase}
        </Text>
      </VStack>
    );
  }

  if (family === 'systemSmall') {
    const ratio = mode === 'plan' ? programRatio : stepsRatio;
    const main = mode === 'plan' ? `${props.daysLeft}d` : formatSteps(props.steps);
    const sub =
      mode === 'plan' ? `Semana ${props.week}/${props.totalWeeks}` : `${stepsPct}% del objetivo`;

    return (
      <VStack
        spacing={8}
        alignment="center"
        modifiers={[
          padding({ all: 12 }),
          containerBackground(navy, 'widget'),
          widgetURL('regenesis://home'),
        ]}>
        <Gauge
          value={ratio}
          min={0}
          max={1}
          modifiers={[gaugeStyle('circularCapacity'), foregroundStyle(gold)]}>
          <Text modifiers={[font({ weight: 'bold', size: 16 }), foregroundStyle(white)]}>
            {main}
          </Text>
        </Gauge>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(subtitleColor)]}>{sub}</Text>
      </VStack>
    );
  }

  if (mode === 'steps') {
    return (
      <VStack
        spacing={10}
        modifiers={[
          padding({ all: 14 }),
          containerBackground(navy, 'widget'),
          widgetURL('regenesis://home'),
        ]}>
        <HStack>
          <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(white)]}>
            Pasos de hoy
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle(subtitleColor)]}>
            {props.updatedLabel}
          </Text>
        </HStack>
        <HStack spacing={12} alignment="center">
          <Gauge
            value={stepsRatio}
            min={0}
            max={1}
            modifiers={[gaugeStyle('circularCapacity'), foregroundStyle(gold)]}>
            <Text modifiers={[font({ weight: 'bold', size: 14 }), foregroundStyle(white)]}>
              {stepsPct}%
            </Text>
          </Gauge>
          <VStack spacing={4} alignment="leading">
            <Text modifiers={[font({ weight: 'bold', size: 22 }), foregroundStyle(white)]}>
              {formatSteps(props.steps)}
            </Text>
            <Text modifiers={[font({ size: 12 }), foregroundStyle(subtitleColor)]}>
              Objetivo {formatSteps(props.stepsGoal)}
            </Text>
          </VStack>
        </HStack>
        {family === 'systemLarge' || family === 'systemExtraLarge' ? cycleButton : null}
      </VStack>
    );
  }

  if (mode === 'plan') {
    return (
      <VStack
        spacing={10}
        modifiers={[
          padding({ all: 14 }),
          containerBackground(navy, 'widget'),
          widgetURL('regenesis://home'),
        ]}>
        <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(white)]}>
          Tu Método Regenesis
        </Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(subtitleColor)]}>
          Fase {props.phase} · {props.phaseName}
        </Text>
        <HStack spacing={12} alignment="center">
          <Gauge
            value={programRatio}
            min={0}
            max={1}
            modifiers={[gaugeStyle('circularCapacity'), foregroundStyle(blue)]}>
            <Text modifiers={[font({ weight: 'bold', size: 14 }), foregroundStyle(white)]}>
              {programPct}%
            </Text>
          </Gauge>
          <VStack spacing={4} alignment="leading">
            <Text modifiers={[font({ weight: 'bold', size: 20 }), foregroundStyle(white)]}>
              Semana {props.week}/{props.totalWeeks}
            </Text>
            <Text modifiers={[font({ size: 12 }), foregroundStyle(subtitleColor)]}>
              {props.daysLeft} días restantes
            </Text>
            <Text modifiers={[font({ size: 12 }), foregroundStyle(subtitleColor)]}>
              Entrenos {props.workoutsThisWeek}/{props.workoutsPlanned || '—'}
            </Text>
          </VStack>
        </HStack>
        {family === 'systemLarge' || family === 'systemExtraLarge' ? cycleButton : null}
      </VStack>
    );
  }

  return (
    <VStack
      spacing={10}
      modifiers={[
        padding({ all: 14 }),
        containerBackground(navy, 'widget'),
        widgetURL('regenesis://home'),
      ]}>
      <HStack alignment="center">
        <VStack spacing={2} alignment="leading">
          <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(white)]}>
            Hola, {props.clientName || 'atleta'}
          </Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(subtitleColor)]}>
            Fase {props.phase} · Semana {props.week}/{props.totalWeeks}
          </Text>
        </VStack>
        <Spacer />
        <Image systemName="flame.fill" size={18} color={gold} />
      </HStack>

      <HStack spacing={14} alignment="center">
        <VStack spacing={4} alignment="center">
          <Gauge
            value={stepsRatio}
            min={0}
            max={1}
            modifiers={[gaugeStyle('circularCapacity'), foregroundStyle(gold)]}>
            <Text modifiers={[font({ weight: 'bold', size: 12 }), foregroundStyle(white)]}>
              {stepsPct}%
            </Text>
          </Gauge>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(white)]}>
            {formatSteps(props.steps)}
          </Text>
          <Text modifiers={[font({ size: 10 }), foregroundStyle(subtitleColor)]}>pasos</Text>
        </VStack>

        <VStack spacing={4} alignment="leading">
          <Text modifiers={[font({ size: 12 }), foregroundStyle(subtitleColor)]}>
            Objetivo {formatSteps(props.stepsGoal)}
          </Text>
          <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle(white)]}>
            {props.daysLeft} días para completar
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(subtitleColor)]}>
            Plan {programPct}% · Entrenos {props.workoutsThisWeek}/
            {props.workoutsPlanned || '—'}
          </Text>
          {props.updatedLabel ? (
            <Text modifiers={[font({ size: 10 }), foregroundStyle(subtitleColor)]}>
              Actualizado {props.updatedLabel}
            </Text>
          ) : null}
        </VStack>
      </HStack>

      {family === 'systemLarge' || family === 'systemExtraLarge' ? (
        <VStack spacing={8}>
          <Gauge
            value={programRatio}
            min={0}
            max={1}
            currentValueLabel={
              <Text modifiers={[font({ size: 11 }), foregroundStyle(white)]}>{programPct}%</Text>
            }
            modifiers={[gaugeStyle('linearCapacity'), foregroundStyle(blue)]}
          />
          {cycleButton}
        </VStack>
      ) : null}
    </VStack>
  );
}

const RegenesisProgress = createWidget<
  RegenesisProgressProps,
  RegenesisProgressConfiguration
>('RegenesisProgress', RegenesisProgressWidget);

export function getEmptyRegenesisProgressProps(): RegenesisProgressProps {
  return { ...EMPTY_PROPS };
}

export default RegenesisProgress;

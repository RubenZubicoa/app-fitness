import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BarChart, type BarDatum } from '@/components/charts/bar-chart';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useDailySteps } from '@/context/daily-steps-context';
import { useTheme } from '@/hooks/use-theme';
import { getTodayWeekdayIndex } from '@/types/daily-steps';

function formatSteps(value: number) {
  return value.toLocaleString('es-ES');
}

/** Tarjeta de pasos diarios con registro y gráfico semanal. */
export function DailyStepsCard() {
  const theme = useTheme();
  const { client } = useClient();
  const { current: steps, loading, error } = useDailySteps();
  const todayIndex = getTodayWeekdayIndex();
  const weekLabel = client?.week ?? steps?.week ?? '—';

  const [weekValues, setWeekValues] = useState<number[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!steps) {
      setWeekValues([]);
      setInput('');
      return;
    }
    const values = steps.days.map((d) => d.value);
    setWeekValues(values);
    const today = values[todayIndex] ?? 0;
    setInput(today > 0 ? String(today) : '');
  }, [steps, todayIndex]);

  const todaySteps = weekValues[todayIndex] ?? 0;
  const goal = steps?.goal ?? 0;
  const progress = goal > 0 ? Math.min(todaySteps / goal, 1) : 0;
  const goalReached = goal > 0 && todaySteps >= goal;

  const chartData: BarDatum[] = useMemo(
    () =>
      (steps?.days ?? []).map((day, i) => ({
        label: day.label,
        value: weekValues[i] ?? 0,
        highlight: true,
      })),
    [steps?.days, weekValues],
  );

  const chartMax = Math.max(goal, ...weekValues, 1);

  const registerSteps = () => {
    const parsed = Number(input.replace(/\D/g, ''));
    if (!parsed || Number.isNaN(parsed)) return;

    setWeekValues((prev) => {
      const next = [...prev];
      next[todayIndex] = parsed;
      return next;
    });
    setInput(String(parsed));
  };

  if (loading) {
    return (
      <Card style={styles.card}>
        <ThemedText type="body" themeColor="textSecondary">
          Cargando pasos…
        </ThemedText>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.card}>
        <ThemedText type="body" themeColor="textSecondary">
          {error}
        </ThemedText>
      </Card>
    );
  }

  if (!steps) {
    return (
      <Card style={styles.card}>
        <ThemedText type="body" themeColor="textSecondary">
          Aún no hay registros de pasos.
        </ThemedText>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge name="footsteps" color={theme.teal} background={theme.primarySoft} size={42} />
        <View style={styles.headerInfo}>
          <ThemedText type="h3">{formatSteps(todaySteps)} pasos</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Hoy · semana {weekLabel} · objetivo {formatSteps(goal)}
          </ThemedText>
        </View>
        <Badge
          label={goalReached ? 'Meta lograda' : `${Math.round(progress * 100)}%`}
          tone={goalReached ? 'success' : 'teal'}
        />
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.track }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: goalReached ? theme.success : theme.teal,
            },
          ]}
        />
      </View>

      <View style={styles.inputRow}>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <ThemedText type="caption" themeColor="textMuted">
            Registrar hoy
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ej. 8500"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={registerSteps}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: theme.teal },
            pressed && styles.pressed,
          ]}
          onPress={registerSteps}>
          <ThemedText type="smallBold" style={styles.saveBtnText}>
            Guardar
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.chartHeader}>
        <ThemedText type="label" themeColor="textMuted">
          Semana {weekLabel}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Media{' '}
          {formatSteps(
            Math.round(
              weekValues.reduce((a, b) => a + b, 0) /
                (weekValues.filter((v) => v > 0).length || 1),
            ),
          )}
        </ThemedText>
      </View>

      <BarChart
        data={chartData}
        height={150}
        max={chartMax}
        colors={Brand.gradientGold}
        allHighlighted
        unit="pasos"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerInfo: { flex: 1, gap: 2 },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  inputWrap: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: 2,
  },
  input: {
    fontSize: 20,
    fontWeight: '800',
    padding: 0,
    minHeight: 28,
  },
  saveBtn: {
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.75 },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

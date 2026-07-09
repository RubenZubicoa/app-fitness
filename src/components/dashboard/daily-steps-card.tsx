import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BarChart, type BarDatum } from '@/components/charts/bar-chart';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { dailySteps as dailyStepsMock } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';

function formatSteps(value: number) {
  return value.toLocaleString('es-ES');
}

/** Tarjeta de pasos diarios con registro y gráfico semanal (solo UI). */
export function DailyStepsCard() {
  const theme = useTheme();
  const [weekValues, setWeekValues] = useState(() => dailyStepsMock.week.map((d) => d.value));
  const todayIndex = dailyStepsMock.todayIndex;
  const todaySteps = weekValues[todayIndex] ?? 0;
  const goal = dailyStepsMock.goal;

  const [input, setInput] = useState(todaySteps > 0 ? String(todaySteps) : '');

  const progress = Math.min(todaySteps / goal, 1);
  const goalReached = todaySteps >= goal;

  const chartData: BarDatum[] = useMemo(
    () =>
      dailyStepsMock.week.map((day, i) => ({
        label: day.label,
        value: weekValues[i] ?? 0,
        highlight: i === todayIndex || (weekValues[i] ?? 0) >= goal,
      })),
    [weekValues, todayIndex, goal],
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

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconBadge name="footsteps" color={theme.teal} background={theme.primarySoft} size={42} />
        <View style={styles.headerInfo}>
          <ThemedText type="h3">{formatSteps(todaySteps)} pasos</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Hoy · objetivo {formatSteps(goal)}
          </ThemedText>
        </View>
        <Badge label={goalReached ? 'Meta lograda' : `${Math.round(progress * 100)}%`} tone={goalReached ? 'success' : 'teal'} />
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
          Esta semana
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Media {formatSteps(Math.round(weekValues.reduce((a, b) => a + b, 0) / weekValues.filter((v) => v > 0).length || 1))}
        </ThemedText>
      </View>

      <BarChart data={chartData} height={150} max={chartMax} colors={Brand.gradientTeal} />
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

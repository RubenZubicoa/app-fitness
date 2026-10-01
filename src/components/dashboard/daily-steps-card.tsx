import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BarChart, type BarDatum } from '@/components/charts/bar-chart';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { ShareInCommunityToggle } from '@/components/ui/share-in-community-toggle';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useDailySteps } from '@/context/daily-steps-context';
import { useTheme } from '@/hooks/use-theme';
import {
  buildCurrentWeekBars,
  resolveStepsGoal,
  toISODate,
} from '@/types/daily-steps';

function formatSteps(value: number) {
  return value.toLocaleString('es-ES');
}

/** Tarjeta de pasos diarios con registro y gráfico semanal. */
export function DailyStepsCard() {
  const theme = useTheme();
  const {
    records,
    current,
    loading,
    saving,
    error,
    saveTodaySteps,
  } = useDailySteps();

  const weekBars = useMemo(() => buildCurrentWeekBars(records), [records]);
  const todayIso = toISODate();
  const goal = resolveStepsGoal(current, records);

  const [input, setInput] = useState('');
  const [shareInCommunity, setShareInCommunity] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const today = current?.steps ?? 0;
    setInput(today > 0 ? String(today) : '');
  }, [current]);

  const todaySteps = current?.steps ?? 0;
  const progress = goal > 0 ? Math.min(todaySteps / goal, 1) : 0;
  const goalReached = goal > 0 && todaySteps >= goal;

  const chartData: BarDatum[] = useMemo(
    () =>
      weekBars.map((day) => ({
        label: day.label,
        value: day.value,
        highlight: day.date === todayIso,
      })),
    [weekBars, todayIso],
  );

  const weekValues = weekBars.map((d) => d.value);
  const chartMax = Math.max(goal, ...weekValues, 1);
  const daysWithSteps = weekValues.filter((v) => v > 0).length;

  const registerSteps = async () => {
    const parsed = Number(input.replace(/\D/g, ''));
    if (!parsed || Number.isNaN(parsed) || saving) return;

    setSaveError(null);
    try {
      await saveTodaySteps(parsed, shareInCommunity);
      setInput(String(parsed));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudieron guardar los pasos');
    }
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

  if (error && records.length === 0) {
    return (
      <Card style={styles.card}>
        <ThemedText type="body" themeColor="textSecondary">
          {error}
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
            Hoy · objetivo {formatSteps(goal)}
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
            onSubmitEditing={() => {
              void registerSteps();
            }}
            editable={!saving}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: theme.teal, opacity: saving ? 0.6 : 1 },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            void registerSteps();
          }}
          disabled={saving}>
          <ThemedText type="smallBold" style={styles.saveBtnText}>
            {saving ? '…' : 'Guardar'}
          </ThemedText>
        </Pressable>
      </View>

      {saveError ? (
        <ThemedText type="caption" themeColor="textSecondary">
          {saveError}
        </ThemedText>
      ) : null}

      <ShareInCommunityToggle
        value={shareInCommunity}
        onChange={setShareInCommunity}
        disabled={saving}
      />

      <View style={styles.chartHeader}>
        <ThemedText type="label" themeColor="textMuted">
          Esta semana
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Media{' '}
          {formatSteps(
            daysWithSteps > 0
              ? Math.round(weekValues.reduce((a, b) => a + b, 0) / daysWithSteps)
              : 0,
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

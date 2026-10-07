import { useMemo, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { BarChart, type BarDatum } from '@/components/charts/bar-chart';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

/** Tarjeta de pasos diarios con recuento automático y gráfico semanal. */
export function DailyStepsCard() {
  const theme = useTheme();
  const {
    records,
    current,
    liveSteps,
    pedometerStatus,
    loading,
    saving,
    error,
    saveTodaySteps,
    requestPedometerAccess,
  } = useDailySteps();

  const weekBars = useMemo(() => buildCurrentWeekBars(records), [records]);
  const todayIso = toISODate();
  const goal = resolveStepsGoal(current, records);
  const [shareInCommunity, setShareInCommunity] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const todaySteps = liveSteps ?? current?.steps ?? 0;
  const progress = goal > 0 ? Math.min(todaySteps / goal, 1) : 0;
  const goalReached = goal > 0 && todaySteps >= goal;

  const chartData: BarDatum[] = useMemo(
    () =>
      weekBars.map((day) => ({
        label: day.label,
        value: day.date === todayIso ? Math.max(day.value, todaySteps) : day.value,
        highlight: day.date === todayIso,
      })),
    [weekBars, todayIso, todaySteps],
  );

  const weekValues = chartData.map((d) => d.value);
  const chartMax = Math.max(goal, ...weekValues, 1);
  const daysWithSteps = weekValues.filter((v) => v > 0).length;

  const updateShare = async (value: boolean) => {
    setShareInCommunity(value);
    if (todaySteps <= 0) return;
    setSaveError(null);
    try {
      await saveTodaySteps(todaySteps, value);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo actualizar el recuento');
    }
  };

  if (loading && records.length === 0 && liveSteps == null) {
    return (
      <Card style={styles.card}>
        <ThemedText type="body" themeColor="textSecondary">
          Cargando pasos…
        </ThemedText>
      </Card>
    );
  }

  if (error && records.length === 0 && liveSteps == null) {
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

      {pedometerStatus === 'tracking' ? (
        <ThemedText type="caption" themeColor="textSecondary">
          {Platform.OS === 'android'
            ? 'Recuento activo en segundo plano. Mantén la notificación de Regenesis para que siga contando con la app cerrada.'
            : 'Recuento automático activo. Al reabrir la app se sincronizan los pasos dados mientras estaba cerrada.'}
        </ThemedText>
      ) : null}

      {pedometerStatus === 'denied' ? (
        <View style={styles.permissionBox}>
          <ThemedText type="small" themeColor="textSecondary">
            Necesitamos permiso de actividad física para contar tus pasos.
          </ThemedText>
          <Button
            title="Permitir recuento"
            icon="walk-outline"
            variant="secondary"
            onPress={() => {
              void requestPedometerAccess();
            }}
          />
          <Button
            title="Abrir ajustes"
            icon="settings-outline"
            variant="ghost"
            onPress={() => {
              void Linking.openSettings();
            }}
          />
        </View>
      ) : null}

      {pedometerStatus === 'unavailable' ? (
        <ThemedText type="caption" themeColor="textSecondary">
          {Platform.OS === 'web'
            ? 'El recuento automático está disponible en iOS y Android.'
            : 'Este dispositivo no tiene sensor de pasos. El recuento se actualizará cuando esté disponible.'}
        </ThemedText>
      ) : null}

      {saveError ? (
        <ThemedText type="caption" themeColor="textSecondary">
          {saveError}
        </ThemedText>
      ) : null}

      <ShareInCommunityToggle
        value={shareInCommunity}
        onChange={(value) => {
          void updateShare(value);
        }}
        disabled={saving || todaySteps <= 0}
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
  permissionBox: { gap: Spacing.two },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

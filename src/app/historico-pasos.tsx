import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useDailySteps } from '@/context/daily-steps-context';
import { useTheme } from '@/hooks/use-theme';
import {
  buildDailyStepsHistory,
  buildDailyStepsListRows,
  filterDailyStepsByDateRange,
  formatDailyStepsDate,
  resolveStepsGoal,
  shiftISODate,
  toISODate,
  weekdayShortFromISO,
} from '@/types/daily-steps';

function formatSteps(value: number) {
  return value.toLocaleString('es-ES');
}

type PresetKey = '7d' | '30d' | 'month' | 'all' | 'custom';

function rangeForPreset(preset: PresetKey): { from: string | null; to: string | null } {
  const today = toISODate();
  if (preset === '7d') return { from: shiftISODate(today, -6), to: today };
  if (preset === '30d') return { from: shiftISODate(today, -29), to: today };
  if (preset === 'month') {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { from, to: today };
  }
  return { from: null, to: null };
}

export default function HistoricoPasosScreen() {
  const theme = useTheme();
  const { records, loading, saving, error, saveStepsForDate } = useDailySteps();

  const [preset, setPreset] = useState<PresetKey>('30d');
  const [fromInput, setFromInput] = useState(() => rangeForPreset('30d').from ?? '');
  const [toInput, setToInput] = useState(() => rangeForPreset('30d').to ?? '');

  const activeRange = useMemo(() => {
    if (preset === 'custom') {
      return {
        from: fromInput.trim().slice(0, 10) || null,
        to: toInput.trim().slice(0, 10) || null,
      };
    }
    return rangeForPreset(preset);
  }, [preset, fromInput, toInput]);

  const filtered = useMemo(
    () => filterDailyStepsByDateRange(records, activeRange),
    [records, activeRange],
  );

  const listRows = useMemo(
    () => buildDailyStepsListRows(records, activeRange),
    [records, activeRange],
  );

  const history = useMemo(
    () => buildDailyStepsHistory(filtered),
    [filtered],
  );

  const chartData = history.map((point) => point.value);
  const chartLabels = history.map((point) => point.label);
  const chartGoal = Math.max(
    ...filtered.map((r) => r.goal ?? 0),
    resolveStepsGoal(null, records),
    0,
  );

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const todayIso = toISODate();
  const total = listRows.reduce((sum, row) => sum + row.steps, 0);
  const daysWithSteps = listRows.filter((row) => row.steps > 0).length;
  const average = daysWithSteps > 0 ? Math.round(total / daysWithSteps) : 0;

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    if (key !== 'custom') {
      const range = rangeForPreset(key);
      setFromInput(range.from ?? '');
      setToInput(range.to ?? '');
    }
    setEditingDate(null);
    setSaveError(null);
  };

  const startEdit = (date: string, currentValue: number) => {
    setEditingDate(date);
    setEditValue(currentValue > 0 ? String(currentValue) : '');
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingDate(null);
    setEditValue('');
    setSaveError(null);
  };

  const saveEdit = async (date: string) => {
    const parsed = Number(editValue.replace(/\D/g, ''));
    if (Number.isNaN(parsed) || parsed < 0) {
      setSaveError('Introduce un número de pasos válido');
      return;
    }

    try {
      await saveStepsForDate(date, parsed);
      cancelEdit();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudieron guardar los pasos');
    }
  };

  const presets: { key: PresetKey; label: string }[] = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: 'month', label: 'Este mes' },
    { key: 'all', label: 'Todo' },
    { key: 'custom', label: 'Personalizado' },
  ];

  const rangeLabel =
    activeRange.from && activeRange.to
      ? `${formatDailyStepsDate(activeRange.from)} – ${formatDailyStepsDate(activeRange.to)}`
      : activeRange.from
        ? `Desde ${formatDailyStepsDate(activeRange.from)}`
        : activeRange.to
          ? `Hasta ${formatDailyStepsDate(activeRange.to)}`
          : 'Todas las fechas';

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Actividad diaria"
          title="Histórico de pasos"
          subtitle="Consulta tu evolución y registra o edita cualquier día"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      {loading ? (
        <Card>
          <ThemedText type="body" themeColor="textSecondary">
            Cargando histórico…
          </ThemedText>
        </Card>
      ) : error && records.length === 0 ? (
        <Card>
          <ThemedText type="body" themeColor="textSecondary">
            {error}
          </ThemedText>
        </Card>
      ) : records.length === 0 ? (
        <Card>
          <ThemedText type="body" themeColor="textSecondary">
            Aún no hay registros de pasos.
          </ThemedText>
        </Card>
      ) : (
        <>
          <View>
            <SectionHeader title="Filtro de fechas" />
            <View style={styles.weekChips}>
              {presets.map(({ key, label }) => {
                const active = preset === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => applyPreset(key)}
                    style={[
                      styles.weekChip,
                      {
                        backgroundColor: active ? theme.primary : theme.backgroundElement,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {preset === 'custom' ? (
              <Card style={styles.rangeCard}>
                <View style={styles.rangeRow}>
                  <View style={styles.rangeField}>
                    <ThemedText type="caption" themeColor="textMuted">
                      Desde (AAAA-MM-DD)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.rangeInput,
                        {
                          color: theme.text,
                          borderColor: theme.border,
                          backgroundColor: theme.backgroundElement,
                        },
                      ]}
                      value={fromInput}
                      onChangeText={setFromInput}
                      placeholder="2026-09-01"
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <View style={styles.rangeField}>
                    <ThemedText type="caption" themeColor="textMuted">
                      Hasta (AAAA-MM-DD)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.rangeInput,
                        {
                          color: theme.text,
                          borderColor: theme.border,
                          backgroundColor: theme.backgroundElement,
                        },
                      ]}
                      value={toInput}
                      onChangeText={setToInput}
                      placeholder={todayIso}
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </Card>
            ) : null}
          </View>

          <View>
            <SectionHeader title="Evolución" />
            <Card style={styles.chartCard}>
              {history.length === 0 ? (
                <ThemedText type="body" themeColor="textSecondary">
                  No hay datos en el rango seleccionado.
                </ThemedText>
              ) : (
                <>
                  <View style={styles.chartMeta}>
                    <ThemedText type="label" themeColor="textMuted" style={styles.rangeLabel}>
                      {rangeLabel}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      Media {formatSteps(average)} · {history.length} días
                    </ThemedText>
                  </View>
                  <LineChart
                    data={chartData}
                    labels={chartLabels}
                    showAxisLabels={false}
                    height={200}
                    color={theme.teal}
                    unit="pasos"
                  />
                </>
              )}
            </Card>
          </View>

          <View>
            <SectionHeader title="Registros" />
            {listRows.length === 0 ? (
              <Card>
                <ThemedText type="body" themeColor="textSecondary">
                  No hay registros en este periodo.
                </ThemedText>
              </Card>
            ) : (
              <Card style={styles.weekCard}>
                <View style={styles.weekHeader}>
                  <View style={styles.weekHeaderInfo}>
                    <ThemedText type="h3">Detalle diario</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {rangeLabel} · total {formatSteps(total)} · media{' '}
                      {formatSteps(average)}
                    </ThemedText>
                  </View>
                  <Badge label={`Meta ${formatSteps(chartGoal)}`} tone="teal" />
                </View>

                <View style={styles.daysList}>
                  {listRows.map((row) => {
                    const isEditing = editingDate === row.date;
                    const isToday = row.date === todayIso;
                    const hasValue = row.steps > 0;

                    return (
                      <View
                        key={row.date}
                        style={[styles.dayRow, { borderTopColor: theme.border }]}>
                        <View style={styles.dayInfo}>
                          <View style={styles.dayTitleRow}>
                            <ThemedText type="smallBold">
                              {weekdayShortFromISO(row.date)} ·{' '}
                              {formatDailyStepsDate(row.date)}
                            </ThemedText>
                            {isToday ? <Badge label="Hoy" tone="gold" /> : null}
                          </View>
                          {!isEditing ? (
                            <ThemedText type="body" themeColor="textSecondary">
                              {hasValue
                                ? `${formatSteps(row.steps)} pasos`
                                : 'Sin registrar'}
                              {row.goal != null && row.goal > 0
                                ? ` · meta ${formatSteps(row.goal)}`
                                : ''}
                            </ThemedText>
                          ) : (
                            <TextInput
                              style={[
                                styles.dayInput,
                                {
                                  color: theme.text,
                                  borderColor: theme.border,
                                  backgroundColor: theme.backgroundElement,
                                },
                              ]}
                              value={editValue}
                              onChangeText={setEditValue}
                              placeholder="Ej. 8500"
                              placeholderTextColor={theme.textMuted}
                              keyboardType="number-pad"
                              editable={!saving}
                              autoFocus
                            />
                          )}
                        </View>

                        {!isEditing ? (
                          <Pressable
                            style={({ pressed }) => [
                              styles.editBtn,
                              { backgroundColor: theme.primarySoft },
                              pressed && styles.pressed,
                            ]}
                            onPress={() => startEdit(row.date, row.steps)}>
                            <Ionicons
                              name={hasValue ? 'create-outline' : 'add-outline'}
                              size={18}
                              color={theme.primary}
                            />
                            <ThemedText type="smallBold" themeColor="primary">
                              {hasValue ? 'Editar' : 'Añadir'}
                            </ThemedText>
                          </Pressable>
                        ) : (
                          <View style={styles.editActions}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.backgroundElement },
                                pressed && styles.pressed,
                              ]}
                              onPress={cancelEdit}
                              disabled={saving}>
                              <Ionicons name="close" size={18} color={theme.textMuted} />
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.teal, opacity: saving ? 0.6 : 1 },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => {
                                void saveEdit(row.date);
                              }}
                              disabled={saving}>
                              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {saveError ? (
                  <ThemedText type="caption" themeColor="textSecondary">
                    {saveError}
                  </ThemedText>
                ) : null}

                {editingDate ? (
                  <Button
                    title={saving ? 'Guardando…' : 'Guardar cambios'}
                    icon="checkmark-done"
                    onPress={() => {
                      void saveEdit(editingDate);
                    }}
                    disabled={saving}
                  />
                ) : null}
              </Card>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chartCard: { gap: Spacing.two },
  chartMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rangeLabel: { flex: 1 },
  rangeCard: { marginBottom: Spacing.three, gap: Spacing.two },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rangeField: { flex: 1, gap: Spacing.one },
  rangeInput: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    fontSize: 15,
    fontWeight: '600',
  },
  weekChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  weekChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  weekCard: { gap: Spacing.three },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  weekHeaderInfo: { flex: 1, gap: 2 },
  daysList: { gap: 0 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dayInfo: { flex: 1, gap: Spacing.one },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  dayInput: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});

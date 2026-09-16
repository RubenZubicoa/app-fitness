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
import { useClient } from '@/context/client-context';
import { useDailySteps } from '@/context/daily-steps-context';
import { useTheme } from '@/hooks/use-theme';
import {
  buildDailyStepsHistory,
  getTodayWeekdayIndex,
  sortDailyStepsByWeek,
} from '@/types/daily-steps';

function formatSteps(value: number) {
  return value.toLocaleString('es-ES');
}

export default function HistoricoPasosScreen() {
  const theme = useTheme();
  const { client } = useClient();
  const { records, loading, saving, error, saveDaySteps } = useDailySteps();

  const weeksDesc = useMemo(
    () => [...sortDailyStepsByWeek(records)].reverse(),
    [records],
  );

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [chartWeekFilter, setChartWeekFilter] = useState<number | null>(null);
  const activeWeek =
    selectedWeek ??
    (client?.week != null && weeksDesc.some((r) => r.week === client.week)
      ? client.week
      : weeksDesc[0]?.week ?? null);

  const activeRecord = weeksDesc.find((r) => r.week === activeWeek) ?? null;
  const history = useMemo(() => buildDailyStepsHistory(records), [records]);

  const chartHistory = useMemo(() => {
    if (chartWeekFilter == null) return history;
    return history.filter((point) => point.week === chartWeekFilter);
  }, [history, chartWeekFilter]);

  const chartData = chartHistory.map((point) => point.value);
  const chartLabels = chartHistory.map((point) =>
    chartWeekFilter == null ? point.label : point.label.replace(/^S\d+\s+/, ''),
  );
  const chartGoal =
    chartWeekFilter == null
      ? Math.max(...records.map((r) => r.goal), 0)
      : (weeksDesc.find((r) => r.week === chartWeekFilter)?.goal ?? 0);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const todayIndex = getTodayWeekdayIndex();
  const isCurrentClientWeek = activeWeek === client?.week;

  const startEdit = (recordId: string, dayIndex: number, currentValue: number) => {
    setEditingKey(`${recordId}:${dayIndex}`);
    setEditValue(currentValue > 0 ? String(currentValue) : '');
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
    setSaveError(null);
  };

  const saveEdit = async (recordId: string, dayIndex: number) => {
    const parsed = Number(editValue.replace(/\D/g, ''));
    if (Number.isNaN(parsed) || parsed < 0) {
      setSaveError('Introduce un número de pasos válido');
      return;
    }

    try {
      await saveDaySteps(recordId, dayIndex, parsed);
      cancelEdit();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudieron guardar los pasos');
    }
  };

  const weekTotal = activeRecord?.days.reduce((sum, day) => sum + day.value, 0) ?? 0;
  const daysWithSteps = activeRecord?.days.filter((day) => day.value > 0).length ?? 0;
  const weekAverage =
    daysWithSteps > 0 ? Math.round(weekTotal / daysWithSteps) : 0;

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
      ) : error ? (
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
            <SectionHeader title="Evolución" />
            <View style={styles.weekChips}>
              <Pressable
                onPress={() => setChartWeekFilter(null)}
                style={[
                  styles.weekChip,
                  {
                    backgroundColor:
                      chartWeekFilter == null ? theme.primary : theme.backgroundElement,
                    borderColor: chartWeekFilter == null ? theme.primary : theme.border,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{
                    color: chartWeekFilter == null ? theme.onPrimary : theme.textSecondary,
                  }}>
                  Todas
                </ThemedText>
              </Pressable>
              {weeksDesc.map((record) => {
                const active = chartWeekFilter === record.week;
                return (
                  <Pressable
                    key={`chart-${record._id}`}
                    onPress={() => setChartWeekFilter(record.week)}
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
                      Semana {record.week}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <Card style={styles.chartCard}>
              {chartHistory.length === 0 ? (
                <ThemedText type="body" themeColor="textSecondary">
                  No hay datos para el gráfico.
                </ThemedText>
              ) : (
                <>
                  <View style={styles.chartMeta}>
                    <ThemedText type="label" themeColor="textMuted">
                      {chartWeekFilter == null
                        ? 'Todas las semanas'
                        : `Semana ${chartWeekFilter}`}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      Objetivo {formatSteps(chartGoal)} · {chartHistory.length} días
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
            <SectionHeader title="Editar por semana" />
            <View style={styles.weekChips}>
              {weeksDesc.map((record) => {
                const active = record.week === activeWeek;
                return (
                  <Pressable
                    key={record._id}
                    onPress={() => setSelectedWeek(record.week)}
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
                      Semana {record.week}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {activeRecord ? (
              <Card style={styles.weekCard}>
                <View style={styles.weekHeader}>
                  <View style={styles.weekHeaderInfo}>
                    <ThemedText type="h3">Semana {activeRecord.week}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Total {formatSteps(weekTotal)} · media {formatSteps(weekAverage)}
                    </ThemedText>
                  </View>
                  <Badge
                    label={`Meta ${formatSteps(activeRecord.goal)}`}
                    tone="teal"
                  />
                </View>

                <View style={styles.daysList}>
                  {activeRecord.days.map((day, dayIndex) => {
                    const key = `${activeRecord._id}:${dayIndex}`;
                    const isEditing = editingKey === key;
                    const isToday = isCurrentClientWeek && dayIndex === todayIndex;
                    const hasValue = day.value > 0;

                    return (
                      <View
                        key={key}
                        style={[styles.dayRow, { borderTopColor: theme.border }]}>
                        <View style={styles.dayInfo}>
                          <View style={styles.dayTitleRow}>
                            <ThemedText type="smallBold">{day.label}</ThemedText>
                            {isToday ? <Badge label="Hoy" tone="gold" /> : null}
                          </View>
                          {!isEditing ? (
                            <ThemedText type="body" themeColor="textSecondary">
                              {hasValue
                                ? `${formatSteps(day.value)} pasos`
                                : 'Sin registrar'}
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
                            onPress={() =>
                              startEdit(activeRecord._id, dayIndex, day.value)
                            }>
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
                                void saveEdit(activeRecord._id, dayIndex);
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

                {editingKey ? (
                  <Button
                    title={saving ? 'Guardando…' : 'Guardar cambios'}
                    icon="checkmark-done"
                    onPress={() => {
                      const [recordId, dayIndexRaw] = editingKey.split(':');
                      void saveEdit(recordId, Number(dayIndexRaw));
                    }}
                    disabled={saving}
                  />
                ) : null}
              </Card>
            ) : null}
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

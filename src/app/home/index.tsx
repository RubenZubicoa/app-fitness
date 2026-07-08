import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BarChart } from '@/components/charts/bar-chart';
import { LineChart } from '@/components/charts/line-chart';
import { ProgressRing } from '@/components/charts/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatTile } from '@/components/ui/stat-tile';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { client, weeklyScore, weightSeries, workoutWeek } from '@/data/mock';

const quickActions = [
  { icon: 'scale-outline', label: 'Registrar peso', tone: Brand.blue, bg: '#E4EEFD', href: '/home/progreso' },
  { icon: 'camera-outline', label: 'Subir foto', tone: Brand.gold, bg: '#FBF0D8', href: '/home/progreso' },
  { icon: 'barbell-outline', label: 'Mi rutina', tone: Brand.teal, bg: '#DCF5F1', href: '/home/entreno' },
  { icon: 'restaurant-outline', label: 'Mi dieta', tone: Brand.purple, bg: '#EDE7FE', href: '/home/nutricion' },
] as const;

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const programProgress = client.week / client.totalWeeks;
  const lost = (weightSeries.start - weightSeries.current).toFixed(1);

  return (
    <Screen
      header={
        <GradientHeader
          showLogo
          eyebrow={`Semana ${client.week} de ${client.totalWeeks}`}
          title={`Hola, ${client.name}`}
          subtitle="Vas por delante de tu plan. ¡Sigue así!"
          rightAccessory={<ThemeToggleButton />}>
          <View style={styles.countdown}>
            <View style={styles.countLeft}>
              <ThemedText type="display" style={styles.countNum}>
                {client.daysLeft}
              </ThemedText>
              <ThemedText type="small" style={styles.countLabel}>
                días para completar{'\n'}tu Método Regenesis
              </ThemedText>
            </View>
            <ProgressRing
              progress={programProgress}
              size={92}
              strokeWidth={9}
              colors={Brand.gradientGold}
              trackColor="rgba(255,255,255,0.25)">
              <ThemedText type="h3" style={styles.ringText}>
                {Math.round(programProgress * 100)}%
              </ThemedText>
              <ThemedText type="caption" style={styles.ringSub}>
                completado
              </ThemedText>
            </ProgressRing>
          </View>
        </GradientHeader>
      }>
      <View style={[styles.statsRow, { marginTop: -Spacing.five }]}>
        <StatTile
          icon="trending-down"
          iconColor={theme.success}
          iconBg={theme.primarySoft}
          label="Peso perdido"
          value={`-${lost}`}
          unit="kg"
          delta="En 6 semanas"
          deltaTone="up"
        />
        <StatTile
          icon="flame-outline"
          iconColor={theme.gold}
          iconBg={theme.goldSoft}
          label="Racha activa"
          value="12"
          unit="días"
          delta="¡Récord!"
          deltaTone="up"
        />
      </View>

      <View>
        <SectionHeader title="Evolución del peso" actionLabel="Ver progreso" onAction={() => router.push('/home/progreso')} />
        <Card>
          <View style={styles.weightHeader}>
            <View>
              <View style={styles.weightRow}>
                <ThemedText type="display">{weightSeries.current}</ThemedText>
                <ThemedText type="small" themeColor="textMuted" style={styles.kg}>
                  {weightSeries.unit}
                </ThemedText>
              </View>
              <Badge label={`Objetivo ${weightSeries.target} ${weightSeries.unit}`} tone="primary" />
            </View>
            <View style={styles.weightMeta}>
              <ThemedText type="caption" themeColor="textMuted">
                INICIO
              </ThemedText>
              <ThemedText type="h3">{weightSeries.start} {weightSeries.unit}</ThemedText>
            </View>
          </View>
          <LineChart
            data={weightSeries.data}
            labels={weightSeries.labels}
            color={theme.primary}
            height={190}
          />
        </Card>
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.flex}>
          <ThemedText type="label" themeColor="textMuted">
            Puntuación
          </ThemedText>
          <View style={styles.scoreCenter}>
            <ProgressRing
              progress={weeklyScore.value / 100}
              size={128}
              value={`${weeklyScore.value}`}
              label="esta semana"
              colors={Brand.gradientTeal}
            />
          </View>
        </Card>
        <Card style={styles.flex}>
          <ThemedText type="label" themeColor="textMuted">
            Desglose
          </ThemedText>
          <View style={styles.breakdown}>
            {weeklyScore.breakdown.map((b) => (
              <View key={b.label} style={styles.breakItem}>
                <View style={styles.breakTop}>
                  <ThemedText type="small">{b.label}</ThemedText>
                  <ThemedText type="smallBold" themeColor="primary">
                    {b.value}
                  </ThemedText>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.track }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${b.value}%`, backgroundColor: theme.primary },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <View>
        <SectionHeader title="Entrenos de la semana" actionLabel="Rutina" onAction={() => router.push('/home/entreno')} />
        <Card>
          <View style={styles.workoutHeader}>
            <View style={styles.row}>
              <IconBadge name="checkmark-done" color={theme.teal} background={theme.primarySoft} size={40} />
              <View>
                <ThemedText type="h3">3 de 4 completados</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Te queda 1 entreno esta semana
                </ThemedText>
              </View>
            </View>
          </View>
          <BarChart data={workoutWeek} height={140} colors={Brand.gradientPrimary} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Accesos rápidos" />
        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [pressed && styles.pressed, styles.actionWrap]}
              onPress={() => router.push(a.href)}>
              <Card style={styles.action}>
                <IconBadge name={a.icon} color={a.tone} background={a.bg} />
                <ThemedText type="smallBold" style={styles.actionLabel}>
                  {a.label}
                </ThemedText>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  countdown: {
    marginTop: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  countLeft: { flex: 1, gap: 2 },
  countNum: { color: '#FFFFFF' },
  countLabel: { color: 'rgba(255,255,255,0.85)' },
  ringText: { color: '#FFFFFF' },
  ringSub: { color: 'rgba(255,255,255,0.8)' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flex: { flex: 1 },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  kg: { marginBottom: 8 },
  weightMeta: { alignItems: 'flex-end', gap: 2 },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  scoreCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  breakdown: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  breakItem: { gap: 6 },
  breakTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  workoutHeader: {
    marginBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  actionWrap: {
    width: '47%',
    flexGrow: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionLabel: { flex: 1 },
  pressed: { opacity: 0.7 },
});

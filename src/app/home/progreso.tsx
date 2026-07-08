import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { ProgressRing } from '@/components/charts/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { measurementSeries, measurements, wellness, weightSeries } from '@/data/mock';

const measureOptions = measurements.map((m) => ({ key: m.key, label: m.label }));

export default function ProgresoScreen() {
  const theme = useTheme();
  const [selectedMeasure, setSelectedMeasure] = useState(measureOptions[0].key);
  const currentMeasure = measurements.find((m) => m.key === selectedMeasure)!;
  const series = measurementSeries[selectedMeasure];

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow="Área personal"
          title="Tu progreso"
          subtitle="Fotos, medidas y sensaciones en un solo lugar"
          gradient={Brand.gradientNavy}
        />
      }>
      <View>
        <SectionHeader title="Evolución del peso" />
        <Card>
          <View style={styles.weightTop}>
            <ThemedText type="display">{weightSeries.current}</ThemedText>
            <ThemedText type="small" themeColor="textMuted" style={styles.kg}>
              {weightSeries.unit}
            </ThemedText>
            <Badge label={`-${(weightSeries.start - weightSeries.current).toFixed(1)} ${weightSeries.unit}`} tone="success" />
          </View>
          <LineChart data={weightSeries.data} labels={weightSeries.labels} height={200} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Medidas corporales" />
        <Segmented options={measureOptions} value={selectedMeasure} onChange={setSelectedMeasure} />
        <Card style={styles.measureCard}>
          <View style={styles.measureHeader}>
            <View>
              <ThemedText type="caption" themeColor="textMuted">
                ACTUAL
              </ThemedText>
              <View style={styles.measureValue}>
                <ThemedText type="title">{currentMeasure.value}</ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {currentMeasure.unit}
                </ThemedText>
              </View>
            </View>
            <View style={styles.deltaBox}>
              <Ionicons
                name={currentMeasure.delta < 0 ? 'trending-down' : 'trending-up'}
                size={18}
                color={currentMeasure.delta < 0 ? theme.success : theme.gold}
              />
              <ThemedText
                type="smallBold"
                style={{ color: currentMeasure.delta < 0 ? theme.success : theme.gold }}>
                {currentMeasure.delta > 0 ? '+' : ''}
                {currentMeasure.delta} {currentMeasure.unit}
              </ThemedText>
            </View>
          </View>
          <LineChart
            data={series}
            labels={weightSeries.labels}
            color={theme.teal}
            fillColor={theme.teal}
            height={170}
          />
        </Card>
      </View>

      <View>
        <SectionHeader title="Sensaciones diarias" />
        <View style={styles.wellnessGrid}>
          {wellness.map((w) => {
            const toneColor =
              w.tone === 'gold'
                ? theme.gold
                : w.tone === 'purple'
                  ? theme.purple
                  : w.tone === 'coral'
                    ? theme.coral
                    : theme.teal;
            return (
              <Card key={w.key} style={styles.wellnessCard}>
                <View style={styles.wellnessTop}>
                  <Ionicons name={w.icon} size={18} color={toneColor} />
                  <ThemedText type="smallBold">{w.label}</ThemedText>
                </View>
                <ProgressRing
                  progress={w.value / 100}
                  size={88}
                  strokeWidth={8}
                  colors={[toneColor, toneColor]}
                  value={`${w.value}`}
                  label="/ 100"
                />
              </Card>
            );
          })}
        </View>
      </View>

      <View>
        <SectionHeader title="Fotos de progreso" actionLabel="Ver todas" />
        <View style={styles.photoRow}>
          <PhotoCard label="Inicio" date="14 abr" image="https://picsum.photos/seed/regenesis1/300/400" />
          <PhotoCard label="Semana 3" date="5 may" image="https://picsum.photos/seed/regenesis2/300/400" />
          <PhotoCard label="Semana 6" date="26 may" highlight image="https://picsum.photos/seed/regenesis3/300/400" />
        </View>
        <Button title="Subir nuevas fotos" icon="camera-outline" variant="secondary" />
      </View>

      <View>
        <SectionHeader title="Registrar hoy" />
        <Card style={styles.registerCard}>
          <ThemedText type="body" themeColor="textSecondary">
            Registra peso, medidas y cómo te sientes para que tu coach ajuste el plan.
          </ThemedText>
          <View style={styles.registerActions}>
            <Button title="Añadir registro" icon="add-circle-outline" style={styles.flex} />
            <Button title="Fotos" icon="images-outline" variant="ghost" fullWidth={false} style={styles.photoBtn} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

function PhotoCard({
  label,
  date,
  image,
  highlight,
}: {
  label: string;
  date: string;
  image: string;
  highlight?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.photoWrap}>
      <Image source={{ uri: image }} style={styles.photo} contentFit="cover" />
      <View style={styles.photoOverlay}>
        {highlight && <Badge label="Actual" tone="gold" solid />}
        <ThemedText type="smallBold" style={styles.photoLabel}>
          {label}
        </ThemedText>
        <ThemedText type="caption" style={styles.photoDate}>
          {date}
        </ThemedText>
      </View>
      {highlight && <View style={[styles.photoRing, { borderColor: theme.gold }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  weightTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    marginBottom: Spacing.two,
    flexWrap: 'wrap',
  },
  kg: { marginBottom: 8 },
  measureCard: { marginTop: Spacing.three },
  measureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  measureValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  deltaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F5FA',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  wellnessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  wellnessCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  wellnessTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  photoWrap: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 2,
  },
  photoLabel: { color: '#FFFFFF' },
  photoDate: { color: 'rgba(255,255,255,0.8)' },
  photoRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderRadius: Radius.md,
    pointerEvents: 'none',
  },
  registerCard: { gap: Spacing.three },
  registerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  flex: { flex: 1 },
  photoBtn: { minWidth: 110 },
});

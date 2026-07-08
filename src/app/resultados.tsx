import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/charts/line-chart';
import { ProgressRing } from '@/components/charts/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { measurementSeries, weightSeries } from '@/data/mock';

export default function ResultadosScreen() {
  const theme = useTheme();
  const lost = weightSeries.start - weightSeries.current;
  const waistLost = measurementSeries.cintura[0] - measurementSeries.cintura[5];

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Al finalizar el proceso"
          title="Tu transformación"
          subtitle="Comparativa, gráficas y resultados finales"
          showBack
          gradient={Brand.gradientNavy}
          rightIcon="share-outline"
        />
      }>
      <View style={styles.content}>
        <Card style={styles.hero}>
          <ProgressRing
            progress={0.92}
            size={140}
            strokeWidth={12}
            colors={Brand.gradientGold}
            value="92"
            label="puntuación final"
          />
          <View style={styles.heroText}>
            <ThemedText type="title">¡Proceso completado!</ThemedText>
            <ThemedText type="body" themeColor="textSecondary">
              Has alcanzado el 92% de tus objetivos en 12 semanas.
            </ThemedText>
            <Badge label="Renueva con 15% dto." tone="gold" solid />
          </View>
        </Card>

        <SectionHeader title="Comparativa de fotos" />
        <View style={styles.compare}>
          <ComparePhoto label="Día 1" date="14 abr" image="https://picsum.photos/seed/regenesis1/300/400" />
          <View style={styles.vs}>
            <Ionicons name="arrow-forward" size={22} color={theme.gold} />
          </View>
          <ComparePhoto label="Día 90" date="13 jul" highlight image="https://picsum.photos/seed/regenesis3/300/400" />
        </View>

        <SectionHeader title="Resumen de medidas" />
        <View style={styles.summaryRow}>
          <SummaryTile label="Peso" value={`-${lost.toFixed(1)}`} unit="kg" icon="scale-outline" />
          <SummaryTile label="Cintura" value={`-${waistLost}`} unit="cm" icon="body-outline" />
          <SummaryTile label="Adherencia" value="89" unit="%" icon="checkmark-done-outline" />
        </View>

        <Card>
          <ThemedText type="h3" style={styles.chartTitle}>
            Evolución completa del peso
          </ThemedText>
          <LineChart
            data={[...weightSeries.data, weightSeries.target]}
            labels={['S1', 'S3', 'S5', 'S7', 'S9', 'S11', 'Meta']}
            color={theme.gold}
            fillColor={theme.gold}
            height={200}
          />
        </Card>

        <Button title="Descargar informe PDF" icon="download-outline" gradient={Brand.gradientGold} />
        <Button title="Renovar mi plan" icon="refresh-outline" variant="secondary" />
      </View>
    </Screen>
  );
}

function ComparePhoto({
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
        <ThemedText type="smallBold" style={styles.photoLabel}>
          {label}
        </ThemedText>
        <ThemedText type="caption" style={styles.photoDate}>
          {date}
        </ThemedText>
      </View>
      {highlight && <View style={[styles.ring, { borderColor: theme.gold }]} />}
    </View>
  );
}

function SummaryTile({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const theme = useTheme();
  return (
    <Card style={styles.summaryTile}>
      <Ionicons name={icon} size={20} color={theme.gold} />
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="caption" themeColor="textMuted">
        {unit}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  heroText: {
    flex: 1,
    gap: Spacing.one,
  },
  compare: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  photoWrap: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  photoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 2,
  },
  photoLabel: { color: '#FFFFFF' },
  photoDate: { color: 'rgba(255,255,255,0.85)' },
  ring: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderRadius: Radius.md,
  },
  vs: {
    width: 32,
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.three,
  },
  chartTitle: {
    marginBottom: Spacing.two,
  },
});

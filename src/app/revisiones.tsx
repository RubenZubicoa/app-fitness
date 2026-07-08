import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { reviews } from '@/data/mock';

export default function RevisionesScreen() {
  const theme = useTheme();

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Seguimiento"
          title="Revisiones"
          subtitle="Recordatorios 24h antes · Sube fotos y medidas"
          showBack
        />
      }>
      <View style={styles.content}>
        <Card style={styles.alert}>
          <Ionicons name="notifications" size={22} color={theme.gold} />
          <View style={styles.alertBody}>
            <ThemedText type="h3">Próxima revisión en 2 días</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Recibirás un recordatorio 24h antes. Sube 4 fotos y tus medidas.
            </ThemedText>
          </View>
        </Card>

        <SectionHeader title="Calendario de revisiones" />
        <View style={styles.list}>
          {reviews.map((r) => (
            <Card key={r.title} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        r.status === 'upcoming' ? theme.gold : theme.success,
                    },
                  ]}
                />
                <View style={styles.reviewBody}>
                  <ThemedText type="h3">{r.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {r.date}
                  </ThemedText>
                </View>
                <Badge
                  label={r.status === 'upcoming' ? 'Próxima' : 'Hecha'}
                  tone={r.status === 'upcoming' ? 'gold' : 'success'}
                />
              </View>
              <ThemedText type="body" themeColor="textSecondary">
                {r.note}
              </ThemedText>
              {r.status === 'upcoming' && (
                <View style={styles.actions}>
                  <Button title="Subir fotos" icon="camera-outline" variant="secondary" style={styles.flex} />
                  <Button title="Medidas" icon="body-outline" variant="ghost" fullWidth={false} style={styles.miniBtn} />
                </View>
              )}
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  alert: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
    marginTop: Spacing.two,
  },
  alertBody: { flex: 1, gap: 4 },
  list: { gap: Spacing.three },
  reviewCard: { gap: Spacing.two },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
  reviewBody: { flex: 1, gap: 2 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  flex: { flex: 1 },
  miniBtn: { minWidth: 120 },
});

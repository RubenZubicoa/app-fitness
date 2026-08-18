import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { fetchReviewsByClient } from '@/api/reviews';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useTheme } from '@/hooks/use-theme';
import type { Review } from '@/types/review';

export default function RevisionesScreen() {
  const theme = useTheme();
  const { client } = useClient();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client?._id) return;

    setLoading(true);
    setError(null);

    fetchReviewsByClient(client._id)
      .then(setReviews)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar revisiones');
      })
      .finally(() => setLoading(false));
  }, [client?._id]);

  const nextUpcoming = reviews.find((r) => r.status === 'upcoming');

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
        {nextUpcoming && (
          <Card style={styles.alert}>
            <Ionicons name="notifications" size={22} color={theme.gold} />
            <View style={styles.alertBody}>
              <ThemedText type="h3">Próxima: {nextUpcoming.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {nextUpcoming.date} · Sube 4 fotos y tus medidas.
              </ThemedText>
            </View>
          </Card>
        )}

        <SectionHeader title="Calendario de revisiones" />

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={theme.gold} />
          </View>
        )}

        {!loading && error && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {error}
          </ThemedText>
        )}

        {!loading && !error && (
          <View style={styles.list}>
            {reviews.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                No hay revisiones registradas.
              </ThemedText>
            )}
            {reviews.map((r) => (
              <Card key={r._id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          r.status === 'upcoming'
                            ? theme.gold
                            : r.status === 'canceled'
                              ? theme.coral
                              : theme.success,
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
                    label={
                      r.status === 'upcoming'
                        ? 'Próxima'
                        : r.status === 'canceled'
                          ? 'Cancelada'
                          : 'Hecha'
                    }
                    tone={
                      r.status === 'upcoming'
                        ? 'gold'
                        : r.status === 'canceled'
                          ? 'coral'
                          : 'success'
                    }
                  />
                </View>
                <ThemedText type="body" themeColor="textSecondary">
                  {r.note}
                </ThemedText>
                {r.status === 'upcoming' && (
                  <Button
                    title="Añadir registro"
                    icon="add-circle-outline"
                    variant="secondary"
                    onPress={() => router.push('/anadir-registro')}
                  />
                )}
              </Card>
            ))}
          </View>
        )}
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
  center: { alignSelf: 'center', marginTop: Spacing.three },
});

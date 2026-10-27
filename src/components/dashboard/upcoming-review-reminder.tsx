import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { fetchReviewsByClient } from '@/api/reviews';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useTheme } from '@/hooks/use-theme';
import {
  findUpcomingReviewWithinHours,
  formatReviewDateLabel,
  type Review,
} from '@/types/review';

/** Aviso compacto si hay una revisión en las próximas 24 h. */
export function UpcomingReviewReminder() {
  const theme = useTheme();
  const router = useRouter();
  const { client } = useClient();
  const [review, setReview] = useState<Review | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!client?._id) {
      setReview(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const list = await fetchReviewsByClient(client._id);
        if (cancelled) return;
        setReview(findUpcomingReviewWithinHours(list, 24));
      } catch {
        if (!cancelled) setReview(null);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [client?._id]);

  if (!review || dismissed) return null;

  return (
    <Card style={[styles.card, { borderColor: theme.gold, backgroundColor: theme.goldSoft }]}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        onPress={() => router.push('/revisiones')}
        accessibilityRole="button"
        accessibilityLabel="Ver revisiones">
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(228, 169, 60, 0.22)' }]}>
          <Ionicons name="notifications" size={18} color={Brand.gold} />
        </View>
        <View style={styles.body}>
          <ThemedText type="smallBold">Revisión pendiente</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {review.title} · {formatReviewDateLabel(review.date)}
          </ThemedText>
        </View>
      </Pressable>
      <Pressable
        hitSlop={10}
        onPress={() => setDismissed(true)}
        accessibilityRole="button"
        accessibilityLabel="Cerrar recordatorio">
        <Ionicons name="close" size={18} color={theme.textMuted} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});

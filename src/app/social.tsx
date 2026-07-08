import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { leaderboard, socialFeed } from '@/data/mock';

const kindIcon = {
  workout: 'barbell',
  steps: 'footsteps',
  challenge: 'trophy',
} as const;

export default function SocialScreen() {
  const theme = useTheme();

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Comunidad"
          title="Actividad social"
          subtitle="Comparte entrenos, pasos y retos con otros usuarios"
          showBack
          gradient={Brand.gradientTeal}
        />
      }>
      <View style={styles.content}>
        <Card style={styles.challenge}>
          <View style={styles.challengeRow}>
            <Ionicons name="flame" size={28} color={theme.gold} />
            <View style={styles.challengeBody}>
              <ThemedText type="h3">Reto activo: 10.000 pasos</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                24 participantes · Termina en 3 días
              </ThemedText>
            </View>
            <Badge label="Unirme" tone="gold" solid />
          </View>
        </Card>

        <SectionHeader title="Feed de actividad" />
        <View style={styles.feed}>
          {socialFeed.map((post) => (
            <Card key={post.user + post.time} style={styles.post}>
              <View style={styles.postHeader}>
                <Image source={{ uri: post.avatar }} style={styles.avatar} contentFit="cover" />
                <View style={styles.postBody}>
                  <ThemedText type="smallBold">{post.user}</ThemedText>
                  <ThemedText type="body" themeColor="textSecondary">
                    {post.action}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textMuted">
                    {post.time}
                  </ThemedText>
                </View>
                <View style={[styles.kindBadge, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name={kindIcon[post.kind]} size={16} color={theme.primary} />
                </View>
              </View>
              <View style={styles.postActions}>
                <View style={styles.likes}>
                  <Ionicons name="heart" size={16} color={theme.coral} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {post.likes}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="primary">
                  Comentar
                </ThemedText>
              </View>
            </Card>
          ))}
        </View>

        <SectionHeader title="Ranking semanal" />
        <Card>
          {leaderboard.map((entry, index) => (
            <View key={entry.user} style={styles.rankRow}>
              <ThemedText type="h3" themeColor={index === 0 ? 'gold' : 'textMuted'} style={styles.rank}>
                #{index + 1}
              </ThemedText>
              <Image source={{ uri: entry.avatar }} style={styles.rankAvatar} contentFit="cover" />
              <ThemedText type="body" style={styles.rankName}>
                {entry.user}
              </ThemedText>
              <ThemedText type="smallBold" themeColor="primary">
                {entry.points} pts
              </ThemedText>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  challenge: { marginTop: Spacing.two },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  challengeBody: { flex: 1, gap: 4 },
  feed: { gap: Spacing.three },
  post: { gap: Spacing.two },
  postHeader: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
  },
  postBody: { flex: 1, gap: 2 },
  kindBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E9F1',
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E9F1',
  },
  rank: { width: 28 },
  rankAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
  },
  rankName: { flex: 1 },
});

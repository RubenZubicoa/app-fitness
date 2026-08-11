import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import {
  communityHighlights,
  leaderboard,
  socialFeed,
} from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';
import {
  formatRelativeTime,
  socialFeedAction,
  socialFeedDetail,
  socialFeedMetric,
  type SocialFeedKind,
} from '@/types/social-feed';

type FilterKey = 'all' | SocialFeedKind;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'workout', label: 'Entrenos' },
  { key: 'weight', label: 'Peso' },
  { key: 'photos', label: 'Fotos' },
  { key: 'measurement', label: 'Medidas' },
  { key: 'steps', label: 'Pasos' },
  { key: 'challenge', label: 'Retos' },
  { key: 'wellness', label: 'Bienestar' },
];

const kindMeta: Record<
  SocialFeedKind,
  {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    tone: 'primary' | 'gold' | 'teal' | 'coral' | 'purple';
  }
> = {
  workout: { icon: 'barbell', label: 'Entreno', tone: 'primary' },
  weight: { icon: 'scale-outline', label: 'Peso', tone: 'gold' },
  photos: { icon: 'camera', label: 'Fotos', tone: 'purple' },
  measurement: { icon: 'body-outline', label: 'Medidas', tone: 'teal' },
  steps: { icon: 'footsteps', label: 'Pasos', tone: 'teal' },
  challenge: { icon: 'trophy', label: 'Reto', tone: 'gold' },
  wellness: { icon: 'heart', label: 'Bienestar', tone: 'coral' },
};

function toneColors(
  tone: 'primary' | 'gold' | 'teal' | 'coral' | 'purple',
  theme: ReturnType<typeof useTheme>,
) {
  switch (tone) {
    case 'gold':
      return { color: theme.gold, bg: theme.goldSoft };
    case 'teal':
      return { color: theme.teal, bg: '#D8F5F1' };
    case 'coral':
      return { color: theme.coral, bg: '#FDE8ED' };
    case 'purple':
      return { color: theme.purple, bg: '#EDE7FE' };
    default:
      return { color: theme.primary, bg: theme.primarySoft };
  }
}

export default function SocialScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const posts = useMemo(
    () => (filter === 'all' ? socialFeed : socialFeed.filter((p) => p.kind === filter)),
    [filter],
  );

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Comunidad REGENESIS"
          title="Logros compartidos"
          subtitle="Entrenos, peso, fotos y retos de toda la comunidad"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.highlights}>
        {communityHighlights.map((item) => (
          <Card key={item.label} style={styles.highlightCard}>
            <IconBadge
              name={item.icon}
              color={theme.gold}
              background={theme.goldSoft}
              size={36}
            />
            <ThemedText type="h3">{item.value}</ThemedText>
            <ThemedText type="caption" themeColor="textMuted" style={styles.highlightLabel}>
              {item.label}
            </ThemedText>
          </Card>
        ))}
      </View>

      <Card style={styles.challenge}>
        <View style={styles.challengeRow}>
          <IconBadge name="flame" color={theme.gold} background={theme.goldSoft} size={44} />
          <View style={styles.challengeBody}>
            <ThemedText type="h3">Reto de la semana</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              10.000 pasos diarios · 24 personas unidas · Quedan 3 días
            </ThemedText>
          </View>
          <Badge label="Unirme" tone="gold" solid />
        </View>
      </Card>

      <SectionHeader title="Feed de logros" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? theme.primary : theme.backgroundElement,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.feed}>
        {posts.length === 0 ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              No hay logros en esta categoría todavía.
            </ThemedText>
          </Card>
        ) : (
          posts.map((post) => {
            const meta = kindMeta[post.kind];
            const colors = toneColors(meta.tone, theme);
            const isLiked = !!liked[post._id];
            const likeCount = post.likes + (isLiked ? 1 : 0);
            const action = socialFeedAction(post);
            const detail = socialFeedDetail(post);
            const metric = socialFeedMetric(post);

            return (
              <Card key={post._id} style={styles.post}>
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: post.author.avatar }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  <View style={styles.postBody}>
                    <View style={styles.postTitleRow}>
                      <ThemedText type="smallBold" style={styles.userName}>
                        {post.author.fullName}
                      </ThemedText>
                      <Badge
                        label={meta.label}
                        tone={
                          meta.tone === 'purple' || meta.tone === 'teal'
                            ? 'primary'
                            : meta.tone
                        }
                      />
                    </View>
                    <ThemedText type="body">{action}</ThemedText>
                    {!!detail && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {detail}
                      </ThemedText>
                    )}
                    <ThemedText type="caption" themeColor="textMuted">
                      {formatRelativeTime(post.createdAt)}
                    </ThemedText>
                  </View>
                </View>

                {metric ? (
                  <View style={[styles.metricBanner, { backgroundColor: colors.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={colors.color} />
                    <ThemedText type="h3" style={{ color: colors.color }}>
                      {metric}
                    </ThemedText>
                  </View>
                ) : null}

                {post.kind === 'photos' ? (
                  <View style={styles.photoRow}>
                    {post.photos.map((uri) => (
                      <Image
                        key={uri}
                        source={{ uri }}
                        style={styles.photo}
                        contentFit="cover"
                      />
                    ))}
                  </View>
                ) : null}

                <View style={[styles.postActions, { borderTopColor: theme.border }]}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                    onPress={() => toggleLike(post._id)}>
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isLiked ? theme.coral : theme.textMuted}
                    />
                    <ThemedText type="small" themeColor={isLiked ? 'coral' : 'textSecondary'}>
                      {likeCount}
                    </ThemedText>
                  </Pressable>
                  <View style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={17} color={theme.textMuted} />
                    <ThemedText type="small" themeColor="textSecondary">
                      {post.comments}
                    </ThemedText>
                  </View>
                  <View style={styles.actionBtn}>
                    <Ionicons name="share-outline" size={17} color={theme.textMuted} />
                    <ThemedText type="small" themeColor="textSecondary">
                      Compartir
                    </ThemedText>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </View>

      <SectionHeader title="Ranking semanal" />
      <Card>
        {leaderboard.map((entry, index) => (
          <View
            key={entry.clientId}
            style={[
              styles.rankRow,
              index < leaderboard.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.border,
              },
            ]}>
            <ThemedText
              type="h3"
              themeColor={index === 0 ? 'gold' : 'textMuted'}
              style={styles.rank}>
              #{index + 1}
            </ThemedText>
            <Image source={{ uri: entry.avatar }} style={styles.rankAvatar} contentFit="cover" />
            <View style={styles.rankInfo}>
              <ThemedText type="body">{entry.fullName}</ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                Racha {entry.streak} días
              </ThemedText>
            </View>
            <ThemedText type="smallBold" themeColor="primary">
              {entry.points} pts
            </ThemedText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  highlights: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: -Spacing.two,
  },
  highlightCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.three,
  },
  highlightLabel: { textAlign: 'center' },
  challenge: { marginTop: Spacing.two },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  challengeBody: { flex: 1, gap: 4 },
  filters: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  feed: { gap: Spacing.three },
  post: { gap: Spacing.three },
  postHeader: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
  },
  postBody: { flex: 1, gap: 3 },
  postTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  userName: { flexShrink: 1 },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  photo: {
    flex: 1,
    height: 120,
    borderRadius: Radius.md,
    backgroundColor: '#E4E9F1',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  rank: { width: 32 },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
  },
  rankInfo: { flex: 1, gap: 1 },
  pressed: { opacity: 0.7 },
});

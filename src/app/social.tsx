import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { fetchStepsRanking } from '@/api/daily-steps';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { Brand, Radius, Spacing } from '@/constants/theme';
import {
  communityHighlights,
} from '@/data/mock';
import { useClient } from '@/context/client-context';
import { useSocialFeed } from '@/context/social-feed-context';
import { useTheme } from '@/hooks/use-theme';
import {
  formatStepsCount,
  type StepsRankingEntry,
  type StepsRankingPeriod,
} from '@/types/steps-ranking';
import {
  formatRelativeTime,
  socialFeedAction,
  socialFeedDetail,
  socialFeedMetric,
  type SocialFeedKind,
} from '@/types/social-feed';
import type { WorkoutMedia } from '@/types/workout-history';

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

function WorkoutMediaRow({ media }: { media: WorkoutMedia[] }) {
  const theme = useTheme();
  return (
    <View style={styles.photoRow}>
      {media.map((item) =>
        item.type === 'image' ? (
          <Image
            key={item.uri}
            source={{ uri: item.uri }}
            style={styles.photo}
            contentFit="cover"
          />
        ) : (
          <View
            key={item.uri}
            style={[styles.photo, styles.videoThumb, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="play-circle" size={28} color={theme.primary} />
            <ThemedText type="caption" themeColor="primary">
              Vídeo
            </ThemedText>
          </View>
        ),
      )}
    </View>
  );
}

export default function SocialScreen() {
  const theme = useTheme();
  const { client } = useClient();
  const { feed } = useSocialFeed();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [stepsPeriod, setStepsPeriod] = useState<StepsRankingPeriod>('week');
  const [stepsRanking, setStepsRanking] = useState<StepsRankingEntry[]>([]);
  const [stepsLoading, setStepsLoading] = useState(true);
  const [stepsError, setStepsError] = useState<string | null>(null);

  const loadStepsRanking = useCallback(async (period: StepsRankingPeriod) => {
    setStepsLoading(true);
    setStepsError(null);
    try {
      const ranking = await fetchStepsRanking(period);
      setStepsRanking(ranking);
    } catch (err) {
      setStepsError(err instanceof Error ? err.message : 'No se pudo cargar el ranking');
      setStepsRanking([]);
    } finally {
      setStepsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStepsRanking(stepsPeriod);
  }, [loadStepsRanking, stepsPeriod]);

  const stepsLeader = stepsRanking[0]?.steps ?? 1;

  const posts = useMemo(
    () => (filter === 'all' ? feed : feed.filter((p) => p.kind === filter)),
    [feed, filter],
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

      <SectionHeader title="Ranking de pasos" />
      <Segmented
        options={[
          { key: 'week', label: 'Esta semana' },
          { key: 'month', label: 'Este mes' },
        ]}
        value={stepsPeriod}
        onChange={setStepsPeriod}
      />
      <Card style={styles.stepsRankingCard}>
        {stepsLoading ? (
          <View style={styles.stepsLoading}>
            <ActivityIndicator color={theme.primary} />
            <ThemedText type="small" themeColor="textSecondary">
              Cargando ranking…
            </ThemedText>
          </View>
        ) : stepsError ? (
          <View style={styles.stepsLoading}>
            <ThemedText type="body" themeColor="textSecondary">
              {stepsError}
            </ThemedText>
            <Pressable onPress={() => void loadStepsRanking(stepsPeriod)}>
              <ThemedText type="link" themeColor="primary">
                Reintentar
              </ThemedText>
            </Pressable>
          </View>
        ) : stepsRanking.length === 0 ? (
          <ThemedText type="body" themeColor="textSecondary">
            Aún no hay pasos registrados en este periodo.
          </ThemedText>
        ) : (
          stepsRanking.map((entry, index) => {
          const isCurrentUser = client?._id === entry.clientId;
          const progress = entry.steps / stepsLeader;

          return (
            <View
              key={entry.clientId}
              style={[
                styles.rankRow,
                isCurrentUser && { backgroundColor: theme.primarySoft, borderRadius: Radius.md },
                index < stepsRanking.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
              ]}>
              <ThemedText
                type="h3"
                themeColor={index === 0 ? 'gold' : index === 1 ? 'textSecondary' : 'textMuted'}
                style={styles.rank}>
                #{index + 1}
              </ThemedText>
              <Image source={{ uri: entry.avatar }} style={styles.rankAvatar} contentFit="cover" />
              <View style={styles.rankInfo}>
                <View style={styles.stepsNameRow}>
                  <ThemedText type="body">{entry.fullName}</ThemedText>
                  {isCurrentUser ? <Badge label="Tú" tone="primary" /> : null}
                </View>
                {entry.avgDaily != null ? (
                  <ThemedText type="caption" themeColor="textMuted">
                    ~{formatStepsCount(entry.avgDaily)} pasos/día
                  </ThemedText>
                ) : null}
                <View style={[styles.stepsBarTrack, { backgroundColor: theme.backgroundElement }]}>
                  <View
                    style={[
                      styles.stepsBarFill,
                      {
                        width: `${Math.round(progress * 100)}%`,
                        backgroundColor: index === 0 ? theme.gold : theme.teal,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.stepsValue}>
                <Ionicons name="footsteps" size={16} color={theme.teal} />
                <ThemedText type="smallBold" themeColor="primary">
                  {formatStepsCount(entry.steps)}
                </ThemedText>
              </View>
            </View>
          );
        })
        )}
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

                {post.kind === 'workout' && post.media && post.media.length > 0 ? (
                  <WorkoutMediaRow media={post.media} />
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
  videoThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
  rankInfo: { flex: 1, gap: 4 },
  stepsRankingCard: { marginTop: Spacing.two },
  stepsLoading: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  stepsNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  stepsBarTrack: {
    height: 4,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginTop: 2,
  },
  stepsBarFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  stepsValue: {
    alignItems: 'flex-end',
    gap: 2,
    minWidth: 72,
  },
  pressed: { opacity: 0.7 },
});

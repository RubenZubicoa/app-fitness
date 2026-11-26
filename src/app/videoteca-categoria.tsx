import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import { useVideoLibrary } from '@/context/video-library-context';
import type { VideoLibraryItem } from '@/types/video-library';

const toneMap = {
  gold: { color: Brand.gold, bg: '#FBF0D8' },
  primary: { color: Brand.blue, bg: '#E4EEFD' },
  purple: { color: Brand.purple, bg: '#EDE7FE' },
};

export default function VideotecaCategoriaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { videoLibrary, loading, error } = useVideoLibrary();

  const category = useMemo(
    () => videoLibrary.find((cat) => cat._id === id) ?? null,
    [id, videoLibrary],
  );

  const openResource = useCallback(async (url: string) => {
    if (!url) return;

    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      Alert.alert('Error', 'No se pudo abrir el recurso.');
    }
  }, []);

  const colors = toneMap[category?.tone ?? 'primary'];
  const badgeTone = category?.tone === 'gold' ? 'gold' : 'primary';

  const renderItem = (item: VideoLibraryItem) => {
    const card = (
      <Card style={styles.item}>
        <IconBadge
          name={category?.icon ?? 'play-circle-outline'}
          color={colors.color}
          background={colors.bg}
          size={44}
        />
        <View style={styles.itemBody}>
          <ThemedText type="h3">{item.title}</ThemedText>
          <View style={styles.meta}>
            <Badge label={item.type} tone={badgeTone} />
            {!!item.length && (
              <ThemedText type="caption" themeColor="textMuted">
                {item.length}
              </ThemedText>
            )}
          </View>
        </View>
        <Ionicons
          name={item.type === 'Vídeo' ? 'play-circle' : 'document-text'}
          size={28}
          color={colors.color}
        />
      </Card>
    );

    if (!item.url) return card;

    return (
      <Pressable
        style={({ pressed }) => pressed && styles.pressed}
        onPress={() => void openResource(item.url)}>
        {card}
      </Pressable>
    );
  };

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Videoteca"
          title={category?.category ?? 'Carpeta'}
          subtitle={
            category
              ? `${category.items.length} recurso${category.items.length === 1 ? '' : 's'} en esta carpeta`
              : 'Contenido de la categoría seleccionada'
          }
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.content}>
        {loading ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              Cargando…
            </ThemedText>
          </Card>
        ) : error ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              {error}
            </ThemedText>
          </Card>
        ) : !category ? (
          <Card style={styles.empty}>
            <ThemedText type="body" themeColor="textSecondary">
              No se encontró esta carpeta.
            </ThemedText>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ThemedText type="link" themeColor="primary">
                Volver a la videoteca
              </ThemedText>
            </Pressable>
          </Card>
        ) : category.items.length === 0 ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              Esta carpeta no tiene recursos todavía.
            </ThemedText>
          </Card>
        ) : (
          category.items.map((item) => (
            <View key={item._id}>{renderItem(item)}</View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  itemBody: {
    flex: 1,
    gap: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  empty: {
    gap: Spacing.two,
  },
  pressed: { opacity: 0.75 },
});

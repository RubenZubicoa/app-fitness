import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useVideoLibrary } from '@/context/video-library-context';
import { getCurrentPhase } from '@/data/program';
import type { VideoLibraryItem } from '@/types/video-library';

const toneMap = {
  gold: { color: Brand.gold, bg: '#FBF0D8' },
  primary: { color: Brand.blue, bg: '#E4EEFD' },
  purple: { color: Brand.purple, bg: '#EDE7FE' },
};

export default function VideotecaTabScreen() {
  const { client } = useClient();
  const { videoLibrary, loading, error } = useVideoLibrary();

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

  if (!client) return null;

  const phase = getCurrentPhase(client.phase);

  const renderItem = (
    item: VideoLibraryItem,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    bg: string,
    badgeTone: 'gold' | 'primary',
  ) => {
    const card = (
      <Card style={styles.item}>
        <IconBadge name={icon} color={color} background={bg} size={44} />
        <View style={styles.itemBody}>
          <ThemedText type="h3">{item.title}</ThemedText>
          <View style={styles.meta}>
            <Badge label={item.type} tone={badgeTone} />
            <ThemedText type="caption" themeColor="textMuted">
              {item.length}
            </ThemedText>
          </View>
        </View>
        <Ionicons
          name={item.type === 'Vídeo' ? 'play-circle' : 'document-text'}
          size={28}
          color={color}
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
      header={
        <GradientHeader
          eyebrow={`Fase ${phase.id} · ${phase.name}`}
          title="Videoteca"
          subtitle="Vídeos y PDFs sobre nutrición, entreno y hábitos de tu fase actual"
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.content}>
        {loading ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              Cargando videoteca…
            </ThemedText>
          </Card>
        ) : error ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              {error}
            </ThemedText>
          </Card>
        ) : videoLibrary.length === 0 ? (
          <Card>
            <ThemedText type="body" themeColor="textSecondary">
              No hay contenido disponible para tu fase actual.
            </ThemedText>
          </Card>
        ) : (
          videoLibrary.map((cat) => {
            const colors = toneMap[cat.tone];
            return (
              <View key={cat._id}>
                <SectionHeader title={cat.category} />
                <View style={styles.items}>
                  {cat.items.map((item) => (
                    <View key={item._id}>
                      {renderItem(
                        item,
                        cat.icon,
                        colors.color,
                        colors.bg,
                        cat.tone === 'gold' ? 'gold' : 'primary',
                      )}
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
  },
  items: { gap: Spacing.two },
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
  pressed: { opacity: 0.75 },
});

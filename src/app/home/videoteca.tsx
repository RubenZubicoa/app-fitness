import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { IconBadge } from '@/components/ui/icon-badge';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useVideoLibrary } from '@/context/video-library-context';
import { getCurrentPhase } from '@/data/program';
import { useLoadOnFocus } from '@/hooks/use-load-on-focus';
import { useTheme } from '@/hooks/use-theme';

const toneMap = {
  gold: { color: Brand.gold, bg: '#FBF0D8' },
  primary: { color: Brand.blue, bg: '#E4EEFD' },
  purple: { color: Brand.purple, bg: '#EDE7FE' },
};

function itemCountLabel(count: number): string {
  if (count === 1) return '1 recurso';
  return `${count} recursos`;
}

export default function VideotecaTabScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { client } = useClient();
  const { videoLibrary, loading, error, refreshVideoLibrary } = useVideoLibrary();

  useLoadOnFocus(
    useCallback(() => {
      void refreshVideoLibrary();
    }, [refreshVideoLibrary]),
  );

  if (!client) return null;

  const phase = getCurrentPhase(client.phase);

  return (
    <Screen
      header={
        <GradientHeader
          eyebrow={`Fase ${phase.id} · ${phase.name}`}
          title="Videoteca"
          subtitle="Elige una carpeta para ver vídeos y PDFs de tu fase actual"
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
              <Pressable
                key={cat._id}
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() =>
                  router.push({
                    pathname: '/videoteca-categoria',
                    params: { id: cat._id },
                  } as Href)
                }
                accessibilityRole="button"
                accessibilityLabel={`Abrir carpeta ${cat.category}`}>
                <Card style={styles.folder}>
                  <IconBadge name={cat.icon} color={colors.color} background={colors.bg} size={48} />
                  <View style={styles.folderBody}>
                    <ThemedText type="h3">{cat.category}</ThemedText>
                    <ThemedText type="caption" themeColor="textMuted">
                      {itemCountLabel(cat.items.length)}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                </Card>
              </Pressable>
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
  folder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  folderBody: {
    flex: 1,
    gap: 4,
  },
  pressed: { opacity: 0.75 },
});

import { Ionicons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** URLs que no se pueden reproducir con el player nativo. */
function isExternalMediaUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    /youtu\.?be/.test(lower) ||
    lower.includes('vimeo.com') ||
    lower.includes('docs.google') ||
    lower.includes('drive.google') ||
    lower.includes('pdf')
  );
}

type ExerciseExplanationMediaProps = {
  url: string;
  /** Solo montar el player cuando el modal está visible. */
  active: boolean;
};

/** Reproduce un vídeo directo o ofrece abrir el enlace externo. */
export function ExerciseExplanationMedia({ url, active }: ExerciseExplanationMediaProps) {
  const theme = useTheme();
  const external = isExternalMediaUrl(url);

  const openExternal = useCallback(async () => {
    try {
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      Alert.alert('Error', 'No se pudo abrir el vídeo explicativo.');
    }
  }, [url]);

  if (!active) return null;

  if (external) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.externalCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
        onPress={() => {
          void openExternal();
        }}
        accessibilityRole="button"
        accessibilityLabel="Abrir vídeo explicativo">
        <View style={[styles.playBadge, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="play" size={22} color={theme.primary} />
        </View>
        <View style={styles.externalBody}>
          <ThemedText type="smallBold">Vídeo explicativo</ThemedText>
          <ThemedText type="caption" themeColor="textMuted" numberOfLines={1}>
            Toca para abrirlo
          </ThemedText>
        </View>
        <Ionicons name="open-outline" size={18} color={theme.textMuted} />
      </Pressable>
    );
  }

  return <InlineExplanationVideo url={url} />;
}

function InlineExplanationVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url, (instance) => {
    instance.loop = false;
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      nativeControls
      contentFit="contain"
      fullscreenOptions={{ enable: true }}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  externalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
  },
  playBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalBody: {
    flex: 1,
    gap: 2,
  },
  pressed: { opacity: 0.85 },
});

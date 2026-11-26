import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

type ExerciseExplanationLinkProps = {
  url: string;
};

/** Botón que abre `explanationUrl` en el navegador (cualquier enlace). */
export function ExerciseExplanationMedia({ url }: ExerciseExplanationLinkProps) {
  const [opening, setOpening] = useState(false);

  const openLink = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || opening) return;

    setOpening(true);
    try {
      if (Platform.OS === 'web') {
        window.open(trimmed, '_blank', 'noopener,noreferrer');
        return;
      }
      await openBrowserAsync(trimmed, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      Alert.alert('Error', 'No se pudo abrir el enlace de explicación.');
    } finally {
      setOpening(false);
    }
  }, [opening, url]);

  return (
    <View style={styles.wrap}>
      <Button
        title={opening ? 'Abriendo…' : 'Abrir enlace de explicación'}
        icon="open-outline"
        variant="secondary"
        onPress={() => {
          void openLink();
        }}
        disabled={opening}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
});

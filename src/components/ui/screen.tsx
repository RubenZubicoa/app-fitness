import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  /** Cabecera fija a pantalla completa (por ejemplo, un degradado). */
  header?: ReactNode;
  /** Deja espacio inferior para la barra de pestañas. */
  withTabBar?: boolean;
  /**
   * Si false, no usa ScrollView (para pantallas con FlatList propia).
   * Default true.
   */
  scroll?: boolean;
  contentStyle?: object;
};

/** Envoltorio de pantalla: fondo temático, scroll y ancho máximo centrado. */
export function Screen({
  children,
  header,
  withTabBar = true,
  scroll = true,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = (withTabBar ? BottomTabInset : insets.bottom) + Spacing.four;

  const body = (
    <>
      {header}
      <View style={styles.centerer}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.scrollContent, { paddingBottom: bottomPad }]}>
          {body}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerer: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
});

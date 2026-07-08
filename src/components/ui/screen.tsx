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
  contentStyle?: object;
};

/** Envoltorio de pantalla: fondo temático, scroll y ancho máximo centrado. */
export function Screen({ children, header, withTabBar = true, contentStyle }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: (withTabBar ? BottomTabInset : insets.bottom) + Spacing.four,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {header}
        <View style={styles.centerer}>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
      </ScrollView>
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

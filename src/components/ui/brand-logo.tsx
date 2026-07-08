import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const SOURCES = {
  vertical: require('@/assets/images/brand/logo-vertical.png'),
  horizontal: require('@/assets/images/brand/logo-horizontal.png'),
  monogram: require('@/assets/images/brand/favicon-270.png'),
} as const;

type BrandLogoProps = {
  variant?: keyof typeof SOURCES;
  width?: number;
  style?: ViewStyle;
};

/**
 * Logo corporativo Onatz Health Coach.
 * - vertical: monograma + HEALTH COACH (login, splash)
 * - horizontal: monograma + texto en fila (cabeceras)
 * - monogram: solo el emblema circular dorado
 */
export function BrandLogo({ variant = 'vertical', width = 150, style }: BrandLogoProps) {
  const heights: Record<keyof typeof SOURCES, number> = {
    vertical: width * 1.12,
    horizontal: width / 2.85,
    monogram: width,
  };

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={SOURCES[variant]}
        style={{ width, height: heights[variant] }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});

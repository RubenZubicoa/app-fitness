import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Brand, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

type GradientHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  gradient?: readonly [string, string];
  showBack?: boolean;
  showLogo?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightAccessory?: ReactNode;
  children?: ReactNode;
};

/** Cabecera con degradado, capa decorativa y jerarquía tipográfica cuidada. */
export function GradientHeader({
  title,
  subtitle,
  eyebrow,
  gradient = Brand.gradientNavy,
  showBack = false,
  showLogo = false,
  rightIcon,
  onRightPress,
  rightAccessory,
  children,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Sobre degradados dorados el acento dorado no contrasta: usamos blanco.
  const isLightGradient = gradient[0].toUpperCase() === '#F2C868';
  const accent = isLightGradient ? '#FFFFFF' : Brand.goldLight;

  return (
    <LinearGradient
      colors={[gradient[0], gradient[1]]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
      {/* Capa decorativa: orbes translúcidos para dar profundidad */}
      <View pointerEvents="none" style={styles.decor}>
        <View style={[styles.orb, styles.orbLarge]} />
        <View style={[styles.orb, styles.orbRing]} />
        <View style={[styles.orb, styles.orbSmall]} />
      </View>

      <View style={styles.inner}>
        {showBack && (
          <View style={styles.topRow}>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              onPress={() => router.back()}
              hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {(showLogo || rightAccessory || rightIcon) && (
          <View style={styles.logoRow}>
            {showLogo ? (
              <BrandLogo variant="horizontal" width={190} />
            ) : (
              <View style={styles.logoSpacer} />
            )}
            <View style={styles.rightGroup}>
              {rightAccessory}
              {rightIcon && (
                <Pressable
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                  onPress={onRightPress}
                  hitSlop={8}>
                  <Ionicons name={rightIcon} size={20} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {eyebrow && (
          <View style={styles.eyebrowPill}>
            <View style={[styles.eyebrowDot, { backgroundColor: accent }]} />
            <ThemedText type="caption" style={styles.eyebrowText}>
              {eyebrow}
            </ThemedText>
          </View>
        )}

        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>

        {subtitle && (
          <ThemedText type="body" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}

        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.five,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  decor: {
    ...StyleSheet.absoluteFill,
  },
  orb: {
    position: 'absolute',
    borderRadius: 200,
  },
  orbLarge: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  orbRing: {
    width: 130,
    height: 130,
    top: -20,
    right: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  orbSmall: {
    width: 150,
    height: 150,
    bottom: -70,
    left: -40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  logoSpacer: {
    flex: 1,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: Spacing.two,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eyebrowText: {
    color: 'rgba(255,255,255,0.95)',
  },
  title: {
    color: '#FFFFFF',
    lineHeight: 42,
    paddingVertical: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    marginTop: Spacing.half,
    maxWidth: 420,
  },
});

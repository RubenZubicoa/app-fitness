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
  children?: ReactNode;
};

/** Cabecera con degradado a pantalla completa y contenido opcional. */
export function GradientHeader({
  title,
  subtitle,
  eyebrow,
  gradient = Brand.gradientNavy,
  showBack = false,
  showLogo = false,
  rightIcon,
  onRightPress,
  children,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[gradient[0], gradient[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.inner}>
        {(showBack || rightIcon) && (
          <View style={styles.topRow}>
            {showBack ? (
              <Pressable style={styles.iconButton} onPress={() => router.back()} hitSlop={8}>
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View style={styles.iconButton} />
            )}
            {rightIcon && (
              <Pressable style={styles.iconButton} onPress={onRightPress} hitSlop={8}>
                <Ionicons name={rightIcon} size={20} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        )}

        {showLogo && (
          <BrandLogo variant="horizontal" width={200} style={styles.logo} />
        )}

        {eyebrow && (
          <ThemedText type="label" style={styles.eyebrow}>
            {eyebrow}
          </ThemedText>
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
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.two,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    color: '#FFFFFF',
    lineHeight: 42,
    paddingVertical: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
});

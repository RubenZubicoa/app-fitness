import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { OnboardingStepStatus } from '@/onboarding';

type OnboardingStepItemProps = {
  step: OnboardingStepStatus;
  /** Compacto para tarjetas del home; completo para la pantalla de bienvenida. */
  variant?: 'card' | 'list';
};

/** Fila de un paso de onboarding (solo UI + navegación al href del paso). */
export function OnboardingStepItem({ step, variant = 'list' }: OnboardingStepItemProps) {
  const theme = useTheme();
  const router = useRouter();
  const compact = variant === 'card';

  const onPress = () => {
    if (step.done) return;
    router.push(step.href);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        compact && styles.rowCompact,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: step.done ? theme.success : theme.border,
        },
        pressed && !step.done && styles.pressed,
      ]}
      onPress={onPress}
      disabled={step.done}
      accessibilityRole="button"
      accessibilityLabel={
        step.done
          ? `${step.title}, completado`
          : `${step.title}. ${step.actionLabel}`
      }>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: step.done
              ? theme.success
              : theme.primarySoft,
          },
        ]}>
        <Ionicons
          name={step.done ? 'checkmark' : step.icon}
          size={18}
          color={step.done ? '#FFFFFF' : theme.primary}
        />
      </View>

      <View style={styles.body}>
        <ThemedText type="caption" themeColor="textMuted">
          PASO {step.index + 1}
        </ThemedText>
        <ThemedText type="smallBold">{step.title}</ThemedText>
        {!compact ? (
          <ThemedText type="caption" themeColor="textSecondary">
            {step.description}
          </ThemedText>
        ) : null}
      </View>

      {step.done ? (
        <Badge label="Hecho" tone="success" />
      ) : (
        <View style={styles.action}>
          <ThemedText type="caption" themeColor="primary" style={styles.actionLabel}>
            {step.actionLabel}
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={theme.primary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowCompact: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.two,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLabel: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});

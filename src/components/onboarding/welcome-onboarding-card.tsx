import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingStepItem } from '@/components/onboarding/onboarding-step-item';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useOnboardingProgress } from '@/hooks/use-onboarding-progress';
import { useTheme } from '@/hooks/use-theme';

type WelcomeOnboardingCardProps = {
  /** Si true, muestra todos los pasos; si false, solo los pendientes. */
  showCompleted?: boolean;
};

/**
 * Tarjeta "Bienvenida" del home: resume los pasos que faltan
 * para completar el registro tras el alta.
 */
export function WelcomeOnboardingCard({ showCompleted = false }: WelcomeOnboardingCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { loading, isComplete, pendingSteps, steps, completedCount, totalSteps } =
    useOnboardingProgress();

  if (loading || isComplete) return null;

  const sourceSteps = showCompleted ? steps : pendingSteps;
  const previewSteps = sourceSteps.slice(0, 2);
  const hiddenCount = Math.max(0, sourceSteps.length - previewSteps.length);

  return (
    <Card style={[styles.card, { borderColor: theme.gold, backgroundColor: theme.goldSoft }]}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        onPress={() => router.push('/onboarding')}
        accessibilityRole="button"
        accessibilityLabel="Abrir bienvenida y pasos pendientes">
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(228, 169, 60, 0.22)' }]}>
          <Ionicons name="sparkles-outline" size={18} color={Brand.gold} />
        </View>
        <View style={styles.headerBody}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold">Bienvenida</ThemedText>
            <Badge label={`${completedCount}/${totalSteps}`} tone="gold" />
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            Te quedan {pendingSteps.length} paso
            {pendingSteps.length === 1 ? '' : 's'} para completar tu registro
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </Pressable>

      <View style={styles.steps}>
        {previewSteps.map((step) => (
          <OnboardingStepItem key={step.id} step={step} variant="card" />
        ))}
      </View>

      {hiddenCount > 0 ? (
        <Pressable onPress={() => router.push('/onboarding')} hitSlop={8}>
          <ThemedText type="caption" themeColor="primary" style={styles.more}>
            Ver {hiddenCount} paso{hiddenCount === 1 ? '' : 's'} más
          </ThemedText>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  steps: {
    gap: Spacing.two,
  },
  more: {
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});

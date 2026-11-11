import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { OnboardingProgressSummary } from '@/components/onboarding/onboarding-progress-summary';
import { OnboardingStepItem } from '@/components/onboarding/onboarding-step-item';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import { useOnboardingProgress } from '@/hooks/use-onboarding-progress';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { loading, steps, completedCount, totalSteps, progress, isComplete, pendingSteps } =
    useOnboardingProgress();

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          showLogo
          eyebrow="Bienvenida"
          title="Completa tu registro"
          subtitle="Estos pasos ayudan a personalizar tu Método Regenesis"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.content}>
        {loading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={theme.gold} />
            <ThemedText type="body" themeColor="textSecondary">
              Revisando tu progreso…
            </ThemedText>
          </Card>
        ) : (
          <>
            <OnboardingProgressSummary
              completedCount={completedCount}
              totalSteps={totalSteps}
              progress={progress}
            />

            <View style={styles.steps}>
              {steps.map((step) => (
                <OnboardingStepItem key={step.id} step={step} variant="list" />
              ))}
            </View>

            {!isComplete ? (
              <Card style={styles.info}>
                <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
                <ThemedText type="body" themeColor="textSecondary" style={styles.infoText}>
                  Te quedan {pendingSteps.length} paso
                  {pendingSteps.length === 1 ? '' : 's'}. Empieza por peso, medidas e imágenes de
                  progreso.
                </ThemedText>
              </Card>
            ) : null}

            <Button
              title={isComplete ? 'Ir al inicio' : 'Volver al inicio'}
              icon="home-outline"
              variant={isComplete ? 'primary' : 'secondary'}
              onPress={() => router.replace('/home')}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  loadingCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  steps: {
    gap: Spacing.two,
  },
  info: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
  },
});

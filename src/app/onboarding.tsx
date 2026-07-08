import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { onboardingSteps } from '@/data/mock';

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const completed = onboardingSteps.filter((s) => s.done).length;
  const progress = completed / onboardingSteps.length;

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          showLogo
          eyebrow="Cuestionario inicial"
          title="Empieza tu Regenesis"
          subtitle="Completa tu perfil para recibir tu plan en 48h"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View style={styles.content}>
        <Card>
          <View style={styles.progressHeader}>
            <ThemedText type="h3">Progreso del cuestionario</ThemedText>
            <Badge label={`${completed}/${onboardingSteps.length}`} tone="gold" />
          </View>
          <View style={[styles.track, { backgroundColor: theme.track }]}>
            <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: theme.gold }]} />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Tu coach recibirá un aviso cuando lo completes.
          </ThemedText>
        </Card>

        <View style={styles.steps}>
          {onboardingSteps.map((step, index) => {
            const isCurrent = 'current' in step && step.current;
            const isDone = step.done;
            return (
              <Card
                key={step.title}
                style={[
                  styles.step,
                  isCurrent && { borderColor: theme.primary, borderWidth: 2 },
                ]}>
                <View style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor: isDone
                          ? theme.success
                          : isCurrent
                            ? theme.primarySoft
                            : theme.backgroundElement,
                      },
                    ]}>
                    {isDone ? (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={step.icon}
                        size={18}
                        color={isCurrent ? theme.primary : theme.textMuted}
                      />
                    )}
                  </View>
                  <View style={styles.stepBody}>
                    <ThemedText type="caption" themeColor="textMuted">
                      PASO {index + 1}
                    </ThemedText>
                    <ThemedText type="h3">{step.title}</ThemedText>
                    {isCurrent && <Badge label="En curso" tone="primary" />}
                    {isDone && <Badge label="Completado" tone="success" />}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <Card style={styles.info}>
          <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
          <ThemedText type="body" themeColor="textSecondary" style={styles.infoText}>
            Incluye medidas, fotos y datos de salud. Al finalizar, recibirás tu planificación en un
            máximo de 48 horas y se activará el contador de 12 semanas.
          </ThemedText>
        </Card>

        <Button title="Continuar cuestionario" icon="arrow-forward-outline" onPress={() => router.replace('/home')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  track: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  fill: { height: '100%', borderRadius: Radius.pill },
  steps: { gap: Spacing.two },
  step: { paddingVertical: Spacing.two + 2 },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: { flex: 1, gap: 4 },
  info: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1 },
});

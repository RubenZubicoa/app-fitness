import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { ClientProvider } from '@/context/client-context';
import { DailyStepsProvider } from '@/context/daily-steps-context';
import { MacrosProvider } from '@/context/macros-context';
import { MeasurementsProvider } from '@/context/measurements-context';
import { ProgramsProvider } from '@/context/programs-context';
import { RoutineProvider } from '@/context/routine-context';
import { ShoppingListProvider } from '@/context/shopping-list-context';
import { MealProvider } from '@/context/meal-context';
import { SocialFeedProvider } from '@/context/social-feed-context';
import { SupplementsProvider } from '@/context/supplements-context';
import { WeightsProvider } from '@/context/weights-context';
import { WellnessProvider } from '@/context/wellness-context';
import { WorkoutHistoryProvider } from '@/context/workout-history-context';
import { ThemePreferenceProvider, useThemePreference } from '@/hooks/theme-preference';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { scheme } = useThemePreference();
  const isDark = scheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: palette.background,
      card: palette.card,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="home" />
        <Stack.Screen name="sesion-entreno" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="anadir-registro" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="historico-entreno" />
        <Stack.Screen name="historico-entreno-detalle" />
        <Stack.Screen name="revisiones" />
        <Stack.Screen name="videoteca" />
        <Stack.Screen name="social" />
        <Stack.Screen name="resultados" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemePreferenceProvider>
        <ClientProvider>
          <ProgramsProvider>
            <MeasurementsProvider>
              <WeightsProvider>
                <WellnessProvider>
                  <DailyStepsProvider>
                    <ShoppingListProvider>
                      <MacrosProvider>
                        <MealProvider>
                        <SupplementsProvider>
                          <RoutineProvider>
                            <WorkoutHistoryProvider>
                              <SocialFeedProvider>
                                <RootNavigator />
                              </SocialFeedProvider>
                            </WorkoutHistoryProvider>
                          </RoutineProvider>
                        </SupplementsProvider>
                        </MealProvider>
                      </MacrosProvider>
                    </ShoppingListProvider>
                  </DailyStepsProvider>
                </WellnessProvider>
              </WeightsProvider>
            </MeasurementsProvider>
          </ProgramsProvider>
        </ClientProvider>
      </ThemePreferenceProvider>
    </SafeAreaProvider>
  );
}

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
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
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.background },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="home" />
          <Stack.Screen name="revisiones" />
          <Stack.Screen name="videoteca" />
          <Stack.Screen name="social" />
          <Stack.Screen name="resultados" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceContextValue = {
  /** Preferencia elegida por el usuario. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Esquema efectivo aplicado (resuelve 'system' según el sistema operativo). */
  scheme: 'light' | 'dark';
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  const scheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({ preference, setPreference, scheme }),
    [preference, scheme],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference debe usarse dentro de ThemePreferenceProvider');
  }
  return context;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import {
  loadThemePreference,
  persistThemePreference,
} from '@/api/session-store';

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
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const saved = await loadThemePreference();
      if (cancelled || !saved) return;
      setPreferenceState(saved);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void persistThemePreference(next);
  }, []);

  const scheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({ preference, setPreference, scheme }),
    [preference, setPreference, scheme],
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

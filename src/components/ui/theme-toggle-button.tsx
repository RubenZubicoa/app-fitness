import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { useThemePreference } from '@/hooks/theme-preference';

/** Botón para alternar entre tema claro y oscuro (pensado para el header). */
export function ThemeToggleButton() {
  const { scheme, setPreference } = useThemePreference();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={() => setPreference(isDark ? 'light' : 'dark')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}>
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
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
});

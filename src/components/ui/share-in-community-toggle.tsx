import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ShareInCommunityToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

/** Permite al usuario decidir si publica el logro en la comunidad. */
export function ShareInCommunityToggle({
  value,
  onChange,
  disabled = false,
}: ShareInCommunityToggleProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.row,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      onPress={() => {
        if (!disabled) onChange(!value);
      }}>
      <View style={styles.iconWrap}>
        <Ionicons name="people-outline" size={18} color={theme.primary} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="smallBold">Compartir en comunidad</ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          Solo se publicará si lo activas
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: theme.track, true: theme.primarySoft }}
        thumbColor={value ? theme.primary : theme.card}
      />
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
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: readonly [string, string];
  fullWidth?: boolean;
};

/** Botón de marca. Solo presentación: no ejecuta lógica de negocio. */
export function Button({
  title,
  variant = 'primary',
  icon,
  gradient = Brand.gradientPrimary,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const content = (
    <View style={styles.row}>
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={variant === 'primary' ? '#0A1B33' : theme.primary}
        />
      )}
      <ThemedText
        type="smallBold"
        style={[
          styles.label,
          { color: variant === 'primary' ? '#0A1B33' : theme.primary },
        ]}>
        {title}
      </ThemedText>
    </View>
  );

  return (
    <Pressable
      style={({ pressed }) => [fullWidth && styles.fullWidth, pressed && styles.pressed, style as object]}
      {...rest}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={[gradient[0], gradient[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            variant === 'secondary'
              ? { backgroundColor: theme.primarySoft }
              : { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
          ]}>
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    minHeight: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});

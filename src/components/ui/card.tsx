import { View, StyleSheet, type ViewProps } from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
};

/** Tarjeta base con esquinas redondeadas, borde sutil y sombra suave. */
export function Card({ style, padded = true, elevated = true, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        padded && styles.padded,
        elevated && Shadow.card,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: Spacing.three,
  },
});

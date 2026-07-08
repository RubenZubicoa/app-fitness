import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

type IconBadgeProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  size?: number;
  style?: ViewStyle;
};

/** Contenedor circular con icono sobre fondo suave. */
export function IconBadge({ name, color, background, size = 44, style }: IconBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: Radius.md, backgroundColor: background },
        style,
      ]}>
      <Ionicons name={name} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

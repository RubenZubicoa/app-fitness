import { Ionicons } from '@expo/vector-icons';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabButtonProps = TabTriggerSlotProps & {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
};

/** Botón de pestaña individual para `expo-router/ui`. */
export const TabButton = forwardRef<View, TabButtonProps>(
  ({ icon, activeIcon, label, isFocused, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Pressable ref={ref} {...props} style={styles.item} hitSlop={6}>
        <View style={[styles.iconWrap, isFocused && { backgroundColor: theme.primarySoft }]}>
          <Ionicons
            name={isFocused ? activeIcon : icon}
            size={22}
            color={isFocused ? theme.primary : theme.textMuted}
          />
        </View>
        <ThemedText
          type="caption"
          style={{ color: isFocused ? theme.primary : theme.textMuted, fontSize: 10 }}>
          {label}
        </ThemedText>
      </Pressable>
    );
  },
);
TabButton.displayName = 'TabButton';

/** Contenedor flotante de la barra de pestañas. */
export function FloatingTabList({ children, ...props }: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}>
      <View
        style={[
          styles.bar,
          Shadow.floating,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

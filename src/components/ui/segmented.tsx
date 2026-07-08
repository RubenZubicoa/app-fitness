import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SegmentedProps<T extends string> = {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
};

/** Control segmentado (pestañas horizontales) para alternar vistas. */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={[styles.segment, active && { backgroundColor: theme.card }]}
            onPress={() => onChange(opt.key)}>
            <ThemedText
              type="smallBold"
              themeColor={active ? 'primary' : 'textSecondary'}
              style={styles.label}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
  },
});

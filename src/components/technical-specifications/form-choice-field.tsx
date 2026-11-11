import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { FormFieldOption } from '@/technical-specifications/form-fields';

type FormChoiceFieldProps = {
  label: string;
  value: string;
  options: FormFieldOption[];
  onChange: (value: string) => void;
  helper?: string;
};

/** Selector de opciones mutuamente excluyentes. */
export function FormChoiceField({
  label,
  value,
  options,
  onChange,
  helper,
}: FormChoiceFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <ThemedText type="caption" themeColor="textMuted" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.list}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  borderColor: active ? theme.primary : theme.border,
                  backgroundColor: active ? theme.primarySoft : theme.backgroundElement,
                },
              ]}>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: active ? theme.primary : theme.textMuted,
                  },
                ]}>
                {active ? (
                  <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />
                ) : null}
              </View>
              <ThemedText
                type="small"
                style={{ color: active ? theme.primary : theme.text, flex: 1 }}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {helper ? (
        <ThemedText type="caption" themeColor="textMuted">
          {helper}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one },
  label: {
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  list: { gap: Spacing.two },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

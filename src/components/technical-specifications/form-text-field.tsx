import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helper?: string;
  multiline?: boolean;
};

/** Campo de texto reutilizable para formularios de ficha técnica. */
export function FormTextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  multiline = false,
}: FormTextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <ThemedText type="caption" themeColor="textMuted" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
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
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 15,
    minHeight: 48,
  },
  multiline: {
    minHeight: 96,
    paddingTop: Spacing.two + 2,
  },
});

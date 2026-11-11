import { StyleSheet, View } from 'react-native';

import { FormChoiceField } from '@/components/technical-specifications/form-choice-field';
import { FormTextField } from '@/components/technical-specifications/form-text-field';
import { Spacing } from '@/constants/theme';
import type { FormFieldConfig } from '@/technical-specifications/form-fields';

type FormFieldsRendererProps<K extends string> = {
  fields: FormFieldConfig<K>[];
  values: Record<K, string>;
  onChange: (key: K, value: string) => void;
};

/** Renderiza una lista de campos de configuración de ficha técnica. */
export function FormFieldsRenderer<K extends string>({
  fields,
  values,
  onChange,
}: FormFieldsRendererProps<K>) {
  return (
    <View style={styles.list}>
      {fields.map((field) => {
        if (field.kind === 'choice' && field.options) {
          return (
            <FormChoiceField
              key={field.key}
              label={field.label}
              value={values[field.key] ?? ''}
              options={field.options}
              onChange={(value) => onChange(field.key, value)}
              helper={field.helper}
            />
          );
        }

        return (
          <FormTextField
            key={field.key}
            label={field.label}
            value={values[field.key] ?? ''}
            onChangeText={(value) => onChange(field.key, value)}
            placeholder={field.placeholder}
            helper={field.helper}
            multiline={field.kind === 'textarea'}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
});

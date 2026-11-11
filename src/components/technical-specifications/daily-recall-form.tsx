import { StyleSheet, View } from 'react-native';

import { FormFieldsRenderer } from '@/components/technical-specifications/form-fields-renderer';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import {
  DAILY_RECALL_ENTRY_FIELDS,
  DAILY_RECALL_MEALS,
} from '@/technical-specifications/form-fields';
import type { DailyRecall, DailyRecallEntry } from '@/types/technical-specifications';

type DailyRecallFormProps = {
  value: DailyRecall;
  onChange: (next: DailyRecall) => void;
};

/** Formulario del recordatorio 24 h (5 ingestas). */
export function DailyRecallForm({ value, onChange }: DailyRecallFormProps) {
  const updateMeal = (mealKey: keyof DailyRecall, entryKey: keyof DailyRecallEntry, text: string) => {
    onChange({
      ...value,
      [mealKey]: {
        ...value[mealKey],
        [entryKey]: text,
      },
    });
  };

  return (
    <View style={styles.list}>
      {DAILY_RECALL_MEALS.map((meal) => (
        <Card key={meal.key} style={styles.mealCard}>
          <ThemedText type="smallBold">{meal.label}</ThemedText>
          <FormFieldsRenderer
            fields={DAILY_RECALL_ENTRY_FIELDS}
            values={value[meal.key]}
            onChange={(key, text) => updateMeal(meal.key, key, text)}
          />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
  mealCard: { gap: Spacing.three },
});

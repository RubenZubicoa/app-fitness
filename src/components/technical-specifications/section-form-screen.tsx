import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DailyRecallForm } from '@/components/technical-specifications/daily-recall-form';
import { FormFieldsRenderer } from '@/components/technical-specifications/form-fields-renderer';
import { FormTextField } from '@/components/technical-specifications/form-text-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing } from '@/constants/theme';
import {
  getSectionDraft,
  useTechnicalSpecifications,
} from '@/context/technical-specifications-context';
import {
  EATING_HABITS_FIELDS,
  EXERCISE_HABITS_FIELDS,
  LIFESTYLE_FIELDS,
  PERSONAL_HISTORY_FIELDS,
  TECHNICAL_SECTION_META,
} from '@/technical-specifications/form-fields';
import {
  emptyDailyRecall,
  emptyEatingHabits,
  emptyExerciseHabits,
  emptyLifestyle,
  emptyPersonalHistory,
  isDailyRecallComplete,
  isEatingHabitsComplete,
  isExerciseHabitsComplete,
  isLifestyleComplete,
  isPersonalHistoryComplete,
  type DailyRecall,
  type EatingHabits,
  type ExerciseHabits,
  type Lifestyle,
  type PersonalHistory,
  type TechnicalSectionKey,
} from '@/types/technical-specifications';

const EMPTY_OBSERVATIONS_VALUE = 'Sin observaciones adicionales';

type SectionFormScreenProps = {
  section: TechnicalSectionKey;
};

/** Pantalla de formulario para una sección de la ficha técnica. */
export function SectionFormScreen({ section }: SectionFormScreenProps) {
  const router = useRouter();
  const meta = TECHNICAL_SECTION_META[section];
  const {
    specs,
    loading,
    saving,
    savePersonalHistory,
    saveEatingHabits,
    saveLifestyle,
    saveExerciseHabits,
    saveDailyRecall,
    saveObservations,
  } = useTechnicalSpecifications();

  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [personalHistory, setPersonalHistory] = useState<PersonalHistory>(emptyPersonalHistory);
  const [eatingHabits, setEatingHabits] = useState<EatingHabits>(emptyEatingHabits);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(emptyLifestyle);
  const [exerciseHabits, setExerciseHabits] = useState<ExerciseHabits>(emptyExerciseHabits);
  const [dailyRecall, setDailyRecall] = useState<DailyRecall>(emptyDailyRecall);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (loading || hydrated) return;
    setPersonalHistory(
      (getSectionDraft(specs, 'personalHistory') as PersonalHistory) ?? emptyPersonalHistory(),
    );
    setEatingHabits(
      (getSectionDraft(specs, 'eatingHabits') as EatingHabits) ?? emptyEatingHabits(),
    );
    setLifestyle((getSectionDraft(specs, 'lifestyle') as Lifestyle) ?? emptyLifestyle());
    setExerciseHabits(
      (getSectionDraft(specs, 'exerciseHabits') as ExerciseHabits) ?? emptyExerciseHabits(),
    );
    setDailyRecall(
      (getSectionDraft(specs, 'dailyRecall') as DailyRecall) ?? emptyDailyRecall(),
    );
    setObservations(String(getSectionDraft(specs, 'observations') ?? ''));
    setHydrated(true);
  }, [loading, specs, hydrated]);

  const validateAndSave = async () => {
    setError(null);
    try {
      switch (section) {
        case 'personalHistory':
          if (!isPersonalHistoryComplete(personalHistory)) {
            setError('Completa todos los campos de antecedentes personales.');
            return;
          }
          await savePersonalHistory(personalHistory);
          break;
        case 'eatingHabits':
          if (!isEatingHabitsComplete(eatingHabits)) {
            setError('Completa todos los campos de hábitos alimentarios.');
            return;
          }
          await saveEatingHabits(eatingHabits);
          break;
        case 'lifestyle':
          if (!isLifestyleComplete(lifestyle)) {
            setError('Completa todos los campos de hábitos de vida.');
            return;
          }
          await saveLifestyle(lifestyle);
          break;
        case 'exerciseHabits':
          if (!isExerciseHabitsComplete(exerciseHabits)) {
            setError('Completa todos los campos de ejercicio.');
            return;
          }
          await saveExerciseHabits(exerciseHabits);
          break;
        case 'dailyRecall':
          if (!isDailyRecallComplete(dailyRecall)) {
            setError('Completa ingredientes, cantidades y hora/lugar de cada ingesta.');
            return;
          }
          await saveDailyRecall(dailyRecall);
          break;
        case 'observations': {
          const value = observations.trim() || EMPTY_OBSERVATIONS_VALUE;
          await saveObservations(value);
          break;
        }
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  };

  const skipObservations = async () => {
    setError(null);
    try {
      await saveObservations(EMPTY_OBSERVATIONS_VALUE);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Ficha técnica"
          title={meta.title}
          subtitle={meta.subtitle}
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <Card style={styles.card}>
        {section === 'personalHistory' ? (
          <FormFieldsRenderer
            fields={PERSONAL_HISTORY_FIELDS}
            values={personalHistory}
            onChange={(key, value) =>
              setPersonalHistory((prev) => ({ ...prev, [key]: value }))
            }
          />
        ) : null}

        {section === 'eatingHabits' ? (
          <FormFieldsRenderer
            fields={EATING_HABITS_FIELDS}
            values={eatingHabits}
            onChange={(key, value) =>
              setEatingHabits((prev) => ({ ...prev, [key]: value }))
            }
          />
        ) : null}

        {section === 'lifestyle' ? (
          <FormFieldsRenderer
            fields={LIFESTYLE_FIELDS}
            values={lifestyle}
            onChange={(key, value) => setLifestyle((prev) => ({ ...prev, [key]: value }))}
          />
        ) : null}

        {section === 'exerciseHabits' ? (
          <FormFieldsRenderer
            fields={EXERCISE_HABITS_FIELDS}
            values={exerciseHabits}
            onChange={(key, value) =>
              setExerciseHabits((prev) => ({ ...prev, [key]: value }))
            }
          />
        ) : null}

        {section === 'dailyRecall' ? (
          <DailyRecallForm value={dailyRecall} onChange={setDailyRecall} />
        ) : null}

        {section === 'observations' ? (
          <View style={styles.observations}>
            <ThemedText type="small" themeColor="textSecondary">
              ¿Algo importante que se haya quedado fuera? Cuéntalo aquí. Si no quieres añadir
              nada, puedes omitir este paso.
            </ThemedText>
            <FormTextField
              label="Observaciones"
              value={
                observations === EMPTY_OBSERVATIONS_VALUE ? '' : observations
              }
              onChangeText={setObservations}
              placeholder="Escribe lo que veas necesario…"
              multiline
            />
          </View>
        ) : null}

        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          title={saving ? 'Guardando…' : 'Guardar'}
          icon="checkmark-outline"
          onPress={() => {
            void validateAndSave();
          }}
          disabled={saving}
        />

        {section === 'observations' ? (
          <Button
            title="Omitir este paso"
            variant="secondary"
            icon="arrow-forward-outline"
            onPress={() => {
              void skipObservations();
            }}
            disabled={saving}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  observations: { gap: Spacing.three },
  error: { color: '#F0506E' },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { ShareInCommunityToggle } from '@/components/ui/share-in-community-toggle';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useMeasurements } from '@/context/measurements-context';
import { useWeights } from '@/context/weights-context';
import { useWellness } from '@/context/wellness-context';
import { appendWeightEntry } from '@/api/weights';
import { createMeasurement } from '@/api/measurements';
import { createWellness } from '@/api/wellness';
import { useTheme } from '@/hooks/use-theme';
import { getLatestWeightValue } from '@/types/weight';
import { latestMeasurementsByType } from '@/types/measurement';

type PhotoSlot = {
  key: 'front' | 'side' | 'back';
  label: string;
  uri: string | null;
};

const PHOTO_SLOTS: Omit<PhotoSlot, 'uri'>[] = [
  { key: 'front', label: 'Frente' },
  { key: 'side', label: 'Lado' },
  { key: 'back', label: 'Espalda' },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export default function AnadirRegistroScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { client } = useClient();
  const { weight, refreshWeight } = useWeights();
  const { masters: measurementMasters, measurements, refreshMeasurements } = useMeasurements();
  const { masters: wellnessMasters, refreshWellness } = useWellness();

  const latestByMeasure = useMemo(
    () => latestMeasurementsByType(measurements),
    [measurements],
  );

  const [weightValue, setWeightValue] = useState('');
  const [measureValues, setMeasureValues] = useState<Record<string, string>>({});
  const [wellnessValues, setWellnessValues] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    PHOTO_SLOTS.map((slot) => ({ ...slot, uri: null })),
  );
  const [shareInCommunity, setShareInCommunity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (!client) return;
    // Esperar a que carguen masters (pueden venir vacíos al inicio)
    if (measurementMasters.length === 0 && wellnessMasters.length === 0 && !weight) {
      return;
    }

    if (weight) {
      setWeightValue(String(getLatestWeightValue(weight)));
    }

    const nextMeasures: Record<string, string> = {};
    for (const master of measurementMasters) {
      const latest = latestByMeasure.find((m) => m.MeasurementId === master._id);
      nextMeasures[master._id] = latest ? String(latest.value) : '';
    }
    setMeasureValues(nextMeasures);

    const nextWellness: Record<string, string> = {};
    for (const master of wellnessMasters) {
      nextWellness[master._id] = '';
    }
    setWellnessValues(nextWellness);
    setInitialized(true);
  }, [
    initialized,
    client,
    weight,
    measurementMasters,
    wellnessMasters,
    latestByMeasure,
  ]);

  if (!client) return null;

  const updateMeasure = (id: string, value: string) => {
    setMeasureValues((prev) => ({ ...prev, [id]: value }));
  };

  const updateWellness = (id: string, value: string) => {
    setWellnessValues((prev) => ({ ...prev, [id]: value }));
  };

  const pickPhoto = async (key: PhotoSlot['key']) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      const message = 'Necesitamos permiso para acceder a tu galería.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Permiso requerido', message);
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setPhotos((prev) =>
      prev.map((slot) => (slot.key === key ? { ...slot, uri: result.assets[0].uri } : slot)),
    );
  };

  const clearPhoto = (key: PhotoSlot['key']) => {
    setPhotos((prev) =>
      prev.map((slot) => (slot.key === key ? { ...slot, uri: null } : slot)),
    );
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    const date = todayIso();
    const weightNum = parseOptionalNumber(weightValue);

    try {
      if (weightNum != null) {
        if (weightNum <= 0) {
          throw new Error('El peso debe ser mayor que 0');
        }
        await appendWeightEntry({
          clientId: client._id,
          value: weightNum,
          date,
          existing: weight,
          shareInCommunity,
        });
        await refreshWeight();
      }

      for (const master of measurementMasters) {
        const value = parseOptionalNumber(measureValues[master._id] ?? '');
        if (value == null) continue;
        if (value <= 0) {
          throw new Error(`${master.label}: introduce un valor válido`);
        }
        const previous = latestByMeasure.find((m) => m.MeasurementId === master._id);
        const delta = previous ? Number((value - previous.value).toFixed(1)) : 0;
        await createMeasurement({
          client: client._id,
          MeasurementId: master._id,
          value,
          delta,
          date,
          shareInCommunity,
        });
      }
      await refreshMeasurements();

      for (const master of wellnessMasters) {
        const value = parseOptionalNumber(wellnessValues[master._id] ?? '');
        if (value == null) continue;
        if (value < 0 || value > 100) {
          throw new Error(`${master.label}: usa un valor entre 0 y 100`);
        }
        await createWellness({
          clientId: client._id,
          wellnessId: master._id,
          value,
          date,
          shareInCommunity,
        });
      }
      await refreshWellness();

      const selectedPhotos = photos.filter((p) => p.uri);
      if (selectedPhotos.length > 0) {
        // Las fotos quedan seleccionadas en el formulario; aún no hay endpoint de persistencia.
        console.info(
          'Fotos de progreso seleccionadas (pendiente de API):',
          selectedPhotos.map((p) => p.key),
        );
      }

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Área personal"
          title="Nuevo registro"
          subtitle="Peso, medidas, sensaciones y fotos de progreso"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <View>
        <SectionHeader title="Peso corporal" />
        <Card style={styles.sectionCard}>
          <ThemedText type="caption" themeColor="textMuted">
            PESO (KG)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
            value={weightValue}
            onChangeText={setWeightValue}
            placeholder={weight ? String(getLatestWeightValue(weight)) : 'Ej. 65.4'}
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
          />
        </Card>
      </View>

      <View>
        <SectionHeader title="Medidas corporales" />
        <Card style={styles.sectionCard}>
          {measurementMasters.length === 0 ? (
            <ThemedText type="body" themeColor="textSecondary">
              No hay tipos de medida configurados.
            </ThemedText>
          ) : (
            <View style={styles.fields}>
              {measurementMasters.map((master) => (
                <View key={master._id} style={styles.field}>
                  <ThemedText type="caption" themeColor="textMuted">
                    {master.label.toUpperCase()} ({master.unit})
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}
                    value={measureValues[master._id] ?? ''}
                    onChangeText={(text) => updateMeasure(master._id, text)}
                    placeholder="—"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>

      <View>
        <SectionHeader title="Sensaciones diarias" />
        <Card style={styles.sectionCard}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Valora cada sensación de 0 a 100.
          </ThemedText>
          {wellnessMasters.length === 0 ? (
            <ThemedText type="body" themeColor="textSecondary">
              No hay sensaciones configuradas.
            </ThemedText>
          ) : (
            <View style={styles.fields}>
              {wellnessMasters.map((master) => (
                <View key={master._id} style={styles.field}>
                  <View style={styles.wellnessLabel}>
                    <Ionicons
                      name={(master.icon as keyof typeof Ionicons.glyphMap) || 'pulse-outline'}
                      size={16}
                      color={theme.primary}
                    />
                    <ThemedText type="caption" themeColor="textMuted">
                      {master.label.toUpperCase()}
                    </ThemedText>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}
                    value={wellnessValues[master._id] ?? ''}
                    onChangeText={(text) => updateWellness(master._id, text)}
                    placeholder="0–100"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>

      <View>
        <SectionHeader title="Fotos de progreso" />
        <Card style={styles.sectionCard}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Añade frente, lado y espalda. Se guardarán cuando el API de fotos esté disponible.
          </ThemedText>
          <View style={styles.photoRow}>
            {photos.map((slot) => (
              <View key={slot.key} style={styles.photoSlot}>
                <Pressable
                  style={[
                    styles.photoBox,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    void pickPhoto(slot.key);
                  }}>
                  {slot.uri ? (
                    <Image source={{ uri: slot.uri }} style={styles.photoImage} contentFit="cover" />
                  ) : (
                    <View style={styles.photoEmpty}>
                      <Ionicons name="camera-outline" size={22} color={theme.primary} />
                      <ThemedText type="caption" themeColor="textMuted">
                        {slot.label}
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
                {slot.uri ? (
                  <Pressable onPress={() => clearPhoto(slot.key)} hitSlop={8}>
                    <ThemedText type="caption" themeColor="textSecondary">
                      Quitar
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        </Card>
      </View>

      {error ? (
        <ThemedText type="body" themeColor="textSecondary" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <ShareInCommunityToggle
        value={shareInCommunity}
        onChange={setShareInCommunity}
        disabled={saving}
      />

      <Button
        title={saving ? 'Guardando…' : 'Guardar registro'}
        icon="checkmark-done"
        onPress={() => {
          void handleSave();
        }}
        disabled={saving}
      />
      <Button
        title="Cancelar"
        variant="ghost"
        icon="close"
        onPress={() => router.back()}
        disabled={saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: { gap: Spacing.two },
  fields: { gap: Spacing.three },
  field: { gap: Spacing.one },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: { marginBottom: Spacing.one },
  wellnessLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  photoSlot: {
    flex: 1,
    gap: Spacing.one,
    alignItems: 'center',
  },
  photoBox: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmpty: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  error: { marginBottom: Spacing.two },
});

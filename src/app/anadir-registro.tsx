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
import { useProgressImages } from '@/context/progress-images-context';
import { useWeights } from '@/context/weights-context';
import { useWellness } from '@/context/wellness-context';
import { appendWeightEntry } from '@/api/weights';
import { createMeasurement } from '@/api/measurements';
import { createWellness } from '@/api/wellness';
import { uploadProgressImage } from '@/api/progress-images';
import { useTheme } from '@/hooks/use-theme';
import { getLatestWeightValue } from '@/types/weight';
import { latestMeasurementsByType } from '@/types/measurement';

type ProgressPhoto = {
  id: string;
  uri: string;
};

function newPhotoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
  const { refreshProgressImages } = useProgressImages();

  const latestByMeasure = useMemo(
    () => latestMeasurementsByType(measurements),
    [measurements],
  );

  const [weightValue, setWeightValue] = useState('');
  const [measureValues, setMeasureValues] = useState<Record<string, string>>({});
  const [wellnessValues, setWellnessValues] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
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

  const pickPhotos = async () => {
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
      allowsMultipleSelection: true,
      selectionLimit: 0,
    });

    if (result.canceled || result.assets.length === 0) return;

    const newPhotos = result.assets
      .filter((asset) => asset.uri)
      .map((asset) => ({ id: newPhotoId(), uri: asset.uri! }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
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

      if (photos.length > 0) {
        await Promise.all(
          photos.map((photo, index) =>
            uploadProgressImage(
              client._id,
              photo.uri,
              `progress-${Date.now()}-${index}.jpg`,
            ),
          ),
        );
        await refreshProgressImages();
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
            Añade tantas fotos como quieras. Se subirán al guardar el registro.
          </ThemedText>

          {photos.length > 0 ? (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoItem}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    contentFit="cover"
                  />
                  <Pressable
                    style={[styles.removePhotoBtn, { backgroundColor: theme.coral }]}
                    onPress={() => removePhoto(photo.id)}
                    hitSlop={8}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            title={photos.length > 0 ? 'Añadir más fotos' : 'Añadir fotos'}
            icon="images-outline"
            variant="secondary"
            onPress={() => {
              void pickPhotos();
            }}
            disabled={saving}
          />
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  error: { marginBottom: Spacing.two },
});

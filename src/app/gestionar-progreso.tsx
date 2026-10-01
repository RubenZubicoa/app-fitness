import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useMeasurements } from '@/context/measurements-context';
import { useProgressImages } from '@/context/progress-images-context';
import { useWeights } from '@/context/weights-context';
import { useTheme } from '@/hooks/use-theme';
import { enrichMeasurement, formatChartDate } from '@/types/measurement';
import { formatProgressImageDate } from '@/types/progress-image';

type TabKey = 'weight' | 'measures' | 'photos';

function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : true;
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function GestionarProgresoScreen() {
  const theme = useTheme();
  const { client } = useClient();
  const {
    weight,
    loading: weightLoading,
    saving: weightSaving,
    error: weightError,
    updateWeightEntry,
    deleteWeightEntry,
  } = useWeights();
  const {
    masters,
    measurements,
    loading: measuresLoading,
    saving: measuresSaving,
    error: measuresError,
    updateMeasurement,
    deleteMeasurement,
  } = useMeasurements();
  const {
    images,
    loading: imagesLoading,
    saving: imagesSaving,
    error: imagesError,
    deleteProgressImage,
    replaceProgressImage,
  } = useProgressImages();

  const [tab, setTab] = useState<TabKey>('weight');
  const [editingWeightIndex, setEditingWeightIndex] = useState<number | null>(null);
  const [weightValue, setWeightValue] = useState('');
  const [editingMeasureId, setEditingMeasureId] = useState<string | null>(null);
  const [measureValue, setMeasureValue] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const weightEntries = useMemo(() => {
    if (!weight) return [];
    const len = Math.min(weight.labels.length, weight.data.length);
    return Array.from({ length: len }, (_, index) => ({
      index,
      date: weight.labels[index],
      value: weight.data[index],
    })).reverse();
  }, [weight]);

  const enrichedMeasurements = useMemo(
    () =>
      [...measurements]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((item) => enrichMeasurement(item, masters)),
    [measurements, masters],
  );

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [images],
  );

  if (!client) return null;

  const busy = weightSaving || measuresSaving || imagesSaving;

  const startEditWeight = (index: number, value: number) => {
    setEditingWeightIndex(index);
    setWeightValue(String(value));
    setActionError(null);
  };

  const saveWeight = async () => {
    if (editingWeightIndex == null) return;
    const parsed = Number(weightValue.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setActionError('Introduce un peso válido');
      return;
    }
    try {
      await updateWeightEntry(editingWeightIndex, parsed);
      setEditingWeightIndex(null);
      setWeightValue('');
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo guardar el peso');
    }
  };

  const removeWeight = (index: number) => {
    confirmAction('Eliminar peso', '¿Seguro que quieres eliminar este registro de peso?', () => {
      void (async () => {
        try {
          await deleteWeightEntry(index);
          if (editingWeightIndex === index) {
            setEditingWeightIndex(null);
            setWeightValue('');
          }
          setActionError(null);
        } catch (err) {
          setActionError(err instanceof Error ? err.message : 'No se pudo eliminar el peso');
        }
      })();
    });
  };

  const startEditMeasure = (id: string, value: number) => {
    setEditingMeasureId(id);
    setMeasureValue(String(value));
    setActionError(null);
  };

  const saveMeasure = async () => {
    if (!editingMeasureId) return;
    const parsed = Number(measureValue.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setActionError('Introduce una medida válida');
      return;
    }
    const current = measurements.find((item) => item._id === editingMeasureId);
    const delta = current ? Number((parsed - current.value).toFixed(1)) : 0;
    try {
      await updateMeasurement(editingMeasureId, { value: parsed, delta });
      setEditingMeasureId(null);
      setMeasureValue('');
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo guardar la medida');
    }
  };

  const removeMeasure = (id: string) => {
    confirmAction('Eliminar medida', '¿Seguro que quieres eliminar esta medida corporal?', () => {
      void (async () => {
        try {
          await deleteMeasurement(id);
          if (editingMeasureId === id) {
            setEditingMeasureId(null);
            setMeasureValue('');
          }
          setActionError(null);
        } catch (err) {
          setActionError(err instanceof Error ? err.message : 'No se pudo eliminar la medida');
        }
      })();
    });
  };

  const removeImage = (id: string) => {
    confirmAction('Eliminar foto', '¿Seguro que quieres eliminar esta imagen de progreso?', () => {
      void (async () => {
        try {
          await deleteProgressImage(id);
          setActionError(null);
        } catch (err) {
          setActionError(err instanceof Error ? err.message : 'No se pudo eliminar la foto');
        }
      })();
    });
  };

  const replaceImage = async (id: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      const message = 'Necesitamos permiso para acceder a tu galería.';
      if (Platform.OS === 'web') window.alert(message);
      else Alert.alert('Permiso requerido', message);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    try {
      await replaceProgressImage(id, result.assets[0].uri);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo reemplazar la foto');
    }
  };

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Área personal"
          title="Gestionar progreso"
          subtitle="Edita o elimina peso, medidas e imágenes"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <Segmented
        options={[
          { key: 'weight', label: 'Peso' },
          { key: 'measures', label: 'Medidas' },
          { key: 'photos', label: 'Fotos' },
        ]}
        value={tab}
        onChange={(key) => {
          setTab(key);
          setActionError(null);
        }}
      />

      {actionError ? (
        <ThemedText type="body" themeColor="textSecondary" style={styles.error}>
          {actionError}
        </ThemedText>
      ) : null}

      {tab === 'weight' ? (
        <View>
          <SectionHeader title="Registros de peso" />
          {weightLoading ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                Cargando peso…
              </ThemedText>
            </Card>
          ) : weightError ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                {weightError}
              </ThemedText>
            </Card>
          ) : weightEntries.length === 0 ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                No hay registros de peso.
              </ThemedText>
            </Card>
          ) : (
            <View style={styles.list}>
              {weightEntries.map((entry) => {
                const editing = editingWeightIndex === entry.index;
                return (
                  <Card key={`${entry.date}-${entry.index}`} style={styles.rowCard}>
                    <View style={styles.rowMain}>
                      <View style={styles.rowInfo}>
                        <ThemedText type="smallBold">
                          {formatChartDate(entry.date)}
                        </ThemedText>
                        {!editing ? (
                          <ThemedText type="h3">
                            {entry.value} {weight?.unit ?? 'kg'}
                          </ThemedText>
                        ) : (
                          <TextInput
                            style={[
                              styles.input,
                              {
                                color: theme.text,
                                borderColor: theme.border,
                                backgroundColor: theme.backgroundElement,
                              },
                            ]}
                            value={weightValue}
                            onChangeText={setWeightValue}
                            keyboardType="decimal-pad"
                            editable={!busy}
                            autoFocus
                          />
                        )}
                      </View>
                      <View style={styles.rowActions}>
                        {!editing ? (
                          <>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.primarySoft },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => startEditWeight(entry.index, entry.value)}
                              disabled={busy}>
                              <Ionicons name="create-outline" size={18} color={theme.primary} />
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: '#FDE8ED' },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => removeWeight(entry.index)}
                              disabled={busy}>
                              <Ionicons name="trash-outline" size={18} color={theme.coral} />
                            </Pressable>
                          </>
                        ) : (
                          <>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.backgroundElement },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => {
                                setEditingWeightIndex(null);
                                setWeightValue('');
                              }}
                              disabled={busy}>
                              <Ionicons name="close" size={18} color={theme.textMuted} />
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.teal, opacity: busy ? 0.6 : 1 },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => {
                                void saveWeight();
                              }}
                              disabled={busy}>
                              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                    {editing ? (
                      <Button
                        title={busy ? 'Guardando…' : 'Guardar peso'}
                        icon="checkmark-done"
                        onPress={() => {
                          void saveWeight();
                        }}
                        disabled={busy}
                      />
                    ) : null}
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      {tab === 'measures' ? (
        <View>
          <SectionHeader title="Medidas corporales" />
          {measuresLoading ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                Cargando medidas…
              </ThemedText>
            </Card>
          ) : measuresError ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                {measuresError}
              </ThemedText>
            </Card>
          ) : enrichedMeasurements.length === 0 ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                No hay medidas registradas.
              </ThemedText>
            </Card>
          ) : (
            <View style={styles.list}>
              {enrichedMeasurements.map((item) => {
                const editing = editingMeasureId === item._id;
                return (
                  <Card key={item._id} style={styles.rowCard}>
                    <View style={styles.rowMain}>
                      <View style={styles.rowInfo}>
                        <View style={styles.titleRow}>
                          <ThemedText type="smallBold">{item.label}</ThemedText>
                          <Badge label={formatChartDate(item.date)} tone="neutral" />
                        </View>
                        {!editing ? (
                          <ThemedText type="h3">
                            {item.value} {item.unit}
                          </ThemedText>
                        ) : (
                          <TextInput
                            style={[
                              styles.input,
                              {
                                color: theme.text,
                                borderColor: theme.border,
                                backgroundColor: theme.backgroundElement,
                              },
                            ]}
                            value={measureValue}
                            onChangeText={setMeasureValue}
                            keyboardType="decimal-pad"
                            editable={!busy}
                            autoFocus
                          />
                        )}
                      </View>
                      <View style={styles.rowActions}>
                        {!editing ? (
                          <>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.primarySoft },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => startEditMeasure(item._id, item.value)}
                              disabled={busy}>
                              <Ionicons name="create-outline" size={18} color={theme.primary} />
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: '#FDE8ED' },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => removeMeasure(item._id)}
                              disabled={busy}>
                              <Ionicons name="trash-outline" size={18} color={theme.coral} />
                            </Pressable>
                          </>
                        ) : (
                          <>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.backgroundElement },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => {
                                setEditingMeasureId(null);
                                setMeasureValue('');
                              }}
                              disabled={busy}>
                              <Ionicons name="close" size={18} color={theme.textMuted} />
                            </Pressable>
                            <Pressable
                              style={({ pressed }) => [
                                styles.iconBtn,
                                { backgroundColor: theme.teal, opacity: busy ? 0.6 : 1 },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => {
                                void saveMeasure();
                              }}
                              disabled={busy}>
                              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                    {editing ? (
                      <Button
                        title={busy ? 'Guardando…' : 'Guardar medida'}
                        icon="checkmark-done"
                        onPress={() => {
                          void saveMeasure();
                        }}
                        disabled={busy}
                      />
                    ) : null}
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      {tab === 'photos' ? (
        <View>
          <SectionHeader title="Imágenes de progreso" />
          {imagesLoading ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                Cargando fotos…
              </ThemedText>
            </Card>
          ) : imagesError ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                {imagesError}
              </ThemedText>
            </Card>
          ) : sortedImages.length === 0 ? (
            <Card>
              <ThemedText type="body" themeColor="textSecondary">
                No hay fotos de progreso.
              </ThemedText>
            </Card>
          ) : (
            <View style={styles.photoList}>
              {sortedImages.map((img) => (
                <Card key={img._id} style={styles.photoCard}>
                  <Image source={{ uri: img.image }} style={styles.photo} contentFit="cover" />
                  <View style={styles.photoMeta}>
                    <ThemedText type="smallBold">
                      {formatProgressImageDate(img.createdAt) || 'Sin fecha'}
                    </ThemedText>
                    <View style={styles.rowActions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.iconBtn,
                          { backgroundColor: theme.primarySoft },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => {
                          void replaceImage(img._id);
                        }}
                        disabled={busy}>
                        <Ionicons name="image-outline" size={18} color={theme.primary} />
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.iconBtn,
                          { backgroundColor: '#FDE8ED' },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => removeImage(img._id)}
                        disabled={busy}>
                        <Ionicons name="trash-outline" size={18} color={theme.coral} />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { marginBottom: Spacing.two },
  list: { gap: Spacing.two },
  rowCard: { gap: Spacing.two },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowInfo: { flex: 1, gap: Spacing.one },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    fontWeight: '700',
  },
  photoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  photoCard: {
    width: '47%',
    flexGrow: 1,
    gap: Spacing.two,
    padding: Spacing.two,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
  },
  photoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  pressed: { opacity: 0.75 },
});

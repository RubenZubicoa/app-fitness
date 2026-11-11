import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  PROGRESS_IMAGE_POSES,
  type ProgressImagePose,
} from '@/types/progress-image';

export type ProgressPosePhoto = {
  pose: ProgressImagePose;
  uri: string;
  mimeType?: string | null;
};

type ProgressPosePhotoPickerProps = {
  value: Partial<Record<ProgressImagePose, ProgressPosePhoto>>;
  onChange: (next: Partial<Record<ProgressImagePose, ProgressPosePhoto>>) => void;
  disabled?: boolean;
  /** Texto auxiliar bajo el título de la sección. */
  hint?: string;
};

/**
 * Selector de fotos de progreso por pose (De frente / Lateral / De espaldas).
 */
export function ProgressPosePhotoPicker({
  value,
  onChange,
  disabled = false,
  hint = 'Añade una foto por cada pose. Se subirán al guardar.',
}: ProgressPosePhotoPickerProps) {
  const theme = useTheme();

  const pickForPose = async (pose: ProgressImagePose) => {
    if (disabled) return;

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
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (result.canceled || !result.assets[0]?.uri) return;

    const asset = result.assets[0];
    onChange({
      ...value,
      [pose]: {
        pose,
        uri: asset.uri,
        mimeType: asset.mimeType,
      },
    });
  };

  const clearPose = (pose: ProgressImagePose) => {
    if (disabled) return;
    const next = { ...value };
    delete next[pose];
    onChange(next);
  };

  return (
    <View style={styles.root}>
      <ThemedText type="small" themeColor="textSecondary">
        {hint}
      </ThemedText>

      <View style={styles.grid}>
        {PROGRESS_IMAGE_POSES.map((pose) => {
          const photo = value[pose];
          return (
            <View key={pose} style={styles.slot}>
              <Pressable
                style={({ pressed }) => [styles.pressable, pressed && !disabled && styles.pressed]}
                onPress={() => {
                  void pickForPose(pose);
                }}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={
                  photo ? `Cambiar foto ${pose}` : `Añadir foto ${pose}`
                }>
                {photo?.uri ? (
                  <Image source={{ uri: photo.uri }} style={styles.image} contentFit="cover" />
                ) : (
                  <View
                    style={[
                      styles.placeholder,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Ionicons name="camera-outline" size={22} color={theme.textMuted} />
                  </View>
                )}
              </Pressable>

              {photo?.uri ? (
                <Pressable
                  style={[styles.clearBtn, { backgroundColor: theme.coral }]}
                  onPress={() => clearPose(pose)}
                  disabled={disabled}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar foto ${pose}`}>
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </Pressable>
              ) : null}

              <ThemedText type="caption" style={styles.poseLabel}>
                {pose}
              </ThemedText>
              <ThemedText type="caption" themeColor="primary">
                {photo?.uri ? 'Cambiar' : 'Añadir'}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Lista plana de fotos seleccionadas (solo las que tienen URI). */
export function listProgressPosePhotos(
  value: Partial<Record<ProgressImagePose, ProgressPosePhoto>>,
): ProgressPosePhoto[] {
  return PROGRESS_IMAGE_POSES.map((pose) => value[pose]).filter(
    (photo): photo is ProgressPosePhoto => Boolean(photo?.uri),
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.two },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  slot: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  pressable: {
    width: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  poseLabel: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});

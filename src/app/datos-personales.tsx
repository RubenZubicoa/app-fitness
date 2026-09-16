import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientHeader } from '@/components/ui/gradient-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';
import { useTheme } from '@/hooks/use-theme';

export default function DatosPersonalesScreen() {
  const theme = useTheme();
  const { client, saving, updateClientProfile, logout } = useClient();

  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [goal, setGoal] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    setName(client.name);
    setFullName(client.fullName);
    setEmail(client.email);
    setTelefono(client.telefono);
    setGoal(client.goal);
    setAvatar(client.avatar);
  }, [client]);

  if (!client) return null;

  const pickAvatar = async () => {
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
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setAvatar(result.assets[0].uri);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = telefono.trim();
    const trimmedGoal = goal.trim();
    const trimmedAvatar = avatar.trim();

    if (!trimmedName || !trimmedFullName) {
      setError('Nombre y nombre completo son obligatorios');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Introduce un email válido');
      return;
    }
    if (password || passwordConfirm) {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    try {
      await updateClientProfile({
        name: trimmedName,
        fullName: trimmedFullName,
        email: trimmedEmail,
        telefono: trimmedPhone,
        goal: trimmedGoal,
        avatar: trimmedAvatar,
        ...(password
          ? {
              password,
              contraseña: password,
            }
          : {}),
      });
      setPassword('');
      setPasswordConfirm('');
      setSuccess('Datos guardados correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los datos');
    }
  };

  const confirmLogout = () => {
    const message = '¿Seguro que quieres cerrar sesión?';
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm(message) : true;
      if (ok) logout();
      return;
    }
    Alert.alert('Cerrar sesión', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen
      withTabBar={false}
      header={
        <GradientHeader
          eyebrow="Cuenta"
          title="Datos personales"
          subtitle="Actualiza tu información de perfil"
          showBack
          gradient={Brand.gradientNavy}
        />
      }>
      <Card style={styles.avatarCard}>
        <Image
          source={{ uri: avatar || client.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.avatarInfo}>
          <ThemedText type="h3">{fullName || client.fullName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {client.plan}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => {
              void pickAvatar();
            }}
            disabled={saving}>
            <ThemedText type="link" themeColor="primary">
              Cambiar foto
            </ThemedText>
          </Pressable>
        </View>
      </Card>

      <View>
        <SectionHeader title="Información básica" />
        <Card style={styles.formCard}>
          <Field
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Nombre corto"
            editable={!saving}
          />
          <Field
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nombre y apellidos"
            editable={!saving}
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!saving}
          />
          <Field
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="+34 600 000 000"
            keyboardType="phone-pad"
            editable={!saving}
          />
          <Field
            label="Objetivo"
            value={goal}
            onChangeText={setGoal}
            placeholder="Tu objetivo principal"
            editable={!saving}
          />
        </Card>
      </View>

      <View>
        <SectionHeader title="Seguridad" />
        <Card style={styles.formCard}>
          <ThemedText type="caption" themeColor="textMuted">
            Déjalo vacío si no quieres cambiar la contraseña
          </ThemedText>
          <Field
            label="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            editable={!saving}
          />
          <Field
            label="Confirmar contraseña"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder="••••••••"
            secureTextEntry
            editable={!saving}
          />
        </Card>
      </View>

      {error ? (
        <ThemedText type="body" themeColor="textSecondary" style={styles.feedback}>
          {error}
        </ThemedText>
      ) : null}
      {success ? (
        <ThemedText type="body" themeColor="primary" style={styles.feedback}>
          {success}
        </ThemedText>
      ) : null}

      <Button
        title={saving ? 'Guardando…' : 'Guardar cambios'}
        icon="checkmark-done"
        onPress={() => {
          void handleSave();
        }}
        disabled={saving}
      />
      <Button
        title="Cerrar sesión"
        icon="log-out-outline"
        variant="ghost"
        onPress={confirmLogout}
        disabled={saving}
      />
    </Screen>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
} & TextInputProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="caption" themeColor="textMuted">
        {label}
      </ThemedText>
      <TextInput
        {...inputProps}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
          inputProps.style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
  },
  avatarInfo: { flex: 1, gap: 4 },
  formCard: { gap: Spacing.three },
  field: { gap: Spacing.one },
  input: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '600',
  },
  feedback: { marginBottom: Spacing.two },
  pressed: { opacity: 0.75 },
});

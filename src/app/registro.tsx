import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { ClientLoadingFallback, useClient } from '@/context/client-context';
import { fetchPrograms } from '@/api/programs';
import { buildRegistrationPlanDates } from '@/data/program';
import type { Program } from '@/types/program';

const DEFAULT_COACH = 'Onatz HealtzCoach';

export default function RegistroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { client, isRestoring, register } = useClient();

  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [goal, setGoal] = useState('');
  const [programId, setProgramId] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const planDates = useMemo(() => buildRegistrationPlanDates(), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setProgramsLoading(true);
      setProgramsError(null);
      try {
        const list = await fetchPrograms({ skipAuth: true });
        if (cancelled) return;
        setPrograms(list);
        if (list.length === 1) {
          setProgramId(list[0]._id);
        }
      } catch (err) {
        if (!cancelled) {
          setProgramsError(
            err instanceof Error ? err.message : 'No se pudieron cargar los programas',
          );
        }
      } finally {
        if (!cancelled) setProgramsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = () => {
    if (error) setError('');
  };

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
    setAvatarUri(result.assets[0].uri);
    clearError();
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = telefono.trim();
    const trimmedGoal = goal.trim();
    const trimmedProgram = programId.trim();

    if (!avatarUri) {
      setError('Selecciona una foto de perfil.');
      return;
    }
    if (!trimmedName || !trimmedFullName) {
      setError('Nombre y nombre completo son obligatorios.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Introduce un email válido.');
      return;
    }
    if (!trimmedGoal) {
      setError('Indica tu objetivo.');
      return;
    }
    if (!trimmedProgram) {
      setError('Selecciona un programa.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        name: trimmedName,
        fullName: trimmedFullName,
        email: trimmedEmail,
        ...(trimmedPhone ? { telefono: trimmedPhone } : {}),
        contraseña: password,
        goal: trimmedGoal,
        coach: DEFAULT_COACH,
        program: trimmedProgram,
        startDate: planDates.startDate,
        endDate: planDates.endDate,
        week: planDates.week,
        totalWeeks: planDates.totalWeeks,
        phase: planDates.phase,
        totalPhases: planDates.totalPhases,
        avatarUri,
      });
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  if (isRestoring) {
    return <ClientLoadingFallback />;
  }

  if (client) {
    return <Redirect href="/home" />;
  }

  return (
    <LinearGradient colors={['#0B2A5B', '#0A1B33']} style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.four },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable style={styles.back} hitSlop={8} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <ThemedText type="smallBold" style={styles.backText}>
              Volver
            </ThemedText>
          </Pressable>

          <View style={styles.card}>
            <ThemedText type="subtitle">Crear cuenta</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardSub}>
              Completa tus datos para empezar tu proceso de {planDates.totalWeeks} semanas
            </ThemedText>

            <Pressable
              style={styles.avatarBlock}
              onPress={() => {
                void pickAvatar();
              }}
              disabled={loading}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color="#5B6B85" />
                </View>
              )}
              <ThemedText type="smallBold" themeColor="primary">
                {avatarUri ? 'Cambiar foto' : 'Seleccionar foto de perfil'}
              </ThemedText>
            </Pressable>

            <Field
              icon="person-outline"
              placeholder="Nombre"
              value={name}
              onChangeText={(t) => {
                setName(t);
                clearError();
              }}
              autoCapitalize="words"
            />
            <Field
              icon="id-card-outline"
              placeholder="Nombre completo"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                clearError();
              }}
              autoCapitalize="words"
            />
            <Field
              icon="mail-outline"
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError();
              }}
              keyboardType="email-address"
            />
            <Field
              icon="call-outline"
              placeholder="Teléfono (opcional)"
              value={telefono}
              onChangeText={(t) => {
                setTelefono(t);
                clearError();
              }}
              keyboardType="phone-pad"
            />
            <Field
              icon="flag-outline"
              placeholder="Objetivo (ej. recomposición)"
              value={goal}
              onChangeText={(t) => {
                setGoal(t);
                clearError();
              }}
              autoCapitalize="sentences"
            />
            <View style={styles.programBlock}>
              <ThemedText type="caption" themeColor="textMuted">
                Programa
              </ThemedText>
              {programsLoading ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Cargando programas…
                </ThemedText>
              ) : programsError ? (
                <ThemedText type="small" style={styles.error}>
                  {programsError}
                </ThemedText>
              ) : programs.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  No hay programas disponibles.
                </ThemedText>
              ) : (
                <View style={styles.programList}>
                  {programs.map((item) => {
                    const active = programId === item._id;
                    return (
                      <Pressable
                        key={item._id}
                        onPress={() => {
                          setProgramId(item._id);
                          clearError();
                        }}
                        style={[
                          styles.programChip,
                          active && styles.programChipActive,
                        ]}>
                        <ThemedText
                          type="smallBold"
                          style={{ color: active ? '#FFFFFF' : '#0E1B2E' }}>
                          {item.name}
                        </ThemedText>
                        {item.description ? (
                          <ThemedText
                            type="caption"
                            style={{ color: active ? 'rgba(255,255,255,0.85)' : '#5B6B85' }}>
                            {item.description}
                          </ThemedText>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.planMeta}>
              <ThemedText type="caption" themeColor="textMuted">
                Inicio {planDates.startDate} · Fin {planDates.endDate} · Semana 1 · Fase 1
              </ThemedText>
            </View>

            <Field
              icon="lock-closed-outline"
              placeholder="Contraseña"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError();
              }}
              secureTextEntry={secure}
              rightIcon={secure ? 'eye-outline' : 'eye-off-outline'}
              onRightPress={() => setSecure((s) => !s)}
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Confirmar contraseña"
              value={passwordConfirm}
              onChangeText={(t) => {
                setPasswordConfirm(t);
                clearError();
              }}
              secureTextEntry={secureConfirm}
              rightIcon={secureConfirm ? 'eye-outline' : 'eye-off-outline'}
              onRightPress={() => setSecureConfirm((s) => !s)}
            />

            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Button
              title={loading ? 'Creando cuenta…' : 'Registrarme'}
              icon="person-add-outline"
              onPress={() => {
                void handleRegister();
              }}
              disabled={loading || programsLoading}
            />

            <Pressable
              style={styles.loginLink}
              hitSlop={8}
              onPress={() => router.replace('/')}>
              <ThemedText type="small" themeColor="textSecondary">
                ¿Ya tienes cuenta?{' '}
                <ThemedText type="smallBold" themeColor="primary">
                  Inicia sesión
                </ThemedText>
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

type FieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightIcon,
  onRightPress,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color="#5B6B85" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#8A98AE"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {rightIcon ? (
        <Pressable onPress={onRightPress} hitSlop={8}>
          <Ionicons name={rightIcon} size={18} color="#5B6B85" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  backText: { color: '#FFFFFF' },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Shadow.floating,
  },
  cardSub: {
    marginTop: -Spacing.two,
    marginBottom: Spacing.one,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: Radius.pill,
    backgroundColor: '#F2F5FA',
    borderWidth: 1,
    borderColor: '#E4E9F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#F2F5FA',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 52,
    borderWidth: 1,
    borderColor: '#E4E9F1',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0E1B2E',
    height: '100%',
  },
  programBlock: { gap: Spacing.two },
  programList: { gap: Spacing.two },
  programChip: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E4E9F1',
    backgroundColor: '#F2F5FA',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  programChipActive: {
    backgroundColor: '#0B2A5B',
    borderColor: '#0B2A5B',
  },
  planMeta: {
    backgroundColor: '#F2F5FA',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  error: {
    color: '#F0506E',
    marginTop: -Spacing.one,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
});

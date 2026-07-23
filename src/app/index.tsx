import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { useClient } from '@/context/client-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Introduce tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0B2A5B', '#0A1B33']} style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.four },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandBlock}>
            <BrandLogo variant="vertical" width={148} style={styles.logo} />
            <ThemedText type="display" style={styles.brandName}>
              REGENESIS
            </ThemedText>
            <ThemedText type="caption" style={styles.brandTag}>
              Tu proceso de transformación
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Hola de nuevo</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.cardSub}>
              Accede a tu proceso de transformación
            </ThemedText>

            <Field
              icon="mail-outline"
              placeholder="Correo electrónico"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError('');
              }}
              keyboardType="email-address"
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Contraseña"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError('');
              }}
              secureTextEntry={secure}
              rightIcon={secure ? 'eye-outline' : 'eye-off-outline'}
              onRightPress={() => setSecure((s) => !s)}
            />

            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable style={styles.forgot} hitSlop={8}>
              <ThemedText type="small" themeColor="primary">
                ¿Olvidaste tu contraseña?
              </ThemedText>
            </Pressable>

            <Button
              title={loading ? 'Entrando…' : 'Entrar'}
              icon="log-in-outline"
              onPress={handleLogin}
              disabled={loading}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <ThemedText type="caption" themeColor="textMuted">
                O
              </ThemedText>
              <View style={styles.line} />
            </View>

            <Link href="/onboarding" asChild>
              <Button title="Empezar mi proceso" variant="secondary" icon="sparkles-outline" />
            </Link>
          </View>

          <ThemedText type="small" style={styles.footer}>
            ¿Pagaste en consulta? Tu coach te dará acceso.
          </ThemedText>
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
  keyboardType?: 'default' | 'email-address';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
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
        autoCapitalize="none"
      />
      {rightIcon && (
        <Pressable onPress={onRightPress} hitSlop={8}>
          <Ionicons name={rightIcon} size={18} color="#5B6B85" />
        </Pressable>
      )}
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
    gap: Spacing.five,
  },
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  logo: {
    marginBottom: Spacing.two,
  },
  brandName: {
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandTag: {
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
  },
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
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.one,
  },
  error: {
    color: '#F0506E',
    marginTop: -Spacing.one,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E9F1',
  },
  footer: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
});

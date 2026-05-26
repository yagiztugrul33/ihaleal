import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { authenticateBiometric, canUseBiometric } from './biometric';
import {
  getBiometricOptIn,
  getStoredEmail,
  getSupabaseClient,
  hydrateAuthSession,
  persistAuthSession,
  setBiometricOptIn,
} from './authClient';

function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function LoginScreen() {
  const palette = Colors.dark;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricCapable, setBiometricCapable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [quickLoginBusy, setQuickLoginBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const capable = await canUseBiometric();
      const enabled = await getBiometricOptIn();
      const storedEmail = await getStoredEmail();
      if (storedEmail) setEmail(storedEmail);
      setBiometricCapable(capable);
      setBiometricEnabledState(enabled);
    })();
  }, []);

  const goProfil = () => router.replace('/(tabs)/profil');

  const onLogin = useCallback(async () => {
    setError(null);
    const safeEmail = sanitizeEmail(email);
    if (!safeEmail || !password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }
    setBusy(true);
    try {
      const client = await getSupabaseClient();
      const { data, error: authError } = await client.auth.signInWithPassword({ email: safeEmail, password });
      if (authError) {
        setError(authError.message ?? 'Giriş başarısız.');
        return;
      }
      if (data.session) {
        await persistAuthSession(data.session);
      }
      await setBiometricOptIn(biometricEnabled);
      goProfil();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Giriş sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  }, [biometricEnabled, email, password]);

  const onBiometricQuickLogin = useCallback(async () => {
    setError(null);
    setQuickLoginBusy(true);
    try {
      const ok = await authenticateBiometric('İhaleal hızlı giriş');
      if (!ok) {
        setError('Biyometrik doğrulama başarısız.');
        return;
      }
      const session = await hydrateAuthSession();
      if (!session.restored) {
        setError('Kayıtlı oturum bulunamadı. Önce şifre ile giriş yapın.');
        return;
      }
      goProfil();
    } catch {
      setError('Biyometrik hızlı giriş şu anda kullanılamıyor.');
    } finally {
      setQuickLoginBusy(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Supabase oturumu + güvenli saklama + biyometrik hızlı giriş</Text>

        <View style={styles.card}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="ornek@mail.com"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: Spacing.three }]}>Şifre</Text>
          <TextInput
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.row}>
            <Text style={styles.rowText}>Sonraki girişlerde biyometrik hızlı giriş</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabledState}
              disabled={!biometricCapable}
              trackColor={{ false: '#374151', true: '#059669' }}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={onLogin} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Giriş Yap</Text>}
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/reset-password')}>
            <Text style={styles.secondaryButtonText}>Şifre Sıfırla</Text>
          </Pressable>
        </View>

        {biometricCapable ? (
          <Pressable style={styles.quickLoginButton} onPress={onBiometricQuickLogin} disabled={quickLoginBusy}>
            {quickLoginBusy ? <ActivityIndicator color="#111827" /> : <Text style={styles.quickLoginText}>Biyometrik Hızlı Giriş</Text>}
          </Pressable>
        ) : (
          <Text style={styles.note}>Biyometrik modül/cihaz hazır değil. `expo-local-authentication` ile development build gerekir.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(palette: (typeof Colors)['dark']) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1, padding: Spacing.four, gap: Spacing.three },
    title: { color: palette.text, fontSize: 30, fontWeight: '700' },
    subtitle: { color: palette.textSecondary, fontSize: 14 },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#1f2937',
      backgroundColor: '#0b1220',
      padding: Spacing.three,
    },
    label: { color: palette.textSecondary, fontSize: 13, marginBottom: Spacing.one },
    input: {
      borderWidth: 1,
      borderColor: '#374151',
      backgroundColor: '#111827',
      color: palette.text,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
    },
    row: {
      marginTop: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    rowText: { color: palette.text, fontSize: 13, flex: 1 },
    error: { color: '#f87171', fontSize: 13, marginTop: Spacing.two },
    primaryButton: {
      marginTop: Spacing.three,
      borderRadius: 12,
      backgroundColor: '#2563eb',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    primaryButtonText: { color: '#fff', fontWeight: '700' },
    secondaryButton: {
      marginTop: Spacing.two,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#374151',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 42,
      backgroundColor: '#0f172a',
    },
    secondaryButtonText: { color: '#d1d5db', fontWeight: '600' },
    quickLoginButton: {
      marginTop: Spacing.one,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#93c5fd',
      backgroundColor: '#e2e8f0',
      minHeight: 42,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quickLoginText: { color: '#111827', fontWeight: '700' },
    note: { color: palette.textSecondary, fontSize: 12, lineHeight: 18 },
  });
}


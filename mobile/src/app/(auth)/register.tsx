import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { getSupabaseClient } from './authClient';

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^\w\s]/.test(password)
  );
}

export default function RegisterScreen() {
  const palette = Colors.dark;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onRegister = async () => {
    setError(null);
    setInfo(null);
    const safeEmail = email.trim().toLowerCase();
    if (!safeEmail || !password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }
    if (password !== passwordRepeat) {
      setError('Şifre tekrar alanı eşleşmiyor.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Şifre en az 10 karakter; büyük/küçük harf, rakam ve özel karakter içermeli.');
      return;
    }

    setBusy(true);
    try {
      const client = await getSupabaseClient();
      const { error: authError } = await client.auth.signUp({
        email: safeEmail,
        password,
        options: { emailRedirectTo: 'ihaleal://(auth)/login' },
      });
      if (authError) {
        setError(authError.message ?? 'Kayıt başarısız.');
        return;
      }
      setInfo('Kayıt tamamlandı. E-posta doğrulama bağlantısını kontrol edin.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Supabase Auth ile mobil hesap oluşturma</Text>

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
            placeholder="Güçlü şifre"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <Text style={[styles.label, { marginTop: Spacing.three }]}>Şifre Tekrar</Text>
          <TextInput
            secureTextEntry
            placeholder="Şifre tekrar"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={passwordRepeat}
            onChangeText={setPasswordRepeat}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={onRegister} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Hesap Oluştur</Text>}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.secondaryButtonText}>Girişe Dön</Text>
          </Pressable>
        </View>
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
    error: { color: '#f87171', fontSize: 13, marginTop: Spacing.two },
    info: { color: '#34d399', fontSize: 13, marginTop: Spacing.two },
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
  });
}


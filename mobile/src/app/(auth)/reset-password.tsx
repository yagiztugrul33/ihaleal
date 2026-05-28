import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { getSupabaseClient } from './authClient';

export default function ResetPasswordScreen() {
  const palette = Colors.dark;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onReset = async () => {
    setError(null);
    setInfo(null);
    const safeEmail = email.trim().toLowerCase();
    if (!safeEmail) {
      setError('E-posta zorunludur.');
      return;
    }

    setBusy(true);
    try {
      const client = await getSupabaseClient();
      const { error: authError } = await client.auth.resetPasswordForEmail(safeEmail, {
        redirectTo: 'ihaleal://(auth)/login',
      });
      if (authError) {
        setError(authError.message ?? 'Şifre sıfırlama gönderilemedi.');
        return;
      }
      setInfo('Şifre sıfırlama bağlantısı gönderildi.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Şifre sıfırlama sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Şifre Sıfırla</Text>
        <Text style={styles.subtitle}>E-posta adresine sıfırlama bağlantısı gönderilir.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="test@example.invalid"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={onReset} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Bağlantı Gönder</Text>}
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


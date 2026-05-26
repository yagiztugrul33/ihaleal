import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

/**
 * Profil ekranı — STUB.
 *
 * Bu dosya Tool B (Cursor) tarafından sahiplenilir. Tool A (Claude Code) bu stub'ı
 * yalnızca (tabs) layout'undaki "profil" trigger'ı boşa düşmesin diye yerleştirmiştir.
 *
 * Tool B'nin sorumluluğu:
 *   - Supabase Auth (giriş/kayıt/şifre sıfırlama) ekranlarına yönlendirme
 *   - Biyometrik doğrulama (Face ID / parmak izi) toggle
 *   - Profil özet kartı (kullanıcı bilgisi, çıkış)
 *   - KVKK opt-in durumu
 *
 * Tool B bu dosyayı doğrudan overwrite edebilir.
 */
export default function ProfilScreenStub() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: palette.text }]}>Profil</Text>
        <Text style={[styles.note, { color: palette.textSecondary }]}>
          Bu ekran Tool B (Cursor) tarafından kuruluyor.{'\n'}
          Auth + biyometrik + KVKK akışı yakında.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, fontWeight: '700' },
  note: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

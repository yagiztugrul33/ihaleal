import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import { executeBuyNow, formatTry } from '../../../../shared';
import { findDemoAuction } from '../../../../features/auction/demoAuctions';

/**
 * Hemen Al ekranı — AKTİF.
 *
 * `executeBuyNow` (çekirdek helper, src/lib/buyNow.ts) çağrılır. KYC sunucu
 * tarafında sertçe enforce edilir (migration 20260527120000); istemci sadece
 * hızlı UX feedback için kontrol yapar. Para mantığı istemcide YAZILMAZ.
 */
export default function HemenAl() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const auction = useMemo(
    () => (typeof id === 'string' ? findDemoAuction(id) : undefined),
    [id],
  );

  const [kycVerified, setKycVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!auction) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.title, { color: palette.text }]}>İhale bulunamadı</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text style={[styles.backText, { color: palette.text }]}>Geri</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!auction.buyNowPriceTry) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.title, { color: palette.text }]}>Hemen Al mevcut değil</Text>
          <Text style={[styles.note, { color: palette.textSecondary }]}>
            Bu ihale için satıcı sabit Hemen Al fiyatı tanımlamamış.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text style={[styles.backText, { color: palette.text }]}>Geri</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = kycVerified && termsAccepted && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // NOT: demo auction id'leri gerçek UUID değil — gerçek üretimde
      // burada Supabase'den çekilmiş listing UUID + önceden register_bid_deposit ile
      // alınmış depositId iletilmelidir. Şu an demo veri ile executeBuyNow
      // sunucudan precondition hatası alıp tipli mesaj döner — UI bunu zarif gösterir.
      const result = await executeBuyNow({
        listingId: auction.id,
        depositId: `demo-deposit-${auction.id}`,
      });

      switch (result.status) {
        case 'ok':
          Alert.alert(
            'Satın alma tamam',
            `Tutar: ${formatTry(result.amountTry)}\nReferans: ${result.buyNowId}`,
            [{ text: 'Tamam', onPress: () => router.back() }],
          );
          return;
        case 'duplicate':
          Alert.alert('Tekrarlanan işlem', result.message);
          return;
        case 'kyc_required':
          // Kademeli UX: kullanıcıya KYC sayfasına gitme seçeneği sunulur (sessiz kesme yok).
          Alert.alert('KYC Doğrulaması Gerekli', result.message, [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: 'Profil / KYC',
              onPress: () => router.push('/(tabs)/profil'),
            },
          ]);
          return;
        case 'auth_required':
          Alert.alert('Giriş Gerekli', result.message, [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Giriş Yap', onPress: () => router.push('/(auth)/login') },
          ]);
          return;
        case 'config_missing':
          Alert.alert(
            'Yapılandırma Eksik',
            `${result.message}\n\n(Demo modu — gerçek Hemen Al için Supabase istemcisi gerekir.)`,
          );
          return;
        case 'preconditions_failed':
        case 'rpc_error':
          Alert.alert('İşlem tamamlanamadı', result.message);
          return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: palette.text }]}>Hemen Al</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]} numberOfLines={2}>
          {auction.title}
        </Text>

        <View style={[styles.priceCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.priceLabel, { color: palette.textSecondary }]}>Hemen Al Fiyatı</Text>
          <Text style={[styles.priceValue, { color: palette.text }]}>
            {formatTry(auction.buyNowPriceTry)}
          </Text>
          <Text style={[styles.priceNote, { color: palette.textSecondary }]}>
            Cari teklif: {formatTry(auction.currentBidTry)} · {auction.bidderCount} teklif
          </Text>
        </View>

        <Section title="Ön Koşullar" palette={palette}>
          <ToggleRow
            label="KYC doğrulaması tamam"
            description="Hemen Al için kimlik doğrulaması zorunlu (KVKK + finansal uyum)."
            value={kycVerified}
            onChange={setKycVerified}
            palette={palette}
          />
          <ToggleRow
            label="Mesafeli satış sözleşmesini okudum ve onaylıyorum"
            description="Sözleşme metni ihale sayfasında PDF olarak sunulur."
            value={termsAccepted}
            onChange={setTermsAccepted}
            palette={palette}
          />
        </Section>

        <View style={[styles.flowCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.flowTitle, { color: palette.text }]}>Sunucu Akışı</Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            1. Sunucu KYC guard (profiles.kyc_status = &apos;verified&apos;)
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            2. Rate-limit + duplicate check
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            3. listings/auctions/report/deposit precondition&apos;ları (FOR UPDATE kilitleri)
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            4. buy_now_purchases INSERT + auction status=&apos;ended&apos; + listing status=&apos;sold&apos;
          </Text>
        </View>

        <Pressable
          disabled={!canSubmit}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: canSubmit
                ? '#16a34a'
                : palette.backgroundSelected,
              opacity: pressed && canSubmit ? 0.85 : 1,
            },
          ]}>
          <Text
            style={[
              styles.submitText,
              { color: canSubmit ? 'white' : palette.textSecondary },
            ]}>
            {submitting
              ? 'İşleniyor…'
              : `Onayla ve Devam Et — ${formatTry(auction.buyNowPriceTry)}`}
          </Text>
        </Pressable>

        <Text style={[styles.demoNote, { color: palette.textSecondary }]}>
          Bu ekran çekirdek executeBuyNow helper&apos;ını çağırır; sunucu
          KYC/önkoşullarını otoriteyle uygular. İstemcide para mantığı yok.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  palette,
  children,
}: {
  title: string;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
  palette,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (b: boolean) => void;
  palette: Palette;
}) {
  return (
    <View
      style={[styles.toggleRow, { backgroundColor: palette.backgroundElement }]}>
      <View style={styles.toggleTextBox}>
        <Text style={[styles.toggleLabel, { color: palette.text }]}>{label}</Text>
        <Text style={[styles.toggleDescription, { color: palette.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#475569', true: '#16a34a' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  title: { fontSize: 26, fontWeight: '700', marginTop: Spacing.three },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: Spacing.three },
  priceCard: { padding: Spacing.three, borderRadius: 14, gap: 4, marginBottom: Spacing.three },
  priceLabel: { fontSize: 12 },
  priceValue: { fontSize: 32, fontWeight: '700' },
  priceNote: { fontSize: 12 },
  section: { gap: Spacing.two, marginBottom: Spacing.three },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  toggleRow: {
    padding: Spacing.three,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  toggleTextBox: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleDescription: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  flowCard: { padding: Spacing.three, borderRadius: 14, gap: 6, marginBottom: Spacing.three },
  flowTitle: { fontSize: 14, fontWeight: '700' },
  flowItem: { fontSize: 12, lineHeight: 18 },
  submitBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { fontWeight: '700', fontSize: 15 },
  demoNote: { fontSize: 11, fontStyle: 'italic', marginTop: Spacing.three, textAlign: 'center' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  note: { fontSize: 13, textAlign: 'center' },
  backBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
});

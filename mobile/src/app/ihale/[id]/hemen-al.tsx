import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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
import { formatTry } from '../../../../shared';
import { findDemoAuction } from '../../../../features/auction/demoAuctions';

/**
 * Hemen Al ekranı — ÖNİZLEME modu.
 *
 * Submit kapalı çünkü çekirdek `execute_buy_now` helper'ı henüz mobil tarafa
 * bağlanmadı (bkz. mobile/shared/bidActions.ts). Form doldurulabilir (önizleme),
 * gönderim kapalı. Para mantığı istemcide YOK.
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

  // Önizleme alanları — değer toplanır ama gönderilmez.
  const [kycVerified, setKycVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: palette.text }]}>Hemen Al</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]} numberOfLines={2}>
          {auction.title}
        </Text>

        <View
          style={[
            styles.notice,
            { backgroundColor: palette.backgroundElement, borderColor: '#0E5FFF' },
          ]}>
          <Text style={[styles.noticeTitle, { color: palette.text }]}>Hemen Al yakında aktif olacak</Text>
          <Text style={[styles.noticeText, { color: palette.textSecondary }]}>
            Bu ekran şu an önizleme modunda. Çekirdek ödeme/escrow zinciri (execute_buy_now RPC)
            mobil istemciye bağlanınca aktive olacak. Form alanları doldurulabilir ama henüz
            gönderim yapılmaz.
          </Text>
        </View>

        <View style={[styles.priceCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.priceLabel, { color: palette.textSecondary }]}>Hemen Al Fiyatı</Text>
          <Text style={[styles.priceValue, { color: palette.text }]}>
            {formatTry(auction.buyNowPriceTry)}
          </Text>
          <Text style={[styles.priceNote, { color: palette.textSecondary }]}>
            Cari teklif: {formatTry(auction.currentBidTry)} · {auction.bidderCount} teklif
          </Text>
        </View>

        <Section title="Ön Koşullar (önizleme)" palette={palette}>
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
          <Text style={[styles.flowTitle, { color: palette.text }]}>
            Sonraki Adımlar (üretim akışı)
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            1. Kart preAuthorize (çekirdek payment modülü)
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            2. Escrow lock (çekirdek escrow modülü)
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            3. execute_buy_now RPC (çekirdek + idempotency key)
          </Text>
          <Text style={[styles.flowItem, { color: palette.textSecondary }]}>
            4. Tapu süreci başlatma + sözleşme imza akışı
          </Text>
        </View>

        <Pressable
          disabled
          style={[styles.submitBtnDisabled, { backgroundColor: palette.backgroundSelected }]}>
          <Text style={[styles.submitText, { color: palette.textSecondary }]}>
            Hemen Al — Yakında ({formatTry(auction.buyNowPriceTry)})
          </Text>
        </Pressable>

        <Text style={[styles.demoNote, { color: palette.textSecondary }]}>
          Önizleme modu — gerçek ödeme/escrow için çekirdek helper bekleniyor.
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
  notice: { padding: Spacing.three, borderRadius: 12, borderWidth: 1, gap: 6, marginBottom: Spacing.three },
  noticeTitle: { fontSize: 14, fontWeight: '700' },
  noticeText: { fontSize: 12, lineHeight: 18 },
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
  submitBtnDisabled: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.6,
  },
  submitText: { fontWeight: '700', fontSize: 15 },
  demoNote: { fontSize: 11, fontStyle: 'italic', marginTop: Spacing.three, textAlign: 'center' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  note: { fontSize: 13, textAlign: 'center' },
  backBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
});

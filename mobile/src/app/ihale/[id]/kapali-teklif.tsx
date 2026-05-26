import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import { formatTry } from '../../../../shared';
import { findDemoAuction, formatRemaining } from '../../../../features/auction/demoAuctions';

/**
 * Kapalı Teklif ekranı — ÖNİZLEME modu.
 *
 * Submit kapalı çünkü çekirdek sealed-bid helper'ı/RPC'si henüz yok
 * (bkz. mobile/shared/bidActions.ts). Form doldurulabilir (önizleme),
 * gönderim kapalı. Para mantığı istemcide YOK.
 */
export default function KapaliTeklif() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const auction = useMemo(
    () => (typeof id === 'string' ? findDemoAuction(id) : undefined),
    [id],
  );

  // Önizleme alanları — değer toplanır ama gönderilmez.
  const [amountInput, setAmountInput] = useState('');
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

  if (auction.marketingMode !== 'sealed_offers') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.title, { color: palette.text }]}>Kapalı teklif geçerli değil</Text>
          <Text style={[styles.note, { color: palette.textSecondary }]}>
            Bu ihale {auction.marketingMode === 'auction' ? 'açık artırma' : 'müzakere'} modunda.
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.text }]}>Kapalı Teklif</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]} numberOfLines={2}>
          {auction.title}
        </Text>

        <View
          style={[
            styles.notice,
            { backgroundColor: palette.backgroundElement, borderColor: '#9333EA' },
          ]}>
          <Text style={[styles.noticeTitle, { color: palette.text }]}>
            Kapalı Teklif yakında aktif olacak
          </Text>
          <Text style={[styles.noticeText, { color: palette.textSecondary }]}>
            {`Bu ekran şu an önizleme modunda. Çekirdek sealed-bid helper'ı ve sunucu RPC'si henüz mobil istemciye bağlanmadı. Form alanları doldurulabilir ama henüz gönderim yapılmaz.`}
          </Text>
        </View>

        <View style={[styles.snapshotCard, { backgroundColor: palette.backgroundElement }]}>
          <View style={styles.snapshotRow}>
            <Snapshot label="Başlangıç" value={formatTry(auction.startingBidTry)} palette={palette} />
            <Snapshot
              label="Min. Eşik"
              value={auction.sealedReserveTry ? formatTry(auction.sealedReserveTry) : '—'}
              palette={palette}
            />
          </View>
          <View style={styles.snapshotRow}>
            <Snapshot label="Teklif Sayısı" value={String(auction.bidderCount)} palette={palette} />
            <Snapshot
              label="Kalan Süre"
              value={formatRemaining(auction.endDateIso)}
              palette={palette}
            />
          </View>
        </View>

        <View
          style={[
            styles.warningBox,
            { backgroundColor: palette.backgroundElement, borderColor: '#9333EA' },
          ]}>
          <Text style={[styles.warningTitle, { color: palette.text }]}>⚠ Kapalı Teklif Kuralları</Text>
          <Text style={[styles.warningLine, { color: palette.textSecondary }]}>
            • Teklifiniz oturum kapanışına kadar diğer katılımcılara gösterilmez.
          </Text>
          <Text style={[styles.warningLine, { color: palette.textSecondary }]}>
            • Aynı oturumda yalnız bir teklif geçerlidir; sonraki teklif öncekini geçersiz kılar.
          </Text>
          <Text style={[styles.warningLine, { color: palette.textSecondary }]}>
            • Eşit tutarlarda zaman damgası önceliği kazanır.
          </Text>
          <Text style={[styles.warningLine, { color: palette.textSecondary }]}>
            • Kazanan teklif sahibi için escrow ve sözleşme akışı otomatik tetiklenir.
          </Text>
        </View>

        <View style={styles.formBlock}>
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
            Kapalı Teklif Tutarı (₺) — önizleme
          </Text>
          <TextInput
            value={amountInput}
            onChangeText={setAmountInput}
            keyboardType="number-pad"
            placeholder={auction.sealedReserveTry ? String(auction.sealedReserveTry) : '0'}
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              {
                borderColor: palette.backgroundSelected,
                color: palette.text,
                backgroundColor: palette.backgroundElement,
              },
            ]}
          />
        </View>

        <View
          style={[styles.toggleRow, { backgroundColor: palette.backgroundElement }]}>
          <View style={styles.toggleTextBox}>
            <Text style={[styles.toggleLabel, { color: palette.text }]}>
              Kapalı teklif kurallarını okudum ve onaylıyorum
            </Text>
            <Text style={[styles.toggleDescription, { color: palette.textSecondary }]}>
              Teklif geri alınamaz; oturum kapanışında en yüksek teklif kazanır.
            </Text>
          </View>
          <Switch
            value={termsAccepted}
            onValueChange={setTermsAccepted}
            trackColor={{ false: '#475569', true: '#9333EA' }}
          />
        </View>

        <Pressable
          disabled
          style={[styles.submitBtnDisabled, { backgroundColor: palette.backgroundSelected }]}>
          <Text style={[styles.submitText, { color: palette.textSecondary }]}>
            Kapalı Teklif Gönder — Yakında
          </Text>
        </Pressable>

        <Text style={[styles.demoNote, { color: palette.textSecondary }]}>
          Önizleme modu — gerçek sealed-bid + escrow zinciri çekirdek tarafında bekleniyor.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Snapshot({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: Palette;
}) {
  return (
    <View style={styles.snapshotCell}>
      <Text style={[styles.snapshotLabel, { color: palette.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.snapshotValue, { color: palette.text }]} numberOfLines={1}>
        {value}
      </Text>
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
  snapshotCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two, marginBottom: Spacing.three },
  snapshotRow: { flexDirection: 'row', gap: Spacing.three },
  snapshotCell: { flex: 1 },
  snapshotLabel: { fontSize: 11 },
  snapshotValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  warningBox: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: Spacing.three,
  },
  warningTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  warningLine: { fontSize: 12, lineHeight: 17 },
  formBlock: { gap: 4, marginBottom: Spacing.three },
  fieldLabel: { fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 18,
    fontWeight: '600',
  },
  toggleRow: {
    padding: Spacing.three,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  toggleTextBox: { flex: 1 },
  toggleLabel: { fontSize: 13, fontWeight: '600' },
  toggleDescription: { fontSize: 11, marginTop: 2, lineHeight: 15 },
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

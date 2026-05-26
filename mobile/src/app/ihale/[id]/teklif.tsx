import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import { formatTry, submitBid } from '../../../../shared';
import { findDemoAuction, formatRemaining } from '../../../../features/auction/demoAuctions';

export default function TeklifVer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const auction = useMemo(
    () => (typeof id === 'string' ? findDemoAuction(id) : undefined),
    [id],
  );

  const [bidInput, setBidInput] = useState('');
  const [proxyInput, setProxyInput] = useState('');
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

  if (auction.marketingMode !== 'auction') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.title, { color: palette.text }]}>Açık teklif geçerli değil</Text>
          <Text style={[styles.note, { color: palette.textSecondary }]}>
            Bu ihale {auction.marketingMode === 'sealed_offers' ? 'kapalı teklif' : 'müzakere'} modunda.
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

  const required = auction.currentBidTry + auction.minIncrementTry;

  const handleSubmit = async () => {
    const parsed = Number(bidInput.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert('Geçersiz teklif', 'Lütfen pozitif bir tutar girin.');
      return;
    }
    const proxy = Number(proxyInput.replace(/[^0-9]/g, '')) || undefined;

    setSubmitting(true);
    try {
      const result = await submitBid({
        auctionId: auction.id,
        bidderId: 'demo-mobile',
        currentBid: auction.currentBidTry,
        newBid: parsed,
        minIncrement: auction.minIncrementTry,
        userMaxProxy: proxy,
      });
      if (result.ok) {
        Alert.alert(
          'Teklif kabul edildi',
          `Son tutar: ${formatTry(result.finalAmount)}${result.proxy ? ' (vekil teklif uygulandı)' : ''}\n\nÇekirdek placeBidRpc Tool B Supabase bağlanınca canlıya yönlenir.`,
          [{ text: 'Tamam', onPress: () => router.back() }],
        );
      } else {
        Alert.alert(
          'Teklif reddedildi',
          `${result.message}\nGerekli minimum: ${formatTry(result.requiredMinimum)}`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: palette.text }]}>Teklif Ver</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]} numberOfLines={2}>
          {auction.title}
        </Text>

        <View style={[styles.snapshotCard, { backgroundColor: palette.backgroundElement }]}>
          <View style={styles.snapshotRow}>
            <Snapshot label="Cari Teklif" value={formatTry(auction.currentBidTry)} palette={palette} />
            <Snapshot label="Min Artış" value={formatTry(auction.minIncrementTry)} palette={palette} />
          </View>
          <View style={styles.snapshotRow}>
            <Snapshot label="Gereken Min" value={formatTry(required)} palette={palette} />
            <Snapshot
              label="Kalan Süre"
              value={formatRemaining(auction.endDateIso)}
              palette={palette}
            />
          </View>
        </View>

        <View style={styles.formBlock}>
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Teklif Tutarı (₺)</Text>
          <TextInput
            value={bidInput}
            onChangeText={setBidInput}
            keyboardType="number-pad"
            placeholder={String(required)}
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { borderColor: palette.backgroundSelected, color: palette.text, backgroundColor: palette.backgroundElement },
            ]}
          />
        </View>

        <View style={styles.formBlock}>
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
            Vekil teklif üst sınır (opsiyonel)
          </Text>
          <TextInput
            value={proxyInput}
            onChangeText={setProxyInput}
            keyboardType="number-pad"
            placeholder="Maks. otomatik artırma"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { borderColor: palette.backgroundSelected, color: palette.text, backgroundColor: palette.backgroundElement },
            ]}
          />
          <Text style={[styles.fieldHelp, { color: palette.textSecondary }]}>
            Sistem, başkalarının teklifine karşı bu üst sınıra kadar minimum artışla otomatik
            artırır (calculateProxyBid).
          </Text>
        </View>

        <Pressable
          disabled={submitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: submitting ? palette.backgroundSelected : '#0E5FFF',
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <Text style={styles.submitText}>
            {submitting ? 'Gönderiliyor…' : 'Teklif Gönder'}
          </Text>
        </Pressable>

        <Text style={[styles.demoNote, { color: palette.textSecondary }]}>
          {`bidActions.submitBid facade'i: validateBid + calculateProxyBid (saf motor) + simülasyon. Tool B Supabase bağlandığında çekirdek placeBidRpc tetiklenir.`}
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
  snapshotCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two, marginBottom: Spacing.three },
  snapshotRow: { flexDirection: 'row', gap: Spacing.three },
  snapshotCell: { flex: 1 },
  snapshotLabel: { fontSize: 11 },
  snapshotValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  formBlock: { gap: 4, marginBottom: Spacing.three },
  fieldLabel: { fontSize: 12 },
  fieldHelp: { fontSize: 11, marginTop: 4, lineHeight: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 18,
    fontWeight: '600',
  },
  submitBtn: { paddingVertical: Spacing.three, borderRadius: 12, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
  demoNote: { fontSize: 11, fontStyle: 'italic', marginTop: Spacing.three, textAlign: 'center' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  note: { fontSize: 13, textAlign: 'center' },
  backBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
});

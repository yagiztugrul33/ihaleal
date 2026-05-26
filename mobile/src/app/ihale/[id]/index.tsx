import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import { formatTry } from '../../../../shared';
import {
  findDemoAuction,
  formatRemaining,
  type DemoAuction,
} from '../../../../features/auction/demoAuctions';

export default function IhaleDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const auction = useMemo(
    () => (typeof id === 'string' ? findDemoAuction(id) : undefined),
    [id],
  );

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (!auction) return;
    const target = new Date(auction.endDateIso).getTime();
    if (!Number.isFinite(target) || target <= nowMs) return;
    const interval = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [auction, nowMs]);

  if (!auction) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundTitle, { color: palette.text }]}>İhale bulunamadı</Text>
          <Text style={[styles.notFoundText, { color: palette.textSecondary }]}>id: {String(id)}</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text style={[styles.backText, { color: palette.text }]}>Geri Dön</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = formatRemaining(auction.endDateIso, nowMs);
  const isAuction = auction.marketingMode === 'auction';
  const isSealed = auction.marketingMode === 'sealed_offers';
  const isListingOnly = auction.marketingMode === 'listing_only';
  const hasBuyNow = !!auction.buyNowPriceTry && (isAuction || isSealed);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: palette.backgroundElement }]}>
          <Text style={styles.heroIcon}>{auction.imagePlaceholder}</Text>
          <ModeBadge mode={auction.marketingMode} palette={palette} />
        </View>

        <Text style={[styles.title, { color: palette.text }]}>{auction.title}</Text>
        <Text style={[styles.meta, { color: palette.textSecondary }]}>
          {auction.city} • {auction.district} • {auction.m2} m²
          {auction.rooms ? ` • ${auction.rooms}+1` : ''}
        </Text>

        <View style={[styles.statsCard, { backgroundColor: palette.backgroundElement }]}>
          <View style={styles.statRow}>
            <Stat label="Cari Teklif" value={formatTry(auction.currentBidTry)} palette={palette} />
            <Stat label="Açılış" value={formatTry(auction.startingBidTry)} palette={palette} />
          </View>
          <View style={styles.statRow}>
            <Stat
              label="Min. Artış"
              value={auction.minIncrementTry > 0 ? formatTry(auction.minIncrementTry) : '—'}
              palette={palette}
            />
            <Stat label="Teklif Sayısı" value={String(auction.bidderCount)} palette={palette} />
          </View>
          <View style={[styles.remainingBanner, { backgroundColor: palette.backgroundSelected }]}>
            <Text style={[styles.remainingLabel, { color: palette.textSecondary }]}>Kalan Süre</Text>
            <Text style={[styles.remainingValue, { color: palette.text }]}>{remaining}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isAuction && (
            <Link
              href={{ pathname: '/ihale/[id]/teklif', params: { id: auction.id } }}
              asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: '#0E5FFF', opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={styles.primaryText}>Teklif Ver</Text>
              </Pressable>
            </Link>
          )}
          {isSealed && (
            <Link
              href={{ pathname: '/ihale/[id]/kapali-teklif', params: { id: auction.id } }}
              asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: '#9333EA', opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={styles.primaryText}>Kapalı Teklif Gönder</Text>
              </Pressable>
            </Link>
          )}
          {hasBuyNow && (
            <Link
              href={{ pathname: '/ihale/[id]/hemen-al', params: { id: auction.id } }}
              asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={[styles.secondaryText, { color: palette.text }]}>
                  Hemen Al · {auction.buyNowPriceTry ? formatTry(auction.buyNowPriceTry) : '—'}
                </Text>
              </Pressable>
            </Link>
          )}
          {isListingOnly && (
            <View
              style={[
                styles.infoBox,
                { borderColor: palette.backgroundSelected, backgroundColor: palette.backgroundElement },
              ]}>
              <Text style={[styles.infoText, { color: palette.textSecondary }]}>
                Bu ilan müzakere modunda. Teklif veya Hemen Al yok; platform üzerinden iletişim kurun.
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Açıklama</Text>
        <View style={[styles.descCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.descText, { color: palette.text }]}>{auction.description}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Teklif Geçmişi</Text>
        <View style={[styles.historyCard, { backgroundColor: palette.backgroundElement }]}>
          {auction.bidHistory.length === 0 ? (
            <Text style={[styles.empty, { color: palette.textSecondary }]}>
              {isSealed
                ? 'Kapalı teklif — geçmiş oturum kapanışına kadar gizli.'
                : 'Henüz teklif yok.'}
            </Text>
          ) : (
            auction.bidHistory.map((bid, idx) => (
              <View
                key={`bid-${idx}`}
                style={[
                  styles.historyRow,
                  idx > 0 && { borderTopColor: palette.backgroundSelected, borderTopWidth: 1 },
                ]}>
                <Text style={[styles.historyBidder, { color: palette.text }]}>{bid.bidder}</Text>
                <Text style={[styles.historyAmount, { color: palette.text }]}>
                  {formatTry(bid.amountTry)}
                </Text>
                <Text style={[styles.historyTime, { color: palette.textSecondary }]}>
                  {new Date(bid.timestamp).toLocaleString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={[styles.demoNote, { color: palette.textSecondary }]}>{auction.demoNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeBadge({
  mode,
  palette,
}: {
  mode: DemoAuction['marketingMode'];
  palette: Palette;
}) {
  const map: Record<DemoAuction['marketingMode'], { bg: string; label: string }> = {
    auction: { bg: '#0E5FFF', label: 'Açık Artırma' },
    sealed_offers: { bg: '#9333EA', label: 'Kapalı Teklif' },
    listing_only: { bg: '#6b7280', label: 'Müzakere' },
  };
  const cfg = map[mode];
  return (
    <View style={[styles.modeBadge, { backgroundColor: cfg.bg }]}>
      <Text style={styles.modeBadgeText}>{cfg.label}</Text>
    </View>
  );
}

function Stat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: Palette;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statLabel, { color: palette.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: palette.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  hero: {
    height: 160,
    borderRadius: 16,
    marginTop: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroIcon: { fontSize: 56 },
  modeBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modeBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', marginTop: Spacing.three },
  meta: { fontSize: 13, marginTop: 4, marginBottom: Spacing.three },
  statsCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two, marginBottom: Spacing.three },
  statRow: { flexDirection: 'row', gap: Spacing.three },
  statCell: { flex: 1 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  remainingBanner: {
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  remainingLabel: { fontSize: 11 },
  remainingValue: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  actions: { gap: Spacing.two },
  primaryBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: { fontWeight: '600', fontSize: 15 },
  infoBox: { padding: Spacing.three, borderRadius: 12, borderWidth: 1 },
  infoText: { fontSize: 13, lineHeight: 19 },
  sectionLabel: { fontSize: 18, fontWeight: '600', marginTop: Spacing.three, marginBottom: Spacing.two },
  descCard: { padding: Spacing.three, borderRadius: 14 },
  descText: { fontSize: 14, lineHeight: 21 },
  historyCard: { padding: Spacing.three, borderRadius: 14 },
  empty: { fontSize: 13, textAlign: 'center', paddingVertical: Spacing.three, fontStyle: 'italic' },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.two, gap: Spacing.two },
  historyBidder: { fontSize: 13, fontWeight: '600', flex: 1 },
  historyAmount: { fontSize: 14, fontWeight: '700' },
  historyTime: { fontSize: 11, minWidth: 80, textAlign: 'right' },
  demoNote: { fontSize: 11, fontStyle: 'italic', marginTop: Spacing.three, textAlign: 'center' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  notFoundTitle: { fontSize: 20, fontWeight: '700' },
  notFoundText: { fontSize: 13 },
  backBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
});

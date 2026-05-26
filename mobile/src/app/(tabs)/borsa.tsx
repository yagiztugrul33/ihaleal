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
import {
  DEMO_MARKET_ASSETS,
  buildOrderBook,
  createMarketSnapshot,
  formatTry,
  maskBidder,
  submitBid,
  type MarketDataAsset,
  type OrderBookBid,
} from '../../../shared';

const MIN_INCREMENT = 25_000;

function deriveDemoBids(asset: MarketDataAsset): OrderBookBid[] {
  const baseQty = Math.max(1, Math.round(asset.volume / 18));
  const spreadUnit = Math.max(1_000, Math.round(asset.price * 0.0015));
  const out: OrderBookBid[] = [];
  for (let level = 1; level <= 5; level += 1) {
    out.push({
      bidder: `${asset.code}-B${level}`,
      price: asset.price - spreadUnit * level,
      quantity: Math.max(1, baseQty - level + 2),
      side: 'bid',
    });
    out.push({
      bidder: `${asset.code}-A${level}`,
      price: asset.price + spreadUnit * level,
      quantity: Math.max(1, baseQty - level + 1),
      side: 'ask',
    });
  }
  return out;
}

export default function BorsaScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [selectedId, setSelectedId] = useState<string>(DEMO_MARKET_ASSETS[0]?.id ?? '');
  const [bidInput, setBidInput] = useState('');
  const [proxyInput, setProxyInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const snapshot = useMemo(() => createMarketSnapshot(DEMO_MARKET_ASSETS), []);
  const selected = useMemo(
    () => DEMO_MARKET_ASSETS.find((a) => a.id === selectedId) ?? DEMO_MARKET_ASSETS[0],
    [selectedId],
  );
  const orderBook = useMemo(() => (selected ? buildOrderBook(deriveDemoBids(selected)) : null), [selected]);

  const handleSubmit = async () => {
    if (!selected) return;
    const parsed = Number(bidInput.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert('Geçersiz teklif', 'Lütfen pozitif bir tutar girin.');
      return;
    }
    const proxy = Number(proxyInput.replace(/[^0-9]/g, '')) || undefined;
    setSubmitting(true);
    try {
      const result = await submitBid({
        auctionId: selected.id,
        bidderId: 'demo-mobile',
        currentBid: selected.price,
        newBid: parsed,
        minIncrement: MIN_INCREMENT,
        userMaxProxy: proxy,
      });
      if (result.ok) {
        Alert.alert(
          'Teklif alındı',
          `Son tutar: ${formatTry(result.finalAmount)}${result.proxy ? ' (vekil teklif uygulandı)' : ''}`,
        );
        setBidInput('');
        setProxyInput('');
      } else {
        Alert.alert('Reddedildi', `${result.message}\nMin gerekli: ${formatTry(result.requiredMinimum)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.text }]}>Borsa Terminali</Text>

        <View style={[styles.statsCard, { backgroundColor: palette.backgroundElement }]}>
          <View style={styles.statsRow}>
            <Stat label="Hacim" value={formatTry(snapshot.totalVolumeTry)} palette={palette} />
            <Stat label="İşlem" value={String(snapshot.tradeCount)} palette={palette} />
            <Stat label="Aktif Emir" value={String(snapshot.activeOrders)} palette={palette} />
          </View>
          <View style={styles.statsRow}>
            <Stat label="Spread" value={formatTry(snapshot.liquidity.spread)} palette={palette} />
            <Stat label="StdDev" value={`${snapshot.volatility.marketStdDev}%`} palette={palette} />
            <Stat label="Likit" value={snapshot.liquidity.mostLiquidCodes[0] ?? '—'} palette={palette} />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Varlıklar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetsRow}>
          {DEMO_MARKET_ASSETS.map((asset) => {
            const active = asset.id === selectedId;
            const positive = asset.changePct >= 0;
            return (
              <Pressable
                key={asset.id}
                onPress={() => setSelectedId(asset.id)}
                style={({ pressed }) => [
                  styles.assetChip,
                  {
                    backgroundColor: active ? palette.backgroundSelected : palette.backgroundElement,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <Text style={[styles.assetCode, { color: palette.text }]}>{asset.code}</Text>
                <Text style={[styles.assetPrice, { color: palette.text }]}>{formatTry(asset.price)}</Text>
                <Text
                  style={[
                    styles.assetChange,
                    { color: positive ? '#16a34a' : '#dc2626' },
                  ]}>
                  {positive ? '+' : ''}
                  {asset.changePct.toFixed(2)}%
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {selected && (
          <View style={[styles.detailCard, { backgroundColor: palette.backgroundElement }]}>
            <Text style={[styles.detailTitle, { color: palette.text }]}>{selected.property}</Text>
            <Text style={[styles.detailCode, { color: palette.textSecondary }]}>{selected.code}</Text>
            <View style={styles.statsRow}>
              <Stat label="Açılış" value={formatTry(selected.openPrice ?? selected.price)} palette={palette} />
              <Stat label="Önc. Kap." value={formatTry(selected.previousClose ?? selected.price)} palette={palette} />
              <Stat label="Hacim" value={String(selected.volume)} palette={palette} />
            </View>
            <View style={styles.statsRow}>
              <Stat label="Yüksek" value={formatTry(selected.high ?? selected.price)} palette={palette} />
              <Stat label="Düşük" value={formatTry(selected.low ?? selected.price)} palette={palette} />
              <Stat
                label="Değişim"
                value={`${selected.changePct >= 0 ? '+' : ''}${selected.changePct.toFixed(2)}%`}
                palette={palette}
              />
            </View>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Emir Defteri</Text>
        {orderBook && (
          <View style={styles.bookGrid}>
            <View style={[styles.bookCol, { backgroundColor: palette.backgroundElement }]}>
              <Text style={[styles.bookHeader, { color: '#dc2626' }]}>SATIŞ (Ask)</Text>
              {orderBook.asks.slice(0, 5).map((level, idx) => (
                <View key={`ask-${idx}`} style={styles.bookRow}>
                  <Text style={[styles.bookPrice, { color: '#dc2626' }]}>{formatTry(level.price)}</Text>
                  <Text style={[styles.bookQty, { color: palette.textSecondary }]}>{level.quantity}</Text>
                </View>
              ))}
              {orderBook.asks.length === 0 && (
                <Text style={[styles.bookEmpty, { color: palette.textSecondary }]}>—</Text>
              )}
            </View>
            <View style={[styles.bookCol, { backgroundColor: palette.backgroundElement }]}>
              <Text style={[styles.bookHeader, { color: '#16a34a' }]}>ALIŞ (Bid)</Text>
              {orderBook.bids.slice(0, 5).map((level, idx) => (
                <View key={`bid-${idx}`} style={styles.bookRow}>
                  <Text style={[styles.bookPrice, { color: '#16a34a' }]}>{formatTry(level.price)}</Text>
                  <Text style={[styles.bookQty, { color: palette.textSecondary }]}>{level.quantity}</Text>
                </View>
              ))}
              {orderBook.bids.length === 0 && (
                <Text style={[styles.bookEmpty, { color: palette.textSecondary }]}>—</Text>
              )}
            </View>
          </View>
        )}
        {orderBook && (
          <Text style={[styles.bookFooter, { color: palette.textSecondary }]}>
            En iyi alış: {orderBook.bestBid != null ? formatTry(orderBook.bestBid) : '—'} · En iyi satış:{' '}
            {orderBook.bestAsk != null ? formatTry(orderBook.bestAsk) : '—'}
          </Text>
        )}

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Teklif Paneli</Text>
        <View style={[styles.bidCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.bidHint, { color: palette.textSecondary }]}>
            Cari: {selected ? formatTry(selected.price) : '—'} · Min artış: {formatTry(MIN_INCREMENT)}
          </Text>
          <View style={styles.inputBlock}>
            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>Tutar (₺)</Text>
            <TextInput
              value={bidInput}
              onChangeText={setBidInput}
              keyboardType="number-pad"
              placeholder={selected ? String(selected.price + MIN_INCREMENT) : '0'}
              placeholderTextColor={palette.textSecondary}
              style={[styles.input, { borderColor: palette.backgroundSelected, color: palette.text }]}
            />
          </View>
          <View style={styles.inputBlock}>
            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>
              Vekil üst sınır (opsiyonel)
            </Text>
            <TextInput
              value={proxyInput}
              onChangeText={setProxyInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={palette.textSecondary}
              style={[styles.input, { borderColor: palette.backgroundSelected, color: palette.text }]}
            />
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
            <Text style={styles.submitText}>{submitting ? 'Gönderiliyor…' : 'Teklif Ver'}</Text>
          </Pressable>
          <Text style={[styles.bidNote, { color: palette.textSecondary }]}>
            * Üretimde teklif çekirdek placeBid RPC'sine yönlendirilir (Tool B Supabase istemcisi
            bağlanınca etkinleşir). Bu sürüm istemci-tarafı doğrulama + simülasyondur.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Demo Bidder İzleri</Text>
        <View style={[styles.tracksCard, { backgroundColor: palette.backgroundElement }]}>
          {selected &&
            deriveDemoBids(selected)
              .slice(0, 6)
              .map((bid, idx) => (
                <View key={`tr-${idx}`} style={styles.trackRow}>
                  <Text style={[styles.trackBidder, { color: palette.text }]}>{maskBidder(bid.bidder)}</Text>
                  <Text
                    style={[
                      styles.trackPrice,
                      { color: bid.side === 'ask' ? '#dc2626' : '#16a34a' },
                    ]}>
                    {formatTry(bid.price)}
                  </Text>
                  <Text style={[styles.trackQty, { color: palette.textSecondary }]}>×{bid.quantity}</Text>
                </View>
              ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  title: { fontSize: 28, fontWeight: '700', marginTop: Spacing.three, marginBottom: Spacing.three },
  statsCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two, marginBottom: Spacing.three },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statCell: { flex: 1 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  sectionLabel: { fontSize: 18, fontWeight: '600', marginTop: Spacing.three, marginBottom: Spacing.two },
  assetsRow: { gap: Spacing.two, paddingRight: Spacing.three },
  assetChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12, minWidth: 120 },
  assetCode: { fontSize: 13, fontWeight: '700' },
  assetPrice: { fontSize: 13, marginTop: 2 },
  assetChange: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  detailCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two, marginTop: Spacing.two },
  detailTitle: { fontSize: 16, fontWeight: '700' },
  detailCode: { fontSize: 12 },
  bookGrid: { flexDirection: 'row', gap: Spacing.two },
  bookCol: { flex: 1, padding: Spacing.three, borderRadius: 14, gap: 6 },
  bookHeader: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  bookRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bookPrice: { fontSize: 13, fontWeight: '600' },
  bookQty: { fontSize: 12 },
  bookEmpty: { fontSize: 12, textAlign: 'center', paddingVertical: 8 },
  bookFooter: { fontSize: 11, marginTop: 6, textAlign: 'center' },
  bidCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two },
  bidHint: { fontSize: 12 },
  inputBlock: { gap: 4 },
  inputLabel: { fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  submitBtn: { paddingVertical: Spacing.three, borderRadius: 12, alignItems: 'center', marginTop: Spacing.one },
  submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
  bidNote: { fontSize: 11, fontStyle: 'italic' },
  tracksCard: { padding: Spacing.three, borderRadius: 14, gap: 6 },
  trackRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  trackBidder: { fontSize: 13, flex: 1 },
  trackPrice: { fontSize: 13, fontWeight: '600' },
  trackQty: { fontSize: 12, minWidth: 50, textAlign: 'right' },
});

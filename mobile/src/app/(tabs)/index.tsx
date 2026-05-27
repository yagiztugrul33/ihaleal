import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import {
  DEMO_LISTINGS,
  DEMO_MARKET_ASSETS,
  createMarketSnapshot,
  formatTry,
} from '../../../shared';

export default function AnaScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const snapshot = useMemo(() => createMarketSnapshot(DEMO_MARKET_ASSETS), []);
  const featured = useMemo(
    () => [...DEMO_LISTINGS].sort((a, b) => b.aiScore - a.aiScore).slice(0, 3),
    [],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={[styles.headerTitle, { color: palette.text }]}>İhaleal</Text>
          <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
            Türkiye gayrimenkul borsası — mobil terminal
          </Text>
        </View>

        <View style={[styles.snapshotCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Piyasa Özeti</Text>
          <View style={styles.metricRow}>
            <Metric label="Toplam Hacim" value={formatTry(snapshot.totalVolumeTry)} palette={palette} />
            <Metric label="İşlem Sayısı" value={String(snapshot.tradeCount)} palette={palette} />
          </View>
          <View style={styles.metricRow}>
            <Metric label="Spread" value={formatTry(snapshot.liquidity.spread)} palette={palette} />
            <Metric label="Derinlik" value={String(snapshot.liquidity.depth)} palette={palette} />
          </View>
          <View style={styles.breadthRow}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>Hareket</Text>
            <Text style={[styles.metricValue, { color: '#16a34a' }]}>↑ {snapshot.breadth.rising}</Text>
            <Text style={[styles.metricValue, { color: palette.textSecondary }]}>= {snapshot.breadth.flat}</Text>
            <Text style={[styles.metricValue, { color: '#dc2626' }]}>↓ {snapshot.breadth.falling}</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Öne Çıkan İlanlar</Text>
        {featured.map((listing) => (
          <Link key={listing.id} href={{ pathname: '/ilan/[id]', params: { id: listing.id } }} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.listingCard,
                { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.7 : 1 },
              ]}>
              <View style={styles.listingHeader}>
                <Text style={[styles.listingTitle, { color: palette.text }]} numberOfLines={1}>
                  {listing.title}
                </Text>
                <View style={[styles.aiBadge, { backgroundColor: palette.backgroundSelected }]}>
                  <Text style={[styles.aiBadgeText, { color: palette.text }]}>AI {listing.aiScore}</Text>
                </View>
              </View>
              <Text style={[styles.listingMeta, { color: palette.textSecondary }]}>
                {listing.city} • {listing.district} • {listing.type}
              </Text>
              <Text style={[styles.listingPrice, { color: palette.text }]}>
                {formatTry(listing.priceTry)}
              </Text>
            </Pressable>
          </Link>
        ))}

        <Text style={[styles.sectionLabel, { color: palette.text }]}>Hızlı Erişim</Text>
        <View style={styles.quickGrid}>
          <QuickLink href="/borsa" label="Borsa Terminali" palette={palette} />
          <QuickLink href="/ihaleler" label="Canlı İhaleler" palette={palette} />
          <QuickLink href="/ilanlar" label="Tüm İlanlar" palette={palette} />
          <QuickLink href="/degerleme" label="AI Değerleme" palette={palette} />
          <QuickLink href="/moduller/deprem" label="Deprem Modülü" palette={palette} />
          <QuickLink href="/moduller" label="Modüller Hub" palette={palette} />
          <QuickLink href="/araclar" label="Finansal Araçlar" palette={palette} />
          <QuickLink href="/borsa-detay" label="Borsa Detay" palette={palette} />
          <QuickLink href="/icerik" label="Hukuki / İçerik" palette={palette} />
          <QuickLink href="/profil" label="Profil" palette={palette} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, palette }: { label: string; value: string; palette: Palette }) {
  return (
    <View style={styles.metricCol}>
      <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: palette.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function QuickLink({
  href,
  label,
  palette,
}: {
  href:
    | '/borsa'
    | '/ihaleler'
    | '/ilanlar'
    | '/degerleme'
    | '/moduller/deprem'
    | '/moduller'
    | '/araclar'
    | '/borsa-detay'
    | '/icerik'
    | '/profil';
  label: string;
  palette: Palette;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.quickCell,
          { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.7 : 1 },
        ]}>
        <Text style={[styles.quickLabel, { color: palette.text }]}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  headerBlock: { paddingVertical: Spacing.four, gap: Spacing.one },
  headerTitle: { fontSize: 32, fontWeight: '700' },
  headerSubtitle: { fontSize: 14 },
  snapshotCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two, marginBottom: Spacing.three },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.one },
  metricRow: { flexDirection: 'row', gap: Spacing.three },
  metricCol: { flex: 1 },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 16, fontWeight: '600' },
  breadthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.one },
  sectionLabel: { fontSize: 18, fontWeight: '600', marginTop: Spacing.three, marginBottom: Spacing.two },
  listingCard: { borderRadius: 14, padding: Spacing.three, gap: Spacing.one, marginBottom: Spacing.two },
  listingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  listingTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  aiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  aiBadgeText: { fontSize: 12, fontWeight: '600' },
  listingMeta: { fontSize: 12 },
  listingPrice: { fontSize: 18, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  quickCell: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
  },
  quickLabel: { fontSize: 14, fontWeight: '600' },
});

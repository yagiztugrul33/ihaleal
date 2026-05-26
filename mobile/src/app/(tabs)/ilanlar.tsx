import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import { DEMO_LISTINGS, formatTry, type DemoListing } from '../../../shared';

type Filter = 'tumu' | 'konut' | 'ticari' | 'arsa' | 'turizm';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'tumu', label: 'Tümü' },
  { key: 'konut', label: 'Konut' },
  { key: 'ticari', label: 'Ticari' },
  { key: 'arsa', label: 'Arsa' },
  { key: 'turizm', label: 'Turizm' },
];

export default function IlanlarScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [filter, setFilter] = useState<Filter>('tumu');

  const data = useMemo(
    () => (filter === 'tumu' ? DEMO_LISTINGS : DEMO_LISTINGS.filter((l) => l.type === filter)),
    [filter],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>İlanlar</Text>
        <Text style={[styles.count, { color: palette.textSecondary }]}>
          {data.length} ilan • AI değerleme dahil
        </Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: active ? palette.backgroundSelected : palette.backgroundElement,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.filterText,
                  { color: active ? palette.text : palette.textSecondary, fontWeight: active ? '700' : '500' },
                ]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        renderItem={({ item }) => <ListingRow listing={item} palette={palette} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: palette.textSecondary }]}>Bu filtrede ilan bulunamadı.</Text>
        }
      />
    </SafeAreaView>
  );
}

function ListingRow({ listing, palette }: { listing: DemoListing; palette: Palette }) {
  const delta = listing.estimatedValueTry - listing.priceTry;
  const deltaPct = (delta / listing.priceTry) * 100;
  const positive = delta >= 0;
  return (
    <Link href={{ pathname: '/ilan/[id]', params: { id: listing.id } }} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: palette.backgroundElement, opacity: pressed ? 0.75 : 1 },
        ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={2}>
            {listing.title}
          </Text>
          <View style={[styles.scoreBadge, { backgroundColor: palette.backgroundSelected }]}>
            <Text style={[styles.scoreText, { color: palette.text }]}>AI {listing.aiScore}</Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: palette.textSecondary }]}>
          {listing.city} • {listing.district} • {listing.m2} m²
          {listing.rooms ? ` • ${listing.rooms}+1` : ''}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: palette.text }]}>{formatTry(listing.priceTry)}</Text>
          <Text style={[styles.delta, { color: positive ? '#16a34a' : '#dc2626' }]}>
            {positive ? '+' : ''}
            {deltaPct.toFixed(1)}% vs AI
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: 4 },
  title: { fontSize: 28, fontWeight: '700' },
  count: { fontSize: 13 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  filterText: { fontSize: 13 },
  list: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  card: { padding: Spacing.three, borderRadius: 14, gap: 6 },
  cardHeader: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  scoreText: { fontSize: 12, fontWeight: '700' },
  meta: { fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 18, fontWeight: '700' },
  delta: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: Spacing.four },
});

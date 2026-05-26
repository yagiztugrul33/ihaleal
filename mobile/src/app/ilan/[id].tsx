import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { type Palette } from '@/constants/palette';
import {
  estimatePropertyValue,
  findListing,
  formatTry,
  type LocationTier,
  type ValuationInput,
} from '../../../shared';

function inferTierFromAiScore(score: number): LocationTier {
  if (score >= 85) return 'prime';
  if (score >= 70) return 'strong';
  if (score >= 55) return 'balanced';
  return 'emerging';
}

export default function IlanDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const listing = useMemo(() => (typeof id === 'string' ? findListing(id) : undefined), [id]);

  const valuation = useMemo(() => {
    if (!listing) return null;
    const input: ValuationInput = {
      city: 'istanbul',
      district: listing.district,
      grossM2: listing.m2,
      roomCount: listing.rooms ?? 3,
      floor: 4,
      totalFloors: 10,
      buildingAge: 8,
      transactionType: 'sale',
      condition: 'good',
      heatingType: 'combi',
      locationTier: inferTierFromAiScore(listing.aiScore),
      hasElevator: true,
      hasParking: true,
    };
    return estimatePropertyValue(input);
  }, [listing]);

  if (!listing) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundTitle, { color: palette.text }]}>İlan bulunamadı</Text>
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

  const delta = valuation ? valuation.estimatedValue - listing.priceTry : 0;
  const deltaPct = listing.priceTry > 0 ? (delta / listing.priceTry) * 100 : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: palette.text }]}>{listing.title}</Text>
        <Text style={[styles.meta, { color: palette.textSecondary }]}>
          {listing.city} • {listing.district} • {listing.m2} m² • {listing.type}
        </Text>

        <View style={[styles.priceCard, { backgroundColor: palette.backgroundElement }]}>
          <Text style={[styles.priceLabel, { color: palette.textSecondary }]}>İlan Fiyatı</Text>
          <Text style={[styles.priceValue, { color: palette.text }]}>{formatTry(listing.priceTry)}</Text>
          <View style={[styles.aiBadgeRow, { backgroundColor: palette.backgroundSelected }]}>
            <Text style={[styles.aiBadgeText, { color: palette.text }]}>AI Skor: {listing.aiScore}</Text>
          </View>
        </View>

        {valuation && (
          <View style={[styles.aiCard, { backgroundColor: palette.backgroundElement }]}>
            <Text style={[styles.aiTitle, { color: palette.text }]}>AI Değerleme</Text>
            <Text style={[styles.aiValue, { color: palette.text }]}>{formatTry(valuation.estimatedValue)}</Text>
            <Text style={[styles.aiRange, { color: palette.textSecondary }]}>
              {formatTry(valuation.minValue)} – {formatTry(valuation.maxValue)}
            </Text>
            <Text style={[styles.deltaText, { color: delta >= 0 ? '#16a34a' : '#dc2626' }]}>
              {delta >= 0 ? '+' : ''}
              {formatTry(delta)} ({delta >= 0 ? '+' : ''}
              {deltaPct.toFixed(1)}%)
            </Text>
            <View style={styles.statsRow}>
              <Stat label="Birim m²" value={formatTry(valuation.unitPrice)} palette={palette} />
              <Stat label="Güven" value={`±${valuation.confidenceBandPct}%`} palette={palette} />
              <Stat label="Trend" value={`${valuation.neighborhoodTrendPct}%`} palette={palette} />
            </View>
            <Text style={[styles.note, { color: palette.textSecondary }]}>{valuation.note}</Text>

            <Text style={[styles.subSection, { color: palette.text }]}>Yaklaşımlar</Text>
            <View style={styles.statsRow}>
              <Stat label="Emsal" value={formatTry(valuation.approaches.salesComparisonTry)} palette={palette} />
              <Stat label="Maliyet" value={formatTry(valuation.approaches.costApproachTry)} palette={palette} />
              <Stat label="Gelir" value={formatTry(valuation.approaches.incomeApproachTry)} palette={palette} />
            </View>

            <Text style={[styles.subSection, { color: palette.text }]}>SHAP Katkıları</Text>
            {valuation.contributions.slice(0, 6).map((c, idx) => (
              <View key={`con-${idx}`} style={styles.contribRow}>
                <Text style={[styles.contribLabel, { color: palette.text }]}>{c.label}</Text>
                <Text
                  style={[
                    styles.contribValue,
                    { color: c.tryImpact >= 0 ? '#16a34a' : '#dc2626' },
                  ]}>
                  {c.tryImpact >= 0 ? '+' : ''}
                  {formatTry(c.tryImpact)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: palette.backgroundElement,
              opacity: pressed ? 0.7 : 1,
              marginTop: Spacing.three,
              alignSelf: 'center',
            },
          ]}>
          <Text style={[styles.backText, { color: palette.text }]}>Listeye Dön</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, palette }: { label: string; value: string; palette: Palette }) {
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
  scroll: { padding: Spacing.three, paddingBottom: Spacing.six },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 4, marginBottom: Spacing.three },
  priceCard: { padding: Spacing.three, borderRadius: 14, gap: 6, marginBottom: Spacing.three },
  priceLabel: { fontSize: 12 },
  priceValue: { fontSize: 28, fontWeight: '700' },
  aiBadgeRow: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start' },
  aiBadgeText: { fontSize: 13, fontWeight: '700' },
  aiCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two },
  aiTitle: { fontSize: 16, fontWeight: '700' },
  aiValue: { fontSize: 24, fontWeight: '700' },
  aiRange: { fontSize: 13 },
  deltaText: { fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  statCell: { flex: 1 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  note: { fontSize: 12, fontStyle: 'italic' },
  subSection: { fontSize: 14, fontWeight: '700', marginTop: Spacing.two },
  contribRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  contribLabel: { fontSize: 13 },
  contribValue: { fontSize: 13, fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  notFoundTitle: { fontSize: 20, fontWeight: '700' },
  notFoundText: { fontSize: 13 },
  backBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
});

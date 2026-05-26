import { useMemo, useState } from 'react';
import {
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
  REGIONAL_PRICE_DATA,
  estimatePropertyValue,
  formatTry,
  type CityKey,
  type HeatingType,
  type LocationTier,
  type PropertyCondition,
  type ValuationInput,
  type ValuationResult,
} from '../../../shared';

const CONDITIONS: { key: PropertyCondition; label: string }[] = [
  { key: 'new', label: 'Yeni' },
  { key: 'good', label: 'İyi' },
  { key: 'needs_renovation', label: 'Tadilat' },
];

const HEATINGS: { key: HeatingType; label: string }[] = [
  { key: 'combi', label: 'Kombi' },
  { key: 'central', label: 'Merkezi' },
  { key: 'district', label: 'Bölgesel' },
  { key: 'underfloor', label: 'Yerden' },
  { key: 'stove', label: 'Soba' },
];

const TIERS: { key: LocationTier; label: string }[] = [
  { key: 'prime', label: 'Prime' },
  { key: 'strong', label: 'Güçlü' },
  { key: 'balanced', label: 'Denge' },
  { key: 'emerging', label: 'Gelişen' },
];

export default function DegerlemeScreen() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [city, setCity] = useState<CityKey>('istanbul');
  const [district, setDistrict] = useState<string>('Kadikoy');
  const [grossM2, setGrossM2] = useState('120');
  const [rooms, setRooms] = useState('3');
  const [floor, setFloor] = useState('4');
  const [totalFloors, setTotalFloors] = useState('10');
  const [age, setAge] = useState('8');
  const [condition, setCondition] = useState<PropertyCondition>('good');
  const [heating, setHeating] = useState<HeatingType>('combi');
  const [tier, setTier] = useState<LocationTier>('strong');
  const [elevator, setElevator] = useState(true);
  const [parking, setParking] = useState(true);
  const [result, setResult] = useState<ValuationResult | null>(null);

  const cityList = useMemo(() => REGIONAL_PRICE_DATA.map((c) => c.key), []);
  const districtList = useMemo(() => {
    const found = REGIONAL_PRICE_DATA.find((c) => c.key === city);
    return found?.districts ? Object.keys(found.districts) : [];
  }, [city]);

  const compute = () => {
    const input: ValuationInput = {
      city,
      district,
      grossM2: Number(grossM2) || 100,
      roomCount: Number(rooms) || 3,
      floor: Number(floor) || 1,
      totalFloors: Number(totalFloors) || 5,
      buildingAge: Number(age) || 5,
      transactionType: 'sale',
      condition,
      heatingType: heating,
      locationTier: tier,
      hasElevator: elevator,
      hasParking: parking,
    };
    setResult(estimatePropertyValue(input));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.text }]}>AI Değerleme</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Hedonik + emsal + makro yaklaşım — SHAP benzeri katkı çözümü
        </Text>

        <Section title="Konum" palette={palette}>
          <Chips
            options={cityList.map((c) => ({ key: c, label: c }))}
            active={city}
            onChange={(key) => {
              setCity(key as CityKey);
              const found = REGIONAL_PRICE_DATA.find((c) => c.key === key);
              if (found?.districts) {
                const firstDistrict = Object.keys(found.districts)[0];
                if (firstDistrict) setDistrict(firstDistrict);
              }
            }}
            palette={palette}
          />
          {districtList.length > 0 && (
            <Chips
              options={districtList.map((d) => ({ key: d, label: d }))}
              active={district}
              onChange={(key) => setDistrict(key)}
              palette={palette}
            />
          )}
        </Section>

        <Section title="Yapı" palette={palette}>
          <NumField label="Brüt m²" value={grossM2} onChange={setGrossM2} palette={palette} />
          <NumField label="Oda" value={rooms} onChange={setRooms} palette={palette} />
          <View style={styles.row2}>
            <NumField label="Kat" value={floor} onChange={setFloor} palette={palette} />
            <NumField label="Toplam Kat" value={totalFloors} onChange={setTotalFloors} palette={palette} />
          </View>
          <NumField label="Bina Yaşı" value={age} onChange={setAge} palette={palette} />
        </Section>

        <Section title="Durum" palette={palette}>
          <Chips
            options={CONDITIONS.map((c) => ({ key: c.key, label: c.label }))}
            active={condition}
            onChange={(k) => setCondition(k as PropertyCondition)}
            palette={palette}
          />
        </Section>

        <Section title="Isıtma" palette={palette}>
          <Chips
            options={HEATINGS.map((h) => ({ key: h.key, label: h.label }))}
            active={heating}
            onChange={(k) => setHeating(k as HeatingType)}
            palette={palette}
          />
        </Section>

        <Section title="Konum Kademesi" palette={palette}>
          <Chips
            options={TIERS.map((t) => ({ key: t.key, label: t.label }))}
            active={tier}
            onChange={(k) => setTier(k as LocationTier)}
            palette={palette}
          />
        </Section>

        <Section title="Donanım" palette={palette}>
          <View style={styles.row2}>
            <Toggle label="Asansör" value={elevator} onChange={setElevator} palette={palette} />
            <Toggle label="Otopark" value={parking} onChange={setParking} palette={palette} />
          </View>
        </Section>

        <Pressable
          onPress={compute}
          style={({ pressed }) => [
            styles.computeBtn,
            { backgroundColor: '#0E5FFF', opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={styles.computeText}>Hesapla</Text>
        </Pressable>

        {result && (
          <View style={[styles.resultCard, { backgroundColor: palette.backgroundElement }]}>
            <Text style={[styles.resultLabel, { color: palette.textSecondary }]}>Tahmini Değer</Text>
            <Text style={[styles.resultValue, { color: palette.text }]}>{formatTry(result.estimatedValue)}</Text>
            <Text style={[styles.resultRange, { color: palette.textSecondary }]}>
              {formatTry(result.minValue)} — {formatTry(result.maxValue)}
            </Text>
            <View style={styles.row3}>
              <Stat label="Birim m²" value={formatTry(result.unitPrice)} palette={palette} />
              <Stat label="Güven" value={`${result.confidence} ±${result.confidenceBandPct}%`} palette={palette} />
              <Stat label="Bölge Trend" value={`${result.neighborhoodTrendPct}%`} palette={palette} />
            </View>
            <Text style={[styles.note, { color: palette.textSecondary }]}>{result.note}</Text>

            <Text style={[styles.subSection, { color: palette.text }]}>Yaklaşımlar</Text>
            <View style={styles.row3}>
              <Stat label="Emsal" value={formatTry(result.approaches.salesComparisonTry)} palette={palette} />
              <Stat label="Maliyet" value={formatTry(result.approaches.costApproachTry)} palette={palette} />
              <Stat label="Gelir" value={formatTry(result.approaches.incomeApproachTry)} palette={palette} />
            </View>

            <Text style={[styles.subSection, { color: palette.text }]}>SHAP Katkıları</Text>
            {result.contributions.map((c, idx) => (
              <View key={`c-${idx}`} style={styles.contribRow}>
                <Text style={[styles.contribLabel, { color: palette.text }]}>{c.label}</Text>
                <Text
                  style={[
                    styles.contribValue,
                    { color: c.tryImpact >= 0 ? '#16a34a' : '#dc2626' },
                  ]}>
                  {c.tryImpact >= 0 ? '+' : ''}
                  {formatTry(c.tryImpact)} ({c.pctImpact >= 0 ? '+' : ''}
                  {c.pctImpact.toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, palette, children }: { title: string; palette: Palette; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function Chips({
  options,
  active,
  onChange,
  palette,
}: {
  options: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  palette: Palette;
}) {
  return (
    <View style={styles.chipsRow}>
      {options.map((opt) => {
        const a = opt.key === active;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: a ? palette.backgroundSelected : palette.backgroundElement,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={[styles.chipText, { color: a ? palette.text : palette.textSecondary }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NumField({
  label,
  value,
  onChange,
  palette,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  palette: Palette;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        style={[styles.fieldInput, { borderColor: palette.backgroundSelected, color: palette.text }]}
      />
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
  palette,
}: {
  label: string;
  value: boolean;
  onChange: (b: boolean) => void;
  palette: Palette;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={({ pressed }) => [
        styles.toggle,
        {
          backgroundColor: value ? '#0E5FFF' : palette.backgroundElement,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Text style={[styles.toggleLabel, { color: value ? 'white' : palette.text }]}>{label}</Text>
      <Text style={[styles.toggleState, { color: value ? 'white' : palette.textSecondary }]}>
        {value ? 'Var' : 'Yok'}
      </Text>
    </Pressable>
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
  scroll: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  title: { fontSize: 28, fontWeight: '700', marginTop: Spacing.three },
  subtitle: { fontSize: 13, marginBottom: Spacing.three },
  section: { gap: Spacing.two, marginBottom: Spacing.three },
  sectionTitle: { fontSize: 14, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipText: { fontSize: 12, fontWeight: '600' },
  fieldBlock: { gap: 4 },
  fieldLabel: { fontSize: 12 },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  row2: { flexDirection: 'row', gap: Spacing.two },
  row3: { flexDirection: 'row', gap: Spacing.two },
  toggle: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleState: { fontSize: 12, fontWeight: '700' },
  computeBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  computeText: { color: 'white', fontWeight: '700', fontSize: 16 },
  resultCard: { padding: Spacing.three, borderRadius: 14, gap: Spacing.two },
  resultLabel: { fontSize: 12 },
  resultValue: { fontSize: 28, fontWeight: '700' },
  resultRange: { fontSize: 13 },
  statCell: { flex: 1 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  note: { fontSize: 12, fontStyle: 'italic', marginTop: Spacing.one },
  subSection: { fontSize: 14, fontWeight: '700', marginTop: Spacing.two },
  contribRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  contribLabel: { fontSize: 13 },
  contribValue: { fontSize: 13, fontWeight: '600' },
});

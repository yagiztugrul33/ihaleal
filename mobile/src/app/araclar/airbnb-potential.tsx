import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatTl } from "./formatters";
import {
  buildAirbnbPotentialRows,
  computeAirbnbPotential,
  getDefaultAirbnbPotentialForm,
} from "./airbnbPotential.logic";
import { NumericField, ResultCard, ScreenSection } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function AirbnbPotentialScreen() {
  const [form, setForm] = useState(getDefaultAirbnbPotentialForm());
  const debounced = useDebouncedValue(form, 320);
  const computed = useMemo(() => computeAirbnbPotential(debounced), [debounced]);

  const rows =
    "value" in computed
      ? buildAirbnbPotentialRows(computed.value).map((row) => ({ label: row.label, value: formatTl(row.value) }))
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Airbnb Potansiyeli</Text>
        <Text style={styles.subtitle}>
          Kısa dönem kira potansiyeli ekranı. Bu ekran komisyon hesaplayıcı değildir; yalnız kira gelir potansiyelini analiz eder.
        </Text>

        <ScreenSection title="Gelir varsayımları">
          <NumericField
            label="Gecelik fiyat (TL)"
            value={form.nightlyRateTry}
            onChange={(value) => setForm((prev) => ({ ...prev, nightlyRateTry: value }))}
            accessibilityLabel="Airbnb gecelik fiyat"
          />
          <NumericField
            label="Doluluk oranı (%)"
            value={form.occupancyRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, occupancyRatePct: value }))}
            accessibilityLabel="Airbnb doluluk oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Yıllık konaklama adedi"
            value={form.expectedStaysPerYear}
            onChange={(value) => setForm((prev) => ({ ...prev, expectedStaysPerYear: value }))}
            accessibilityLabel="Airbnb yıllık konaklama adedi"
          />
        </ScreenSection>

        <ScreenSection title="Maliyet varsayımları">
          <NumericField
            label="Temizlik / konaklama (TL)"
            value={form.cleaningCostPerStayTry}
            onChange={(value) => setForm((prev) => ({ ...prev, cleaningCostPerStayTry: value }))}
            accessibilityLabel="Airbnb temizlik maliyeti"
          />
          <NumericField
            label="Platform kesintisi (%)"
            value={form.platformCommissionRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, platformCommissionRatePct: value }))}
            accessibilityLabel="Airbnb platform kesintisi"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Yıllık işletme gideri (TL)"
            value={form.annualOperatingCostTry}
            onChange={(value) => setForm((prev) => ({ ...prev, annualOperatingCostTry: value }))}
            accessibilityLabel="Airbnb işletme gideri"
          />
          <NumericField
            label="Boşluk rezervi (%)"
            value={form.vacancyReserveRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, vacancyReserveRatePct: value }))}
            accessibilityLabel="Airbnb boşluk rezervi"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Uzun dönem aylık kira (TL)"
            value={form.longTermMonthlyRentTry}
            onChange={(value) => setForm((prev) => ({ ...prev, longTermMonthlyRentTry: value }))}
            accessibilityLabel="Airbnb uzun dönem kira"
          />
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}
        {"value" in computed ? (
          <ResultCard title="Sonuç" rows={rows} note="Motor: calculateAirbnbPotential (shared bridge)." testID="airbnb-potential-card" />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 14 },
  error: {
    color: "#fecaca",
    backgroundColor: "#450a0a",
    borderColor: "#7f1d1d",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
});

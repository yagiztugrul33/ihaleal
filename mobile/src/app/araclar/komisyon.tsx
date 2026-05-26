import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buildCommissionSummaryRows, computeCommission, getDefaultCommissionForm } from "./commission.logic";
import { formatPercent, formatTl } from "./formatters";
import { NumericField, ResultCard, ScreenSection } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function KomisyonScreen() {
  const [form, setForm] = useState(getDefaultCommissionForm());
  const debounced = useDebouncedValue(form, 320);
  const computed = useMemo(() => computeCommission(debounced), [debounced]);

  const summaryRows =
    "value" in computed
      ? buildCommissionSummaryRows(computed.value).map((row) => ({ label: row.label, value: formatTl(row.value) }))
      : [];

  const detailRows =
    "value" in computed
      ? [
          { label: "Doluluk", value: formatPercent(Number(form.occupancyRatePct.replace(",", ".")) || 0) },
          {
            label: "Komisyon oranı",
            value: formatPercent(Number(form.platformCommissionRatePct.replace(",", ".")) || 0),
          },
          { label: "Temizlik toplamı", value: formatTl(computed.value.annualCleaningCostTry) },
          { label: "Boşluk rezervi", value: formatTl(computed.value.annualVacancyReserveTry) },
        ]
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Komisyon Hesaplayıcı</Text>
        <Text style={styles.subtitle}>
          `mobile/shared/calculators` içindeki commission çıktılı motor (`calculateAirbnbPotential`) ile hesaplanır.
        </Text>

        <ScreenSection title="Gelir ve oran girdileri">
          <NumericField
            label="Gecelik fiyat (TL)"
            value={form.nightlyRateTry}
            onChange={(value) => setForm((prev) => ({ ...prev, nightlyRateTry: value }))}
            accessibilityLabel="Komisyon gecelik fiyat"
          />
          <NumericField
            label="Doluluk oranı (%)"
            value={form.occupancyRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, occupancyRatePct: value }))}
            accessibilityLabel="Komisyon doluluk oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Platform komisyon oranı (%)"
            value={form.platformCommissionRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, platformCommissionRatePct: value }))}
            accessibilityLabel="Komisyon oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Yıllık konaklama adedi"
            value={form.expectedStaysPerYear}
            onChange={(value) => setForm((prev) => ({ ...prev, expectedStaysPerYear: value }))}
            accessibilityLabel="Komisyon yıllık konaklama adedi"
          />
        </ScreenSection>

        <ScreenSection title="Maliyet girdileri">
          <NumericField
            label="Temizlik / konaklama (TL)"
            value={form.cleaningCostPerStayTry}
            onChange={(value) => setForm((prev) => ({ ...prev, cleaningCostPerStayTry: value }))}
            accessibilityLabel="Komisyon temizlik bedeli"
          />
          <NumericField
            label="Yıllık işletme gideri (TL)"
            value={form.annualOperatingCostTry}
            onChange={(value) => setForm((prev) => ({ ...prev, annualOperatingCostTry: value }))}
            accessibilityLabel="Komisyon işletme gideri"
          />
          <NumericField
            label="Boşluk rezervi (%)"
            value={form.vacancyReserveRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, vacancyReserveRatePct: value }))}
            accessibilityLabel="Komisyon boşluk rezerv oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Uzun dönem aylık kira (TL)"
            value={form.longTermMonthlyRentTry}
            onChange={(value) => setForm((prev) => ({ ...prev, longTermMonthlyRentTry: value }))}
            accessibilityLabel="Komisyon uzun dönem aylık kira"
          />
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}

        {"value" in computed ? (
          <>
            <ResultCard title="Özet" rows={summaryRows} testID="commission-summary-card" />
            <ResultCard title="Kırılım" rows={detailRows} testID="commission-detail-card" />
          </>
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

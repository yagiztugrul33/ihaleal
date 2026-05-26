import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatPercent, formatTl } from "./formatters";
import {
  buildInvestmentReturnsRows,
  computeInvestmentReturns,
  getDefaultInvestmentReturnsForm,
} from "./investmentReturns.logic";
import { NumericField, ResultCard, ScreenSection, ToggleChip } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function InvestmentReturnsScreen() {
  const [form, setForm] = useState(getDefaultInvestmentReturnsForm());
  const debounced = useDebouncedValue(form, 320);
  const computed = useMemo(() => computeInvestmentReturns(debounced), [debounced]);

  const rows =
    "value" in computed
      ? buildInvestmentReturnsRows(computed.value).map((row) => ({
          label: row.label,
          value: row.label.includes("getiri") || row.label.includes("ROI") ? formatPercent(row.value) : formatTl(row.value),
        }))
      : [];

  const detailRows =
    "value" in computed
      ? [
          { label: "Kira çarpanı", value: `${computed.value.rentMultiplierMonths.toFixed(2)} ay` },
          { label: "Referans çarpan", value: `${computed.value.referenceMultiplierMonths.toFixed(0)} ay` },
          { label: "Çarpan farkı", value: `${computed.value.multiplierDeltaMonths.toFixed(2)} ay` },
          { label: "Geri ödeme süresi", value: `${computed.value.paybackYears.toFixed(2)} yıl` },
        ]
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Yatırım Getirisi</Text>
        <Text style={styles.subtitle}>Kira + gider + değer artışı ile toplam yatırım performansı.</Text>

        <ScreenSection title="Girdiler">
          <NumericField
            label="Varlık fiyatı (TL)"
            value={form.propertyPriceTry}
            onChange={(value) => setForm((prev) => ({ ...prev, propertyPriceTry: value }))}
            accessibilityLabel="Yatırım varlık fiyatı"
          />
          <NumericField
            label="Aylık kira (TL)"
            value={form.monthlyRentTry}
            onChange={(value) => setForm((prev) => ({ ...prev, monthlyRentTry: value }))}
            accessibilityLabel="Yatırım aylık kira"
          />
          <NumericField
            label="Yıllık gider (TL)"
            value={form.annualExpensesTry}
            onChange={(value) => setForm((prev) => ({ ...prev, annualExpensesTry: value }))}
            accessibilityLabel="Yatırım yıllık gider"
          />
          <NumericField
            label="Yıllık değer artışı (%)"
            value={form.annualAppreciationPct}
            onChange={(value) => setForm((prev) => ({ ...prev, annualAppreciationPct: value }))}
            accessibilityLabel="Yatırım yıllık değer artışı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Elde tutma süresi (yıl)"
            value={form.holdingYears}
            onChange={(value) => setForm((prev) => ({ ...prev, holdingYears: value }))}
            accessibilityLabel="Yatırım elde tutma yılı"
          />
          <View style={styles.chipRow}>
            <ToggleChip
              label="İstanbul (212 ay)"
              active={form.city === "istanbul"}
              onPress={() => setForm((prev) => ({ ...prev, city: "istanbul" }))}
            />
            <ToggleChip
              label="Türkiye (214 ay)"
              active={form.city === "tr"}
              onPress={() => setForm((prev) => ({ ...prev, city: "tr" }))}
            />
          </View>
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}
        {"value" in computed ? (
          <>
            <ResultCard title="Özet" rows={rows} note="Motor: calculateInvestmentReturns (shared bridge)." testID="investment-summary-card" />
            <ResultCard title="Detay" rows={detailRows} testID="investment-detail-card" />
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
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
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

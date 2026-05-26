import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buildMortgageSummaryRows, computeMortgage, getDefaultMortgageForm } from "./mortgage.logic";
import { formatPercent, formatTl } from "./formatters";
import { NumericField, ResultCard, ScreenSection } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function MortgageScreen() {
  const [form, setForm] = useState(getDefaultMortgageForm());

  const debouncedForm = useDebouncedValue(form, 320);
  const computed = useMemo(() => computeMortgage(debouncedForm), [debouncedForm]);

  const rows =
    "value" in computed
      ? buildMortgageSummaryRows(computed.value.result).map((row) => ({
          label: row.label,
          value: row.label.includes("(%)") ? formatPercent(row.value) : formatTl(row.value),
        }))
      : [];

  const principalDisplay = "value" in computed ? formatTl(computed.value.principalTry) : "—";
  const firstInstallments =
    "value" in computed
      ? computed.value.result.schedule.slice(0, 3).map((item) => ({
          label: `${item.month}. ay`,
          value: `${formatTl(item.installmentTry)} (${formatTl(item.interestPaidTry)} faiz)`,
        }))
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mortgage Hesaplayıcı</Text>
        <Text style={styles.subtitle}>Anapara, faiz ve vade girdisiyle aylık taksit ve amortisman kırılımı.</Text>

        <ScreenSection title="Girdiler">
          <NumericField
            label="Gayrimenkul fiyatı (TL)"
            value={form.propertyPrice}
            onChange={(value) => setForm((prev) => ({ ...prev, propertyPrice: value }))}
            accessibilityLabel="Mortgage gayrimenkul fiyatı"
          />
          <NumericField
            label="Peşinat (%)"
            value={form.downPaymentPct}
            onChange={(value) => setForm((prev) => ({ ...prev, downPaymentPct: value }))}
            accessibilityLabel="Mortgage peşinat oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Yıllık faiz (%)"
            value={form.annualRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, annualRatePct: value }))}
            accessibilityLabel="Mortgage yıllık faiz oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="Vade (ay)"
            value={form.termMonths}
            onChange={(value) => setForm((prev) => ({ ...prev, termMonths: value }))}
            accessibilityLabel="Mortgage vade ay"
          />
          <Text style={styles.principal}>Anapara: {principalDisplay}</Text>
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}

        {"value" in computed ? (
          <>
            <ResultCard title="Sonuç" rows={rows} testID="mortgage-result-card" />
            <ResultCard
              title="İlk 3 ay amortisman"
              rows={firstInstallments}
              note="Motor çıktısından doğrudan üretilir."
              testID="mortgage-schedule-card"
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 8 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 14 },
  principal: { color: "#cbd5e1", fontSize: 12 },
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

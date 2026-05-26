import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  buildPropertyTaxSummaryRows,
  computePropertyTax,
  getDefaultPropertyTaxForm,
} from "./propertyTax.logic";
import { formatTl } from "./formatters";
import { NumericField, ResultCard, ScreenSection, ToggleChip } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function VergiSimulatoruScreen() {
  const [form, setForm] = useState(getDefaultPropertyTaxForm());
  const debounced = useDebouncedValue(form, 320);
  const computed = useMemo(() => computePropertyTax(debounced), [debounced]);

  const rows =
    "value" in computed
      ? buildPropertyTaxSummaryRows(computed.value).map((row) => ({ label: row.label, value: formatTl(row.value) }))
      : [];

  const extraRows =
    "value" in computed
      ? [
          { label: "Tapu harcı matrahı", value: formatTl(computed.value.deedDutyAssessmentBaseTry) },
          { label: "Alıcı payı", value: formatTl(computed.value.deedDutyBuyerTry) },
          { label: "Satıcı payı", value: formatTl(computed.value.deedDutySellerTry) },
        ]
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Vergi Simülatörü</Text>
        <Text style={styles.subtitle}>Tapu harcı ve değer artış vergisini shared motorla ön hesaplar.</Text>

        <ScreenSection title="İşlem girdileri">
          <NumericField
            label="Alış tutarı (TL)"
            value={form.purchasePriceTry}
            onChange={(value) => setForm((prev) => ({ ...prev, purchasePriceTry: value }))}
            accessibilityLabel="Vergi alış tutarı"
          />
          <NumericField
            label="Satış tutarı (TL)"
            value={form.salePriceTry}
            onChange={(value) => setForm((prev) => ({ ...prev, salePriceTry: value }))}
            accessibilityLabel="Vergi satış tutarı"
          />
          <NumericField
            label="Elde tutma süresi (yıl)"
            value={form.holdingYears}
            onChange={(value) => setForm((prev) => ({ ...prev, holdingYears: value }))}
            accessibilityLabel="Vergi elde tutma yılı"
          />
        </ScreenSection>

        <ScreenSection title="Formül parametreleri">
          <NumericField
            label="2026 resmi matrah (TL)"
            value={form.officialAssessmentTry2026}
            onChange={(value) => setForm((prev) => ({ ...prev, officialAssessmentTry2026: value }))}
            accessibilityLabel="Vergi resmi matrah"
          />
          <NumericField
            label="Döner sermaye katsayısı"
            value={form.revolvingFundCoefficient}
            onChange={(value) => setForm((prev) => ({ ...prev, revolvingFundCoefficient: value }))}
            accessibilityLabel="Vergi döner sermaye katsayısı"
            keyboardType="decimal-pad"
          />

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>6306 muafiyet varsayımı</Text>
            <ToggleChip
              label="Kentsel dönüşüm muaf"
              active={form.isUrbanTransformationExempt6306}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  isUrbanTransformationExempt6306: !prev.isUrbanTransformationExempt6306,
                }))
              }
            />
          </View>
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}

        {"value" in computed ? (
          <>
            <ResultCard title="Özet" rows={rows} testID="tax-summary-card" />
            <ResultCard title="Detay" rows={extraRows} testID="tax-detail-card" />
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
  toggleRow: { gap: 8, marginTop: 4 },
  toggleLabel: { color: "#cbd5e1", fontSize: 12 },
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

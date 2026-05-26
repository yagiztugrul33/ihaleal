import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatPercent, formatTl } from "./formatters";
import {
  buildRealFxReturnRows,
  computeRealFxReturn,
  getDefaultRealFxReturnForm,
} from "./realFxReturn.logic";
import { NumericField, ResultCard, ScreenSection } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function RealFxReturnsScreen() {
  const [form, setForm] = useState(getDefaultRealFxReturnForm());
  const debounced = useDebouncedValue(form, 320);
  const computed = useMemo(() => computeRealFxReturn(debounced), [debounced]);

  const rows =
    "value" in computed
      ? buildRealFxReturnRows(computed.value).map((row) => ({
          label: row.label,
          value: row.label.includes("USD karşılığı") ? formatTl(row.value) : formatPercent(row.value),
        }))
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Döviz / RealFx Getirisi</Text>
        <Text style={styles.subtitle}>Nominal, enflasyon-düzeltilmiş ve USD bazlı performans karşılaştırması.</Text>

        <ScreenSection title="Girdiler">
          <NumericField
            label="Başlangıç tutarı (TL)"
            value={form.initialTry}
            onChange={(value) => setForm((prev) => ({ ...prev, initialTry: value }))}
            accessibilityLabel="RealFx başlangıç tutarı"
          />
          <NumericField
            label="Bitiş tutarı (TL)"
            value={form.finalTry}
            onChange={(value) => setForm((prev) => ({ ...prev, finalTry: value }))}
            accessibilityLabel="RealFx bitiş tutarı"
          />
          <NumericField
            label="Yıllık enflasyon (%)"
            value={form.annualInflationPct}
            onChange={(value) => setForm((prev) => ({ ...prev, annualInflationPct: value }))}
            accessibilityLabel="RealFx enflasyon oranı"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="USD başlangıç kuru"
            value={form.startUsdTry}
            onChange={(value) => setForm((prev) => ({ ...prev, startUsdTry: value }))}
            accessibilityLabel="RealFx USD başlangıç kuru"
            keyboardType="decimal-pad"
          />
          <NumericField
            label="USD bitiş kuru"
            value={form.endUsdTry}
            onChange={(value) => setForm((prev) => ({ ...prev, endUsdTry: value }))}
            accessibilityLabel="RealFx USD bitiş kuru"
            keyboardType="decimal-pad"
          />
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}
        {"value" in computed ? (
          <ResultCard title="Sonuç" rows={rows} note="Motor: calculateRealFxReturn (shared bridge)." testID="realfx-card" />
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

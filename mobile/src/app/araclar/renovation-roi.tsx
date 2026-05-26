import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatPercent, formatTl } from "./formatters";
import {
  buildRenovationRoiRows,
  computeRenovationRoi,
  getDefaultRenovationRoiForm,
} from "./renovationRoi.logic";
import { NumericField, ResultCard, ScreenSection } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function RenovationRoiScreen() {
  const [form, setForm] = useState(getDefaultRenovationRoiForm());
  const debounced = useDebouncedValue(form, 320);
  const computed = useMemo(() => computeRenovationRoi(debounced), [debounced]);

  const rows =
    "value" in computed
      ? buildRenovationRoiRows(computed.value).map((row) => ({
          label: row.label,
          value: row.label === "ROI" ? formatPercent(row.value) : formatTl(row.value),
        }))
      : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Renovasyon ROI</Text>
        <Text style={styles.subtitle}>Tadilat maliyeti ve değer artışı ile yatırım geri dönüş analizi.</Text>

        <ScreenSection title="Girdiler">
          <NumericField
            label="Renovasyon maliyeti (TL)"
            value={form.renovationCostTry}
            onChange={(value) => setForm((prev) => ({ ...prev, renovationCostTry: value }))}
            accessibilityLabel="Renovasyon maliyeti"
          />
          <NumericField
            label="Beklenen değer artışı (TL)"
            value={form.valueIncreaseTry}
            onChange={(value) => setForm((prev) => ({ ...prev, valueIncreaseTry: value }))}
            accessibilityLabel="Renovasyon değer artışı"
          />
        </ScreenSection>

        {"error" in computed ? <Text style={styles.error}>{computed.error}</Text> : null}
        {"value" in computed ? (
          <ResultCard
            title="Sonuç"
            rows={rows}
            note="Motor: calculateRenovationRoi (shared bridge)."
            testID="renovation-roi-card"
          />
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

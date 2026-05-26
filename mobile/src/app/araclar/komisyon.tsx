import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getDefaultCommissionForm, validateCommissionForm } from "./commission.logic";
import { NumericField, ScreenSection } from "./ui";
import { useDebouncedValue } from "./useDebouncedValue";

export default function KomisyonScreen() {
  const [form, setForm] = useState(getDefaultCommissionForm());
  const debounced = useDebouncedValue(form, 320);
  const validationError = useMemo(() => validateCommissionForm(debounced), [debounced]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Komisyon Hesaplayıcı</Text>
        <Text style={styles.subtitle}>
          Gerçek platform komisyon motoru `src/lib/fees.ts` + `calcCommissionBreakdown(...)` hattında. Bu motor
          `mobile/shared` köprüsünde expose edilmediği için bu ekran önizleme modunda.
        </Text>

        <ScreenSection title="Önizleme girdileri">
          <NumericField
            label="Satış / işlem tutarı (TL)"
            value={form.saleAmountTry}
            onChange={(value) => setForm((prev) => ({ ...prev, saleAmountTry: value }))}
            accessibilityLabel="Komisyon işlem tutarı"
          />
          <NumericField
            label="Yıllık üyelik mahsubu (TL)"
            value={form.membershipOffsetTry}
            onChange={(value) => setForm((prev) => ({ ...prev, membershipOffsetTry: value }))}
            accessibilityLabel="Komisyon üyelik mahsubu"
          />
          <NumericField
            label="Hizmet bedeli mahsubu (TL)"
            value={form.serviceOffsetTry}
            onChange={(value) => setForm((prev) => ({ ...prev, serviceOffsetTry: value }))}
            accessibilityLabel="Komisyon hizmet mahsubu"
          />
          <NumericField
            label="B2B emlakçı oranı (%)"
            value={form.agentRatePct}
            onChange={(value) => setForm((prev) => ({ ...prev, agentRatePct: value }))}
            accessibilityLabel="Komisyon B2B oranı"
            keyboardType="decimal-pad"
          />
        </ScreenSection>

        {validationError ? <Text style={styles.error}>{validationError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Komisyon hesapla devre dışı"
          disabled
          style={styles.disabledButton}>
          <Text style={styles.disabledButtonText}>Gerçek komisyon motoru bağlanana kadar devre dışı</Text>
        </Pressable>

        <Text style={styles.note}>
          Not: Web’de `/komisyon-hesaplayici` `calcCommissionBreakdown(...)` + `src/lib/commission/*` motorunu kullanır.
          Mobil köprüye eklenmeden bu ekranda sonuç üretilmez.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 14 },
  disabledButton: {
    borderWidth: 1,
    borderColor: "#475569",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    opacity: 0.8,
  },
  disabledButtonText: { color: "#cbd5e1", fontSize: 13, fontWeight: "600", textAlign: "center" },
  note: { color: "#94a3b8", fontSize: 12, marginBottom: 10 },
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

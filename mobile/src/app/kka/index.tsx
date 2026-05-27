import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getDefaultKkaInput, validateKkaInput } from "./model";

export default function KkaScreen() {
  const [form, setForm] = useState(getDefaultKkaInput());
  const error = useMemo(() => validateKkaInput(form), [form]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>KKA / Kat Karşılığı Arsa</Text>
        <Text style={styles.subtitle}>
          KKA motoru mobile/shared köprüsünde bulunamadığı için ekran preview modunda.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Arsa değeri (TL)</Text>
          <TextInput
            style={styles.input}
            value={form.parcelValueTry}
            onChangeText={(v) => setForm((p) => ({ ...p, parcelValueTry: v }))}
            keyboardType="numeric"
            accessibilityLabel="KKA arsa değeri"
          />
          <Text style={styles.label}>Kat karşılığı payı (%)</Text>
          <TextInput
            style={styles.input}
            value={form.shareRatioPct}
            onChangeText={(v) => setForm((p) => ({ ...p, shareRatioPct: v }))}
            keyboardType="decimal-pad"
            accessibilityLabel="KKA pay oranı"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.disabledBtn} disabled accessibilityLabel="KKA hesap disabled">
            <Text style={styles.disabledText}>KKA çekirdek motoru bağlanana kadar hesaplama devre dışı</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 8 },
  label: { color: "#cbd5e1", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    backgroundColor: "#020617",
    color: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  error: { color: "#fecaca", fontSize: 12 },
  disabledBtn: { borderRadius: 10, backgroundColor: "#1e293b", padding: 10, marginTop: 4, opacity: 0.8 },
  disabledText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700", textAlign: "center" },
});

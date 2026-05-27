import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getBridgeSignal, getDepremMockRows, type DepremRiskRow } from "./model";

export default function DepremModulScreen() {
  const [rows, setRows] = useState<DepremRiskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);
  const bridge = getBridgeSignal();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      if (forceError) throw new Error("Mock error");
      setRows(getDepremMockRows());
    } catch {
      setRows([]);
      setError("Deprem risk verisi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceError]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Modül / Deprem Risk</Text>
        <Text style={styles.subtitle}>
          Bilgi/sorgu ekranı. parked `src/features/earthquake` modülünden bağımsız çalışır.
        </Text>
        <Text style={styles.bridgeNote}>
          locationIntelligence bridge: {bridge.bridgeActive ? `aktif (${bridge.exportCount} export)` : "pasif"}
        </Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="Deprem sorgusunu yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityLabel="Deprem hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <StateCard title="Yükleniyor" detail="Deprem risk verisi hazırlanıyor..." /> : null}
        {!loading && error ? <StateCard title="Hata" detail={error} /> : null}
        {!loading && !error && rows.length === 0 ? <StateCard title="Boş" detail="Gösterilecek risk verisi yok." /> : null}

        {!loading &&
          !error &&
          rows.map((row) => (
            <View key={row.id} style={styles.card}>
              <Text style={styles.region}>{row.region}</Text>
              <Text style={styles.meta}>Risk skoru: {row.riskScore}/100</Text>
              <Text style={styles.meta}>Seviye: {row.level}</Text>
              <Text style={styles.meta}>Son olay: {row.lastEvent}</Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StateCard({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13 },
  bridgeNote: { color: "#93c5fd", fontSize: 12 },
  controls: { flexDirection: "row", gap: 8 },
  btn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 8 },
  warnBtn: { backgroundColor: "#b45309" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stateCard: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, padding: 12, backgroundColor: "#0f172a" },
  stateTitle: { color: "#f8fafc", fontWeight: "700" },
  stateDetail: { color: "#cbd5e1", fontSize: 12, marginTop: 2 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 4 },
  region: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  meta: { color: "#cbd5e1", fontSize: 12 },
});

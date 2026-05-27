import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { fetchBorsaAssets } from "./data";
import { formatPercent, formatTl } from "./helpers";
import type { WatchlistItem } from "./types";

export default function BorsaIzlemeScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBorsaAssets(forceError);
      setRows(data.map((asset, idx) => ({ ...asset, watching: idx < 3 })));
    } catch {
      setRows([]);
      setError("İzleme listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchBorsaAssets(forceError);
        if (!cancelled) {
          setRows(data.map((asset, idx) => ({ ...asset, watching: idx < 3 })));
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("İzleme listesi yüklenemedi.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  const watchingCount = useMemo(() => rows.filter((r) => r.watching).length, [rows]);

  const toggleWatch = (id: string) => {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, watching: !item.watching } : item)));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Borsa / İzleme</Text>
        <Text style={styles.subtitle}>Takip edilen varlıklar: {watchingCount}</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="İzleme listesini yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityLabel="İzleme hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <StateCard title="Yükleniyor" detail="Varlıklar hazırlanıyor..." /> : null}
        {!loading && error ? <StateCard title="Hata" detail={error} /> : null}
        {!loading && !error && rows.length === 0 ? <StateCard title="Boş" detail="İzleme listesi boş." /> : null}

        {!loading &&
          !error &&
          rows.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={[styles.change, item.changePct >= 0 ? styles.up : styles.down]}>{formatPercent(item.changePct)}</Text>
              </View>
              <Text style={styles.property}>{item.property}</Text>
              <Text style={styles.price}>{formatTl(item.price)}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => router.push(`/ilan/${item.id}`)}
                  accessibilityLabel={`${item.property} detayına git`}>
                  <Text style={styles.linkText}>Detaya Git</Text>
                </Pressable>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => toggleWatch(item.id)}
                  accessibilityLabel={`${item.property} izleme durumunu değiştir`}>
                  <Text style={styles.linkText}>{item.watching ? "Çıkar" : "Ekle"}</Text>
                </Pressable>
              </View>
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
  controls: { flexDirection: "row", gap: 8 },
  btn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 8 },
  warnBtn: { backgroundColor: "#b45309" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stateCard: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, padding: 12, backgroundColor: "#0f172a" },
  stateTitle: { color: "#f8fafc", fontWeight: "700" },
  stateDetail: { color: "#cbd5e1", fontSize: 12, marginTop: 2 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, padding: 12, gap: 6, backgroundColor: "#0f172a" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { color: "#bfdbfe", fontSize: 12, fontWeight: "700" },
  change: { fontSize: 12, fontWeight: "700" },
  up: { color: "#34d399" },
  down: { color: "#f87171" },
  property: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  price: { color: "#dbeafe", fontSize: 13, fontWeight: "700" },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  linkBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  linkText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
});

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { buildSnapshotFromAssets, fetchBorsaAssets, readAutoBidRules, readPriceAlerts } from "./data";
import { formatPercent, formatTl, marketTrendLabel, sortAssets } from "./helpers";
import type { DataSort } from "./types";

export default function BorsaVeriScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<ReturnType<typeof sortAssets>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);
  const [sort, setSort] = useState<DataSort>("changeDesc");
  const [ruleCount, setRuleCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBorsaAssets(forceError);
      setRows(sortAssets(data, sort));
      setRuleCount(readAutoBidRules().filter((item) => item.enabled).length);
      setAlertCount(readPriceAlerts().filter((item) => item.enabled).length);
    } catch {
      setRows([]);
      setError("Piyasa verisi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError, sort]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchBorsaAssets(forceError);
        if (!cancelled) {
          setRows(sortAssets(data, sort));
          setRuleCount(readAutoBidRules().filter((item) => item.enabled).length);
          setAlertCount(readPriceAlerts().filter((item) => item.enabled).length);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Piyasa verisi yüklenemedi.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError, sort]);

  const snapshot = useMemo(() => buildSnapshotFromAssets(rows), [rows]);
  const totalVolume = useMemo(() => rows.reduce((sum, item) => sum + item.volume, 0), [rows]);
  const snapshotFieldCount = useMemo(
    () => Object.keys(snapshot as Record<string, unknown>).length,
    [snapshot],
  );
  const avgChange = useMemo(() => {
    if (!rows.length) return 0;
    return rows.reduce((acc, item) => acc + item.changePct, 0) / rows.length;
  }, [rows]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Borsa / Veri</Text>
        <Text style={styles.subtitle}>Endeks, trend ve alarm/otomatik teklif özeti (mock).</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="Veri ekranını yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityLabel="Veri hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        <View style={styles.controls}>
          <Pressable style={styles.sortBtn} onPress={() => setSort("changeDesc")} accessibilityLabel="Değişime göre sırala">
            <Text style={styles.sortText}>Değişim</Text>
          </Pressable>
          <Pressable style={styles.sortBtn} onPress={() => setSort("volumeDesc")} accessibilityLabel="Hacme göre sırala">
            <Text style={styles.sortText}>Hacim</Text>
          </Pressable>
          <Pressable style={styles.sortBtn} onPress={() => setSort("priceDesc")} accessibilityLabel="Fiyata göre sırala">
            <Text style={styles.sortText}>Fiyat</Text>
          </Pressable>
        </View>

        {loading ? <FeedbackStateCard title="Yükleniyor" detail="Piyasa verisi hazırlanıyor..." /> : null}
        {!loading && error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}
        {!loading && !error && rows.length === 0 ? <FeedbackStateCard title="Boş" detail="Gösterilecek veri yok." variant="empty" /> : null}

        {!loading && !error && rows.length > 0 ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Endeks Özeti</Text>
            <Text style={styles.summaryText}>Toplam varlık: {rows.length}</Text>
            <Text style={styles.summaryText}>Toplam hacim: {totalVolume.toLocaleString("tr-TR")}</Text>
            <Text style={styles.summaryText}>Ortalama değişim: {formatPercent(avgChange)}</Text>
            <Text style={styles.summaryText}>Trend: {marketTrendLabel(avgChange)}</Text>
            <Text style={styles.summaryText}>Snapshot alan sayısı: {snapshotFieldCount}</Text>
            <Text style={styles.summaryText}>Aktif fiyat alarmı: {alertCount}</Text>
            <Text style={styles.summaryText}>Aktif otomatik teklif kuralı: {ruleCount}</Text>
          </View>
        ) : null}

        {!loading &&
          !error &&
          rows.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/ilan/${item.id}`)}
              accessibilityLabel={`${item.property} detayına git`}>
              <View style={styles.rowBetween}>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={[styles.change, item.changePct >= 0 ? styles.up : styles.down]}>{formatPercent(item.changePct)}</Text>
              </View>
              <Text style={styles.property}>{item.property}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>Fiyat: {formatTl(item.price)}</Text>
                <Text style={styles.meta}>Hacim: {item.volume.toLocaleString("tr-TR")}</Text>
              </View>
            </Pressable>
          ))}
        <FeedbackStateCard
          title="Çekirdek Bekleyen Kısım"
          detail="Gerçek veri/endeks için gerekli API: lisanslı canlı fiyat feedi + event stream + server-side index hesaplama."
          variant="empty"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13 },
  controls: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 8 },
  warnBtn: { backgroundColor: "#b45309" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sortBtn: { borderRadius: 10, backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155", paddingHorizontal: 10, paddingVertical: 8 },
  sortText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  summary: { borderWidth: 1, borderColor: "#1e3a8a", borderRadius: 12, padding: 12, gap: 4, backgroundColor: "#0b1220" },
  summaryTitle: { color: "#dbeafe", fontSize: 14, fontWeight: "700" },
  summaryText: { color: "#cbd5e1", fontSize: 12 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, padding: 12, gap: 6, backgroundColor: "#0f172a" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  code: { color: "#bfdbfe", fontSize: 12, fontWeight: "700" },
  change: { fontSize: 12, fontWeight: "700" },
  up: { color: "#34d399" },
  down: { color: "#f87171" },
  property: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  meta: { color: "#cbd5e1", fontSize: 12 },
});

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { createPriceAlert, fetchBorsaAssets, readPriceAlerts, readWatchlistIds, toggleWatchlistAsset } from "./data";
import { formatPercent, formatTl } from "./helpers";
import type { WatchlistItem } from "./types";

export default function BorsaIzlemeScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBorsaAssets(forceError);
      const watchlist = readWatchlistIds();
      setRows(data.map((asset) => ({ ...asset, watching: watchlist.includes(asset.id) })));
      setAlertCount(readPriceAlerts().filter((item) => item.enabled).length);
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
          const watchlist = readWatchlistIds();
          setRows(data.map((asset) => ({ ...asset, watching: watchlist.includes(asset.id) })));
          setAlertCount(readPriceAlerts().filter((item) => item.enabled).length);
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
    const nextWatchlist = toggleWatchlistAsset(id);
    setRows((prev) => prev.map((item) => ({ ...item, watching: nextWatchlist.includes(item.id) })));
  };

  const createQuickAlert = (id: string, currentPrice: number) => {
    createPriceAlert({
      assetId: id,
      direction: "above",
      targetPrice: Math.round(currentPrice * 1.02),
    });
    setAlertCount(readPriceAlerts().filter((item) => item.enabled).length);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Borsa / İzleme</Text>
        <Text style={styles.subtitle}>Takip edilen varlıklar: {watchingCount} · Aktif alarm: {alertCount}</Text>

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

        {loading ? <FeedbackStateCard title="Yükleniyor" detail="Varlıklar hazırlanıyor..." /> : null}
        {!loading && error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}
        {!loading && !error && rows.length === 0 ? <FeedbackStateCard title="Boş" detail="İzleme listesi boş." variant="empty" /> : null}

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
                  onPress={() => createQuickAlert(item.id, item.price)}
                  accessibilityLabel={`${item.property} için hızlı alarm oluştur`}>
                  <Text style={styles.linkText}>Alarm +2%</Text>
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
        <FeedbackStateCard
          title="Çekirdek Bekleyen Kısım"
          detail="Gerçek izleme/alarm için gerekli API: watchlist tablosu + notification delivery + user preference kaydı."
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
  controls: { flexDirection: "row", gap: 8 },
  btn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 8 },
  warnBtn: { backgroundColor: "#b45309" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
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

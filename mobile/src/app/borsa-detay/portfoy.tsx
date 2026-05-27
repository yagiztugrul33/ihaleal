import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { fetchBorsaAssets, readPortfolioPositions } from "./data";
import { formatPercent, formatTl } from "./helpers";

export default function BorsaPortfoyScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);
  const [rows, setRows] = useState<
    {
      assetId: string;
      code: string;
      units: number;
      avgBuyPrice: number;
      currentPrice: number;
      currentValue: number;
      pnl: number;
      pnlPct: number;
      segment: string;
    }[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assets, positions] = await Promise.all([fetchBorsaAssets(forceError), Promise.resolve(readPortfolioPositions())]);
      const next = positions
        .map((position) => {
          const asset = assets.find((item) => item.id === position.assetId);
          if (!asset) return null;
          const label = asset.property ?? asset.code;
          const currentValue = asset.price * position.units;
          const cost = position.avgBuyPrice * position.units;
          const pnl = currentValue - cost;
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
          return {
            assetId: position.assetId,
            code: asset.code,
            units: position.units,
            avgBuyPrice: position.avgBuyPrice,
            currentPrice: asset.price,
            currentValue,
            pnl,
            pnlPct,
            segment: label.toLocaleLowerCase("tr-TR").includes("arsa")
              ? "arsa"
              : label.toLocaleLowerCase("tr-TR").includes("otel")
                ? "turizm"
                : label.toLocaleLowerCase("tr-TR").includes("ofis")
                  ? "ticari"
                  : "konut",
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      setRows(next);
    } catch {
      setRows([]);
      setError("Portföy verisi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [assets, positions] = await Promise.all([fetchBorsaAssets(forceError), Promise.resolve(readPortfolioPositions())]);
        const next = positions
          .map((position) => {
            const asset = assets.find((item) => item.id === position.assetId);
            if (!asset) return null;
            const label = asset.property ?? asset.code;
            const currentValue = asset.price * position.units;
            const cost = position.avgBuyPrice * position.units;
            const pnl = currentValue - cost;
            const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
            return {
              assetId: position.assetId,
              code: asset.code,
              units: position.units,
              avgBuyPrice: position.avgBuyPrice,
              currentPrice: asset.price,
              currentValue,
              pnl,
              pnlPct,
              segment: label.toLocaleLowerCase("tr-TR").includes("arsa")
                ? "arsa"
                : label.toLocaleLowerCase("tr-TR").includes("otel")
                  ? "turizm"
                  : label.toLocaleLowerCase("tr-TR").includes("ofis")
                    ? "ticari"
                    : "konut",
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));
        if (!cancelled) {
          setRows(next);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Portföy verisi yüklenemedi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  const totals = useMemo(() => {
    const invested = rows.reduce((acc, row) => acc + row.avgBuyPrice * row.units, 0);
    const current = rows.reduce((acc, row) => acc + row.currentValue, 0);
    const pnl = current - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { invested, current, pnl, pnlPct };
  }, [rows]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Borsa / Portföy</Text>
        <Text style={styles.subtitle}>Mock pozisyonlar ile PnL ve segment dağılımı (sadece ön-izleme).</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="Portföy ekranını yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => setForceError((prev) => !prev)}
            accessibilityLabel="Portföy hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <FeedbackStateCard title="Yükleniyor" detail="Portföy hazırlanıyor..." /> : null}
        {!loading && error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}
        {!loading && !error && rows.length === 0 ? <FeedbackStateCard title="Boş" detail="Gösterilecek portföy kaydı yok." variant="empty" /> : null}

        {!loading && !error && rows.length > 0 ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Portföy Özeti</Text>
            <Text style={styles.summaryText}>Yatırılan: {formatTl(totals.invested)}</Text>
            <Text style={styles.summaryText}>Güncel Değer: {formatTl(totals.current)}</Text>
            <Text style={[styles.summaryText, totals.pnl >= 0 ? styles.up : styles.down]}>
              PnL: {totals.pnl >= 0 ? "+" : ""}
              {formatTl(totals.pnl)} ({formatPercent(totals.pnlPct)})
            </Text>
          </View>
        ) : null}

        {!loading &&
          !error &&
          rows.map((row) => (
            <View key={row.assetId} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.code}>{row.code}</Text>
                <Text style={[styles.pnl, row.pnl >= 0 ? styles.up : styles.down]}>
                  {row.pnl >= 0 ? "+" : ""}
                  {formatPercent(row.pnlPct)}
                </Text>
              </View>
              <Text style={styles.meta}>Adet: {row.units.toLocaleString("tr-TR")} · Segment: {row.segment.toUpperCase()}</Text>
              <Text style={styles.meta}>Maliyet: {formatTl(row.avgBuyPrice)} · Güncel: {formatTl(row.currentPrice)}</Text>
              <Text style={styles.value}>Pozisyon Değeri: {formatTl(row.currentValue)}</Text>
            </View>
          ))}

        <FeedbackStateCard
          title="Çekirdek Veri Gereksinimi"
          detail="Gerçek portföy için gerekenler: kullanıcı portföy tablosu + işlem geçmişi + vergi/komisyon mutabakat servisi."
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
  summary: { borderWidth: 1, borderColor: "#1e3a8a", borderRadius: 12, padding: 12, gap: 4, backgroundColor: "#0b1220" },
  summaryTitle: { color: "#dbeafe", fontSize: 14, fontWeight: "700" },
  summaryText: { color: "#cbd5e1", fontSize: 12 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { color: "#bfdbfe", fontSize: 13, fontWeight: "700" },
  pnl: { fontSize: 12, fontWeight: "700" },
  meta: { color: "#cbd5e1", fontSize: 12 },
  value: { color: "#f8fafc", fontSize: 13, fontWeight: "700" },
  up: { color: "#34d399" },
  down: { color: "#f87171" },
});

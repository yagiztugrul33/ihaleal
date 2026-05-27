import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { fetchMockFavorites, type FavoriteItem } from "./data";
import { formatTl } from "./helpers";
import { FeedbackStateCard } from "@/components/FeedbackStateCard";

export default function FavorilerScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMockFavorites(forceError);
      setRows(data);
    } catch {
      setRows([]);
      setError("Favoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMockFavorites(forceError);
        if (!cancelled) {
          setRows(data);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Favoriler yüklenemedi.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  const removeFavorite = (id: string) => {
    setRows((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Favoriler</Text>
        <Text style={styles.subtitle}>Kaydedilen ilan/ihale kartlarını yönet.</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityRole="button" accessibilityLabel="Favorileri yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel="Favori hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <FeedbackStateCard title="Yükleniyor" detail="Favoriler hazırlanıyor..." variant="info" /> : null}
        {!loading && error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}
        {!loading && !error && rows.length === 0 ? <FeedbackStateCard title="Boş" detail="Favori listeniz boş." variant="empty" /> : null}

        {!loading &&
          !error &&
          rows.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.badge}>{item.source === "ihale" ? "İhale" : "İlan"}</Text>
                <Text style={styles.price}>{formatTl(item.priceTry)}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.city} / {item.district}
              </Text>
              <Text style={styles.meta}>Tahmini değer: {formatTl(item.estimatedValueTry)}</Text>

              <View style={styles.actions}>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => router.push(`/ihale/${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title} detayına git`}>
                  <Text style={styles.linkText}>Detaya Git</Text>
                </Pressable>
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => removeFavorite(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title} favoriden kaldır`}>
                  <Text style={styles.removeText}>Kaldır</Text>
                </Pressable>
              </View>
            </View>
          ))}
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
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  badge: { color: "#bfdbfe", fontSize: 11, fontWeight: "700" },
  price: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
  cardTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  meta: { color: "#cbd5e1", fontSize: 12 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  linkBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  linkText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
  removeBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  removeText: { color: "#fca5a5", fontSize: 12, fontWeight: "700" },
});

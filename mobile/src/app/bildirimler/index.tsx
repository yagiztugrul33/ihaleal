import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchMockNotifications } from "./data";
import { formatDateTime, notificationBadgeLabel } from "./helpers";
import type { NotificationItem } from "./types";

export default function BildirimlerScreen() {
  const [rows, setRows] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMockNotifications(forceError);
      setRows(data);
    } catch {
      setRows([]);
      setError("Bildirimler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMockNotifications(forceError);
        if (!cancelled) {
          setRows(data);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Bildirimler yüklenemedi.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  const toggleRead = (id: string) => {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item)));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Bildirimler</Text>
        <Text style={styles.subtitle}>Okundu/okunmadı durumlarını listeleyin.</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="Bildirimleri yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityLabel="Hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <StateCard title="Yükleniyor" detail="Bildirimler hazırlanıyor..." /> : null}
        {!loading && error ? <StateCard title="Hata" detail={error} /> : null}
        {!loading && !error && rows.length === 0 ? <StateCard title="Boş" detail="Henüz bildiriminiz yok." /> : null}

        {!loading &&
          !error &&
          rows.map((item) => (
            <View key={item.id} style={[styles.card, item.read ? styles.cardRead : styles.cardUnread]}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.badge}>{notificationBadgeLabel(item.type)}</Text>
              </View>
              <Text style={styles.cardBody}>{item.body}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.meta}>{formatDateTime(item.createdAtIso)}</Text>
                <Pressable
                  onPress={() => toggleRead(item.id)}
                  accessibilityLabel={`${item.title} okundu durumunu değiştir`}
                  style={styles.linkBtn}>
                  <Text style={styles.linkText}>{item.read ? "Okunmadı yap" : "Okundu yap"}</Text>
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
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  cardRead: { borderColor: "#334155", backgroundColor: "#0f172a" },
  cardUnread: { borderColor: "#1d4ed8", backgroundColor: "#0b1220" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700", flex: 1 },
  badge: { color: "#bfdbfe", fontSize: 11, fontWeight: "700" },
  cardBody: { color: "#cbd5e1", fontSize: 12 },
  meta: { color: "#94a3b8", fontSize: 11 },
  linkBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  linkText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
});

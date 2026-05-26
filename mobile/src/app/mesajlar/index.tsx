import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchMockConversations } from "./data";
import { formatConversationDate } from "./helpers";
import type { ConversationItem } from "./types";

export default function MesajlarScreen() {
  const [rows, setRows] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMockConversations(forceError);
      setRows(data);
    } catch {
      setRows([]);
      setError("Konuşmalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMockConversations(forceError);
        if (!cancelled) {
          setRows(data);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Konuşmalar yüklenemedi.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mesajlar</Text>
        <Text style={styles.subtitle}>Konuşma listesi ve okunmamış sayaçları.</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="Mesaj listesini yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityLabel="Mesaj hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <StateCard title="Yükleniyor" detail="Konuşmalar hazırlanıyor..." /> : null}
        {!loading && error ? <StateCard title="Hata" detail={error} /> : null}
        {!loading && !error && rows.length === 0 ? <StateCard title="Boş" detail="Henüz mesajınız yok." /> : null}

        {!loading &&
          !error &&
          rows.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.participant}</Text>
                {item.unreadCount > 0 ? (
                  <View style={styles.unreadBubble}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              <Text style={styles.meta}>{formatConversationDate(item.updatedAtIso)}</Text>
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
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700", flex: 1 },
  unreadBubble: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  lastMessage: { color: "#cbd5e1", fontSize: 12 },
  meta: { color: "#94a3b8", fontSize: 11 },
});

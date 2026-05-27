import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchMockDocuments } from "./data";
import { docTypeLabel, formatDate, formatDocumentSize } from "./helpers";
import type { DocumentItem } from "./types";
import { FeedbackStateCard } from "@/components/FeedbackStateCard";

export default function BelgelerScreen() {
  const [rows, setRows] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMockDocuments(forceError);
      setRows(data);
    } catch {
      setRows([]);
      setError("Belge listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchMockDocuments(forceError);
        if (!cancelled) {
          setRows(data);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Belge listesi yüklenemedi.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  const onView = (name: string) => Alert.alert("Belge Görüntüle", `${name} için önizleme yakında eklenecek.`);
  const onDownload = (name: string) => Alert.alert("Belge İndir", `${name} indirme akışı placeholder durumunda.`);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Belgeler</Text>
        <Text style={styles.subtitle}>Belge listesi ve görüntüle/indir placeholder aksiyonları.</Text>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityRole="button" accessibilityLabel="Belgeleri yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel="Belge hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <FeedbackStateCard title="Yükleniyor" detail="Belgeler hazırlanıyor..." variant="info" /> : null}
        {!loading && error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}
        {!loading && !error && rows.length === 0 ? <FeedbackStateCard title="Boş" detail="Henüz belgeniz yok." variant="empty" /> : null}

        {!loading &&
          !error &&
          rows.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.badge}>{docTypeLabel(item.type)}</Text>
              </View>
              <Text style={styles.meta}>
                {formatDate(item.createdAtIso)} · {formatDocumentSize(item.sizeKb)}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => onView(item.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} görüntüle`}>
                  <Text style={styles.linkText}>Görüntüle</Text>
                </Pressable>
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => onDownload(item.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} indir`}>
                  <Text style={styles.linkText}>İndir</Text>
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
  cardTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700", flex: 1 },
  badge: { color: "#bfdbfe", fontSize: 11, fontWeight: "700" },
  meta: { color: "#cbd5e1", fontSize: 12 },
  actions: { flexDirection: "row", gap: 10 },
  linkBtn: { paddingVertical: 4, paddingHorizontal: 6 },
  linkText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
});

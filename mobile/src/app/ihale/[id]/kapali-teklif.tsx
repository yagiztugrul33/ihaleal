import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";

export default function IhaleKapaliTeklifScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [sealedBid, setSealedBid] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const rankingPreview = useMemo(() => {
    const parsed = Number(sealedBid.replace(/[^\d]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return [];
    return [
      { label: "Sizin teklifiniz", value: parsed },
      { label: "Rakip 1", value: Math.max(1, parsed - 120_000) },
      { label: "Rakip 2", value: Math.max(1, parsed - 260_000) },
    ].sort((a, b) => b.value - a.value);
  }, [sealedBid]);

  const onSubmit = () => {
    if (!rankingPreview.length) {
      setStatus("Geçerli kapalı teklif tutarı girin.");
      return;
    }
    setStatus("Kapalı teklif şifrelendi olarak işaretlendi (mock).");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Kapalı Teklif" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Kapalı Teklif (Mobil)</Text>
        <Text style={styles.subtitle}>İhale: {id ?? "bilinmiyor"} · Sıralama yalnız istemci ön-izleme üretir.</Text>
        <View style={styles.previewBanner}>
          <Text style={styles.previewText}>
            {"\u26A0"} Bu özellik henüz ön-izlemededir. Kapalı teklif backend hazır olduğunda etkinleşecek. Şu an
            gönderdiğiniz teklif sadece UI test amaçlı kaydedilir, sunucuya iletilmez.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Kapalı Teklif Tutarı (TL)</Text>
          <TextInput
            value={sealedBid}
            onChangeText={setSealedBid}
            keyboardType="number-pad"
            placeholder="örn. 7.000.000"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            accessibilityLabel="Kapalı teklif tutarı"
          />
          <Pressable style={styles.primaryBtn} onPress={onSubmit} accessibilityRole="button" accessibilityLabel="Kapalı teklifi gönder">
            <Text style={styles.primaryText}>Kapalı Teklifi Gönder (mock)</Text>
          </Pressable>
        </View>

        {!rankingPreview.length ? (
          <FeedbackStateCard title="Ön-izleme" detail="Tutara göre sıralama ön-izlemesi burada oluşur." />
        ) : (
          <View style={styles.rankCard}>
            <Text style={styles.rankTitle}>Sıralama Ön-izleme</Text>
            {rankingPreview.map((row) => (
              <Text key={row.label} style={styles.rankItem}>
                {row.label}: {new Intl.NumberFormat("tr-TR").format(row.value)} TL
              </Text>
            ))}
          </View>
        )}

        {status ? <FeedbackStateCard title="Durum" detail={status} variant={status.includes("Geçerli") ? "error" : "info"} /> : null}
        <FeedbackStateCard
          title="Gerekli Çekirdek API"
          detail="Şifreli kapalı teklif depolama + süre sonu açılış + server-side ranking + audit trail."
          variant="empty"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 12 },
  previewBanner: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffc107",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  previewText: { color: "#856404", fontSize: 13, lineHeight: 18 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 8 },
  label: { color: "#cbd5e1", fontSize: 12 },
  input: { borderWidth: 1, borderColor: "#475569", borderRadius: 10, backgroundColor: "#111827", color: "#f8fafc", paddingHorizontal: 10, paddingVertical: 10 },
  primaryBtn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 10 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
  rankCard: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 6 },
  rankTitle: { color: "#f8fafc", fontSize: 13, fontWeight: "700" },
  rankItem: { color: "#cbd5e1", fontSize: 12 },
});

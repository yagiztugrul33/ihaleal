import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";

const CITY_GUIDES = [
  { city: "İstanbul", note: "Likidite yüksek, deprem risk katmanı mutlaka filtrelenmeli." },
  { city: "İzmir", note: "Kıyı + dönüşüm bölgelerinde imar ve sigorta uyumu önemli." },
  { city: "Ankara", note: "Ticari ofis ve konut segmentlerinde farklı teklif temposu." },
  { city: "Bursa", note: "Sanayi etkili karma portföy; değerleme ve dönüşüm birlikte okunmalı." },
] as const;

export default function SehirlerScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Şehir Rehberi (Mobil)</Text>
        <Text style={styles.subtitle}>Web’deki şehir rehberi akışı için mobil mock ön-izleme.</Text>

        {CITY_GUIDES.map((item) => (
          <View key={item.city} style={styles.card} accessibilityRole="summary">
            <Text style={styles.cardTitle}>{item.city}</Text>
            <Text style={styles.cardNote}>{item.note}</Text>
          </View>
        ))}

        <FeedbackStateCard
          title="Gerekli Çekirdek API"
          detail="Şehir bazlı canlı ilan toplulaştırma + risk/likidite metrik endpoint'i."
          variant="empty"
        />

        <Link href="/icerik/rehber" asChild>
          <Pressable style={styles.linkBtn} accessibilityRole="button" accessibilityLabel="Web rehber içerik ekranını aç">
            <Text style={styles.linkText}>Rehber İçeriğine Git</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 12 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 4 },
  cardTitle: { color: "#f8fafc", fontSize: 15, fontWeight: "700" },
  cardNote: { color: "#cbd5e1", fontSize: 12 },
  linkBtn: { borderRadius: 10, borderWidth: 1, borderColor: "#334155", backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 10 },
  linkText: { color: "#bfdbfe", fontSize: 13, fontWeight: "700", textAlign: "center" },
});

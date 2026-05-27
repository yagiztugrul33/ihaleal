import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";

export default function IhaleHemenAlScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onMockBuyNow = () => {
    if (!confirmed) {
      setStatus("Hemen Al için sözleşme/KVKK onayı zorunlu.");
      return;
    }
    setStatus("Hemen Al ön-akışı kaydedildi (mock).");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Hemen Al" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Hemen Al (Mobil Ön-izleme)</Text>
        <Text style={styles.subtitle}>İhale: {id ?? "bilinmiyor"} · Atomik satın alma akışı çekirdek API bekliyor.</Text>

        <View style={styles.card}>
          <Text style={styles.row}>1) KYC durumu kontrol edilir.</Text>
          <Text style={styles.row}>2) Kart blokajı / teminat doğrulaması yapılır.</Text>
          <Text style={styles.row}>3) `execute_buy_now` ile tek transaction kapanışı yapılır.</Text>
          <Pressable
            onPress={() => setConfirmed((prev) => !prev)}
            style={[styles.checkbox, confirmed ? styles.checkboxOn : undefined]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            accessibilityLabel="Hemen al onay kutusu">
            <Text style={styles.checkboxIcon}>{confirmed ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>KVKK + ihale koşullarını okudum, mock Hemen Al ön-akışını onaylıyorum.</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={onMockBuyNow} accessibilityRole="button" accessibilityLabel="Hemen al ön akışı başlat">
            <Text style={styles.primaryText}>Hemen Al Ön-akışı Başlat (mock)</Text>
          </Pressable>
        </View>

        {status ? <FeedbackStateCard title="Durum" detail={status} variant={status.includes("zorunlu") ? "error" : "info"} /> : null}
        <FeedbackStateCard
          title="Gerekli Çekirdek API"
          detail="execute_buy_now RPC + register_bid_deposit + payment preAuthorize/capture + KYC verified kontrolü."
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
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 8 },
  row: { color: "#cbd5e1", fontSize: 12 },
  checkbox: { borderWidth: 1, borderColor: "#475569", borderRadius: 10, padding: 10, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  checkboxOn: { borderColor: "#0ea5e9", backgroundColor: "#082f49" },
  checkboxIcon: { color: "#f8fafc", fontSize: 14 },
  checkboxText: { color: "#e2e8f0", fontSize: 12, flex: 1 },
  primaryBtn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 10 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
});

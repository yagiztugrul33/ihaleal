import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";

export default function IhaleTeklifScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submitMock = () => {
    if (!consentAccepted) {
      setStatus("KVKK rızası olmadan teklif ön-izleme yapılamaz.");
      return;
    }
    if (!amount.trim()) {
      setStatus("Teklif tutarı girin.");
      return;
    }
    setStatus("Teklif ön-izleme kaydı alındı (mock).");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Teklif Ver" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>İhale Teklif Akışı</Text>
        <Text style={styles.subtitle}>İhale: {id ?? "bilinmiyor"} · Çekirdek RPC bağlantısı olmadan mock ön-izleme çalışır.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Teklif Tutarı (TL)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="örn. 6.500.000"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            accessibilityLabel="Teklif tutarı"
          />
          <Pressable
            onPress={() => setConsentAccepted((prev) => !prev)}
            style={[styles.checkbox, consentAccepted ? styles.checkboxOn : undefined]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consentAccepted }}
            accessibilityLabel="Teklif KVKK rızası">
            <Text style={styles.checkboxIcon}>{consentAccepted ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>Kişisel teklif tercihi verimin işlenmesine açık rıza veriyorum.</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={submitMock} accessibilityRole="button" accessibilityLabel="Teklif ön izlemeyi gönder">
            <Text style={styles.primaryText}>Teklif Ön-izleme Gönder (mock)</Text>
          </Pressable>
        </View>

        {status ? <FeedbackStateCard title="Durum" detail={status} variant={status.includes("olm") ? "error" : "info"} /> : null}
        <FeedbackStateCard
          title="Gerekli Çekirdek API"
          detail="place_bid RPC + idempotency + bid bond doğrulaması + audit log."
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
  label: { color: "#cbd5e1", fontSize: 12 },
  input: { borderWidth: 1, borderColor: "#475569", borderRadius: 10, backgroundColor: "#111827", color: "#f8fafc", paddingHorizontal: 10, paddingVertical: 10 },
  checkbox: { borderWidth: 1, borderColor: "#475569", borderRadius: 10, padding: 10, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  checkboxOn: { borderColor: "#0ea5e9", backgroundColor: "#082f49" },
  checkboxIcon: { color: "#f8fafc", fontSize: 14 },
  checkboxText: { color: "#e2e8f0", fontSize: 12, flex: 1 },
  primaryBtn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 10 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
});

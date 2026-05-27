import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";

export default function UluslararasiScreen() {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onMockLead = () => {
    if (!consentAccepted) {
      setStatus("Uluslararası lead kaydı için KVKK aydınlatma ve açık rıza onayı gerekli.");
      return;
    }
    setStatus("Uluslararası yatırımcı lead kaydı alındı (mock).");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Uluslararası Yatırımcı</Text>
        <Text style={styles.subtitle}>B2B lead toplama akışının mobil ön-izlemesi.</Text>

        <View style={styles.card}>
          <Text style={styles.item}>- Çok dil + para birimi + hukuki uyum adımları</Text>
          <Text style={styles.item}>- Ülke bazlı belge listesi ve onboarding checklist</Text>
          <Text style={styles.item}>- Kurumsal lead yönlendirme (portal entegrasyonu bekliyor)</Text>
          <Pressable
            onPress={() => setConsentAccepted((prev) => !prev)}
            style={[styles.checkbox, consentAccepted ? styles.checkboxOn : undefined]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consentAccepted }}
            accessibilityLabel="Uluslararası lead KVKK rızası">
            <Text style={styles.checkboxIcon}>{consentAccepted ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>Aydınlatma metnini okudum, lead verimin işlenmesini kabul ediyorum.</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={onMockLead} accessibilityRole="button" accessibilityLabel="Uluslararası lead kaydet">
            <Text style={styles.primaryText}>Lead Kaydı Oluştur (mock)</Text>
          </Pressable>
        </View>

        {status ? <FeedbackStateCard title="Durum" detail={status} variant={status.includes("gerekli") ? "error" : "info"} /> : null}
        <FeedbackStateCard
          title="Gerekli Çekirdek API"
          detail="corporate_leads insert + organization routing + moderation queue + CRM webhook."
          variant="empty"
        />

        <Link href="/icerik/aydinlatma-metni" asChild>
          <Pressable style={styles.linkBtn} accessibilityRole="button" accessibilityLabel="Aydınlatma metnine git">
            <Text style={styles.linkText}>Aydınlatma Metni</Text>
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
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 8 },
  item: { color: "#cbd5e1", fontSize: 12 },
  checkbox: { borderWidth: 1, borderColor: "#475569", borderRadius: 10, padding: 10, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  checkboxOn: { borderColor: "#0ea5e9", backgroundColor: "#082f49" },
  checkboxIcon: { color: "#f8fafc", fontSize: 14 },
  checkboxText: { color: "#e2e8f0", fontSize: 12, flex: 1 },
  primaryBtn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 10 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
  linkBtn: { borderRadius: 10, borderWidth: 1, borderColor: "#334155", backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 10 },
  linkText: { color: "#bfdbfe", fontSize: 13, fontWeight: "700", textAlign: "center" },
});

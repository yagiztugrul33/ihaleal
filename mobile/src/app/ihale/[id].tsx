import { useMemo, useState } from "react";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { toAuctionDetailViewModel } from "./viewModel";

function formatTry(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} TL`;
}

export default function IhaleDetayScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auction = useMemo(() => (typeof id === "string" ? toAuctionDetailViewModel(id) : null), [id]);

  const onMockAction = async (label: string) => {
    if (!auction) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!consentAccepted) {
        throw new Error("KVKK rızası olmadan ihale alarmı ve teklif ön-izleme işlemi açılamaz.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
      return;
    } finally {
      setLoading(false);
    }
    setError(`${label} kaydedildi (mock). Çekirdek API gerekli: placeBid + watchlist + notifications.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "İhale Detayı" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {!auction ? (
          <FeedbackStateCard title="İhale bulunamadı" detail="Kart kaydı silinmiş veya id geçersiz." variant="empty" />
        ) : (
          <>
            <Image source={{ uri: auction.imageUrl }} style={styles.image} />
            <Text style={styles.title}>{auction.title}</Text>
            <Text style={styles.subtitle}>
              Durum: {auction.statusLabel} · Kalan süre: {auction.remainingLabel}
            </Text>

            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Güncel Teklif</Text>
              <Text style={styles.priceValue}>{formatTry(auction.currentBidTry)}</Text>
              <Text style={styles.priceHint}>Bir sonraki minimum: {formatTry(auction.minimumNextBidTry)}</Text>
            </View>

            <View style={styles.consentCard}>
              <Text style={styles.consentTitle}>KVKK Rızası</Text>
              <Text style={styles.consentDetail}>
                Alarm/izleme ve teklif ön-izleme için kişisel tercih verisi işlenir. Bu sürüm yalnız mock kayıt tutar.
              </Text>
              <Pressable
                onPress={() => setConsentAccepted((prev) => !prev)}
                style={[styles.checkboxRow, consentAccepted ? styles.checkboxRowOn : undefined]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consentAccepted }}
                accessibilityLabel="İhale KVKK rızası">
                <Text style={styles.checkboxIcon}>{consentAccepted ? "☑" : "☐"}</Text>
                <Text style={styles.checkboxText}>Açık rıza metnini okudum, ihale tercih verimin işlenmesini kabul ediyorum.</Text>
              </Pressable>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => void onMockAction("İzleme alarmı")}
                accessibilityRole="button"
                accessibilityLabel="İzleme alarmı aç">
                <Text style={styles.primaryText}>İzleme Alarmı Aç (mock)</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => void onMockAction("Teklif ön-izleme")}
                accessibilityRole="button"
                accessibilityLabel="Teklif önizleme başlat">
                <Text style={styles.secondaryText}>Teklif Ön-izleme (mock)</Text>
              </Pressable>
            </View>

            <View style={styles.flowGrid}>
              <Link href={`/ihale/${auction.id}/teklif`} asChild>
                <Pressable style={styles.flowBtn} accessibilityRole="button" accessibilityLabel="Teklif ekranına git">
                  <Text style={styles.flowText}>Teklif Ekranı</Text>
                </Pressable>
              </Link>
              <Link href={`/ihale/${auction.id}/hemen-al`} asChild>
                <Pressable style={styles.flowBtn} accessibilityRole="button" accessibilityLabel="Hemen al ekranına git">
                  <Text style={styles.flowText}>Hemen Al</Text>
                </Pressable>
              </Link>
              <Link href={`/ihale/${auction.id}/kapali-teklif`} asChild>
                <Pressable style={styles.flowBtn} accessibilityRole="button" accessibilityLabel="Kapalı teklif ekranına git">
                  <Text style={styles.flowText}>Kapalı Teklif</Text>
                </Pressable>
              </Link>
            </View>

            {loading ? <FeedbackStateCard title="Yükleniyor" detail="İşlem hazırlanıyor..." /> : null}
            {error ? <FeedbackStateCard title="Durum" detail={error} variant={error.includes("olm") ? "error" : "info"} /> : null}

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Çekirdek API Bağımlılığı</Text>
              <Text style={styles.noticeText}>Gerekli API: `place_bid` RPC, `watchlist` tablosu, `notifications` tablosu, push token kaydı.</Text>
            </View>

            <View style={styles.linksRow}>
              <Link href="/icerik/ihale-kosullari" asChild>
                <Pressable style={styles.linkBtn} accessibilityRole="button" accessibilityLabel="İhale koşullarını aç">
                  <Text style={styles.linkText}>İhale Koşulları</Text>
                </Pressable>
              </Link>
              <Link href="/icerik/kvkk" asChild>
                <Pressable style={styles.linkBtn} accessibilityRole="button" accessibilityLabel="KVKK sayfasını aç">
                  <Text style={styles.linkText}>KVKK</Text>
                </Pressable>
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 36, gap: 10 },
  image: { width: "100%", height: 190, borderRadius: 14, backgroundColor: "#0f172a", marginTop: 8 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "700", marginTop: 8 },
  subtitle: { color: "#94a3b8", fontSize: 12 },
  priceCard: { borderRadius: 12, borderWidth: 1, borderColor: "#334155", backgroundColor: "#0f172a", padding: 12, gap: 4 },
  priceLabel: { color: "#cbd5e1", fontSize: 12 },
  priceValue: { color: "#bfdbfe", fontSize: 20, fontWeight: "700" },
  priceHint: { color: "#94a3b8", fontSize: 12 },
  consentCard: { borderRadius: 12, borderWidth: 1, borderColor: "#334155", backgroundColor: "#0f172a", padding: 12, gap: 8 },
  consentTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  consentDetail: { color: "#cbd5e1", fontSize: 12 },
  checkboxRow: { borderRadius: 10, borderWidth: 1, borderColor: "#475569", padding: 10, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  checkboxRowOn: { borderColor: "#0ea5e9", backgroundColor: "#082f49" },
  checkboxIcon: { color: "#f8fafc", fontSize: 14, marginTop: 1 },
  checkboxText: { color: "#e2e8f0", fontSize: 12, flex: 1 },
  actionsRow: { gap: 8 },
  flowGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flowBtn: { borderRadius: 10, borderWidth: 1, borderColor: "#334155", backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 8 },
  flowText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  primaryBtn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 10 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
  secondaryBtn: { borderRadius: 10, borderWidth: 1, borderColor: "#334155", backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 10 },
  secondaryText: { color: "#cbd5e1", fontSize: 13, fontWeight: "700", textAlign: "center" },
  noticeCard: { borderRadius: 12, borderWidth: 1, borderColor: "#7c2d12", backgroundColor: "#431407", padding: 10, gap: 4 },
  noticeTitle: { color: "#fdba74", fontSize: 13, fontWeight: "700" },
  noticeText: { color: "#fed7aa", fontSize: 12 },
  linksRow: { flexDirection: "row", gap: 8 },
  linkBtn: { borderRadius: 10, borderWidth: 1, borderColor: "#334155", backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 8 },
  linkText: { color: "#bfdbfe", fontSize: 12, fontWeight: "700" },
});

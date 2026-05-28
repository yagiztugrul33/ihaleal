import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { registerBidDeposit, submitBid } from "../../../../shared";
import { getSupabaseClient } from "../../(auth)/authClient";
import { toAuctionDetailViewModel } from "../viewModel";

const DEPOSIT_RATE = 0.05;
const MIN_INCREMENT = 25_000;

export default function IhaleTeklifScreen() {
  const { id: auctionId } = useLocalSearchParams<{ id?: string }>();
  const auction = useMemo(
    () => (typeof auctionId === "string" ? toAuctionDetailViewModel(auctionId) : null),
    [auctionId],
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [amount, setAmount] = useState("");
  const [proxyAmount, setProxyAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleKycRedirect = (message: string) => {
    Alert.alert(
      "KYC Doğrulaması Gerekli",
      `${message}\n\nWeb sayfasında kimlik doğrulamayı tamamlayın, sonra bu ekrana dönün.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "KYC Sayfasını Aç",
          onPress: async () => {
            try {
              await Linking.openURL("https://www.ihaleal.com/kyc");
            } catch {
              Alert.alert("Hata", "KYC sayfası açılamadı. Tarayıcıdan ihaleal.com/kyc adresine gidin.");
            }
          },
        },
      ],
    );
  };

  const handleSubmit = async () => {
    if (!auctionId || !auction) return;
    if (!consentAccepted) {
      setStatus("KVKK rızası olmadan teklif gönderilemez.");
      return;
    }

    const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setStatus("Teklif tutarı girin.");
      return;
    }

    const parsedProxy = proxyAmount ? Number(proxyAmount.replace(/[^\d]/g, "")) : undefined;
    if (parsedProxy != null && (!Number.isFinite(parsedProxy) || parsedProxy <= 0)) {
      setStatus("Vekil teklif tutarı geçersiz.");
      return;
    }

    let bidderId: string | null = null;
    try {
      const client = await getSupabaseClient();
      const { data } = await client.auth.getSession();
      bidderId = data.session?.user?.id ?? null;
    } catch {
      bidderId = null;
    }
    if (!bidderId) {
      Alert.alert("Giriş gerekli", "Teklif vermek için giriş yapmalısınız.");
      router.push("/(auth)/login");
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const depositResult = await registerBidDeposit({
        listingId: auction.id,
        auctionId,
        context: "bid",
        baseAmountTry: parsedAmount,
        depositAmountTry: Math.round(parsedAmount * DEPOSIT_RATE),
        preAuthRef: "mobile-mock-preauth",
      });

      if (!depositResult.ok) {
        switch (depositResult.status) {
          case "kyc_required":
            handleKycRedirect(depositResult.message);
            break;
          case "auth_required":
            Alert.alert("Giriş gerekli", depositResult.message);
            router.push("/(auth)/login");
            break;
          case "rate_limited":
            Alert.alert("Çok sık deneme", `${depositResult.message}\nLütfen biraz bekleyin.`);
            break;
          default:
            Alert.alert("Teminat hatası", depositResult.message);
            break;
        }
        return;
      }

      const bidResult = await submitBid({
        auctionId,
        bidderId,
        currentBid: auction.currentBidTry,
        newBid: parsedAmount,
        minIncrement: MIN_INCREMENT,
        userMaxProxy: parsedProxy,
      });

      if (bidResult.ok) {
        Alert.alert(
          "Teklif kaydedildi",
          `Son tutar: ₺${bidResult.finalAmount.toLocaleString("tr-TR")}${bidResult.proxy ? " (vekil teklif uygulandı)" : ""}`,
        );
        setAmount("");
        setProxyAmount("");
        router.back();
        return;
      }

      switch (bidResult.code) {
        case "validation":
          Alert.alert("Geçersiz teklif", `${bidResult.message}\nMin gerekli: ₺${bidResult.requiredMinimum.toLocaleString("tr-TR")}`);
          break;
        case "deposit_required":
          Alert.alert("Teminat gerekli", "Önce teminat yatırmalısınız.");
          break;
        case "kyc_required":
          handleKycRedirect(bidResult.message);
          break;
        case "rate_limited":
          Alert.alert("Çok sık deneme", `${bidResult.message}\nLütfen biraz bekleyin.`);
          break;
        case "bid_too_low":
          Alert.alert("Teklif yetersiz", `${bidResult.message}\nMin gerekli: ₺${bidResult.requiredMinimum.toLocaleString("tr-TR")}`);
          break;
        case "auction_ended":
          Alert.alert("İhale kapandı", bidResult.message);
          router.replace("/ihaleler");
          break;
        case "auth_required":
          Alert.alert("Giriş gerekli", bidResult.message);
          router.push("/(auth)/login");
          break;
        default:
          Alert.alert("Reddedildi", bidResult.message);
          break;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Teklif Ver" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>İhale Teklif Akışı</Text>
        <Text style={styles.subtitle}>İhale: {auctionId ?? "bilinmiyor"} · Teklif akışı canlı RPC akışına bağlıdır.</Text>

        {!auction ? <FeedbackStateCard title="İhale bulunamadı" detail="Geçersiz ihale kimliği." variant="error" /> : null}

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
          <Text style={styles.label}>Vekil Teklif Üst Sınırı (opsiyonel)</Text>
          <TextInput
            value={proxyAmount}
            onChangeText={setProxyAmount}
            keyboardType="number-pad"
            placeholder="örn. 6.900.000"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            accessibilityLabel="Vekil teklif üst sınırı"
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
          <Pressable
            style={[styles.primaryBtn, submitting ? styles.primaryBtnDisabled : undefined]}
            onPress={() => void handleSubmit()}
            disabled={submitting || !auction}
            accessibilityRole="button"
            accessibilityLabel="Teklifi gönder">
            <Text style={styles.primaryText}>{submitting ? "Gönderiliyor..." : "Teklif Gönder"}</Text>
          </Pressable>
        </View>

        {status ? <FeedbackStateCard title="Durum" detail={status} variant={status.includes("olm") ? "error" : "info"} /> : null}
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
  primaryBtnDisabled: { opacity: 0.6 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
});

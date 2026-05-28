import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { executeBuyNow, registerBidDeposit } from "../../../../shared";
import { toAuctionDetailViewModel } from "../viewModel";

const BUY_NOW_DEPOSIT_RATE = 0.015;

export default function IhaleHemenAlScreen() {
  const { id: auctionId } = useLocalSearchParams<{ id?: string }>();
  const auction = useMemo(
    () => (typeof auctionId === "string" ? toAuctionDetailViewModel(auctionId) : null),
    [auctionId],
  );
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const dispatchTransactionNotifications = (actionLabel: string, amountTry: number) => {
    const amountText = `₺${amountTry.toLocaleString("tr-TR")}`;
    Alert.alert(
      "Bildirimler (mock)",
      `SMS teyit: ${actionLabel} işlemi ${amountText} için iletildi.\nE-posta teyit: ${actionLabel} işlemi ${amountText} için iletildi.`,
    );
  };

  const handleBuyNow = async () => {
    if (!auctionId || !auction) return;
    if (!confirmed) {
      setStatus("Hemen Al için sözleşme/KVKK onayı zorunlu.");
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const depositResult = await registerBidDeposit({
        listingId: auction.listingId,
        auctionId,
        context: "buy_now",
        baseAmountTry: auction.currentBidTry,
        depositAmountTry: Math.round(auction.currentBidTry * BUY_NOW_DEPOSIT_RATE),
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

      const buyResult = await executeBuyNow({
        listingId: auction.listingId,
        depositId: depositResult.depositId,
      });

      if (buyResult.ok) {
        if (buyResult.status === "ok") {
          dispatchTransactionNotifications("Hemen Al", buyResult.amountTry);
          Alert.alert(
            "Hemen Al başarılı",
            `₺${buyResult.amountTry.toLocaleString("tr-TR")} ile ihaleyi kazandınız.\nbuyNowId: ${buyResult.buyNowId}`,
          );
          router.back();
        } else {
          Alert.alert("Zaten kayıtlı", buyResult.message);
        }
        return;
      }

      switch (buyResult.status) {
        case "kyc_required":
          handleKycRedirect(buyResult.message);
          break;
        case "auth_required":
          Alert.alert("Giriş gerekli", buyResult.message);
          router.push("/(auth)/login");
          break;
        case "preconditions_failed":
          Alert.alert("İşlem tamamlanamadı", buyResult.message);
          break;
        case "rpc_error":
          Alert.alert("Sunucu hatası", `${buyResult.message}\nLütfen tekrar deneyin.`);
          break;
        case "config_missing":
          Alert.alert("Yapılandırma eksik", buyResult.message);
          break;
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Hemen Al" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Hemen Al (Mobil Ön-izleme)</Text>
        <Text style={styles.subtitle}>İhale: {auctionId ?? "bilinmiyor"} · Atomik satın alma akışı canlı RPC kullanır.</Text>

        {!auction ? <FeedbackStateCard title="İhale bulunamadı" detail="Geçersiz ihale kimliği." variant="error" /> : null}

        <View style={styles.card}>
          <Text style={styles.row}>1) KYC durumu kontrol edilir.</Text>
          <Text style={styles.row}>2) Teminat ön-yetkisi register_bid_deposit ile açılır.</Text>
          <Text style={styles.row}>3) execute_buy_now ile atomik kapanış yapılır.</Text>
          <Text style={styles.row}>
            Cari tutar: {auction ? `${new Intl.NumberFormat("tr-TR").format(auction.currentBidTry)} TL` : "—"}
          </Text>
          <Pressable
            onPress={() => setConfirmed((prev) => !prev)}
            style={[styles.checkbox, confirmed ? styles.checkboxOn : undefined]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            accessibilityLabel="Hemen al onay kutusu">
            <Text style={styles.checkboxIcon}>{confirmed ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>KVKK + ihale koşullarını okudum, Hemen Al işlemini onaylıyorum.</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryBtn, busy ? styles.primaryBtnDisabled : undefined]}
            onPress={() => void handleBuyNow()}
            disabled={busy || !auction}
            accessibilityRole="button"
            accessibilityLabel="Hemen al işlemini başlat">
            <Text style={styles.primaryText}>{busy ? "İşleniyor..." : "Hemen Al"}</Text>
          </Pressable>
        </View>

        {status ? <FeedbackStateCard title="Durum" detail={status} variant={status.includes("zorunlu") ? "error" : "info"} /> : null}
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
  primaryBtnDisabled: { opacity: 0.6 },
  primaryText: { color: "#f8fafc", fontSize: 13, fontWeight: "700", textAlign: "center" },
});

import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MODULE_LINKS = [
  { href: "/moduller/deprem", title: "Deprem Risk", subtitle: "Risk skoru + KVKK rıza katmanı." },
  { href: "/analiz/tapu", title: "Tapu -> AI", subtitle: "Belge yükleme + mock AI özet." },
  { href: "/analiz/ilan", title: "İlan -> AI", subtitle: "Dahili ilan kaydından AI ön-analiz." },
  { href: "/sehirler", title: "Şehir Rehberi", subtitle: "Şehir bazlı yatırım/uyum notları." },
  { href: "/uluslararasi", title: "Uluslararası Yatırımcı", subtitle: "Kurumsal lead ön-akışı + KVKK." },
  { href: "/araclar", title: "Finansal Araçlar", subtitle: "Mortgage, vergi, ROI ve getiri hesapları." },
  { href: "/icerik", title: "Hukuki/İçerik", subtitle: "KVKK, güvenlik ve rehber sayfaları." },
] as const;

export default function ModullerHubScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Modüller Hub</Text>
        <Text style={styles.subtitle}>Çekirdek API bekleyen parçalar mock ön-izleme modunda tutulur.</Text>

        {MODULE_LINKS.map((item) => (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable style={styles.card} accessibilityRole="button" accessibilityLabel={`${item.title} ekranını aç`}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </Pressable>
          </Link>
        ))}

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Çekirdek Bağımlı Modüller</Text>
          <Text style={styles.noticeText}>KKA ve komisyon gibi ekranlar şu anda preview; gereken API bağları ekran içinde işaretlidir.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 6 },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 4 },
  cardTitle: { color: "#f8fafc", fontSize: 15, fontWeight: "700" },
  cardSubtitle: { color: "#cbd5e1", fontSize: 12 },
  noticeCard: { borderWidth: 1, borderColor: "#7c2d12", borderRadius: 12, backgroundColor: "#431407", padding: 12, marginTop: 2 },
  noticeTitle: { color: "#fdba74", fontSize: 13, fontWeight: "700" },
  noticeText: { color: "#fed7aa", fontSize: 12, marginTop: 4 },
});

import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

const ROUTES = [
  {
    href: "/borsa-detay/izleme",
    title: "İzleme Listesi",
    desc: "Takip edilen varlıklar, fiyat/değişim, ekle-çıkar.",
  },
  {
    href: "/borsa-detay/veri",
    title: "Veri / Endeks",
    desc: "Piyasa özeti, trend ve sıralı varlık tablosu.",
  },
] as const;

export default function BorsaDetayIndexScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Borsa Alt Ekranları</Text>
        <Text style={styles.subtitle}>Sadece görüntüleme amaçlı izleme ve veri görünümü.</Text>
        {ROUTES.map((item) => (
          <Link key={item.href} href={item.href} style={styles.linkCard}>
            <Text style={styles.linkTitle}>{item.title}</Text>
            <Text style={styles.linkDesc}>{item.desc}</Text>
          </Link>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { paddingHorizontal: 16, gap: 12 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 8 },
  linkCard: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    backgroundColor: "#0b1220",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  linkTitle: { color: "#dbeafe", fontSize: 15, fontWeight: "700" },
  linkDesc: { color: "#93c5fd", fontSize: 12, marginTop: 4 },
});

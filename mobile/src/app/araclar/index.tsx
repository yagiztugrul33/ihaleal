import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

const ROUTES = [
  { href: "/araclar/mortgage", title: "Mortgage", desc: "Anapara/faiz/vade ile aylık taksit." },
  { href: "/araclar/komisyon", title: "Komisyon", desc: "Gelir ve komisyon kırılımı." },
  { href: "/araclar/vergi-simulatoru", title: "Vergi Simülatörü", desc: "Tapu ve değer artış vergisi ön hesap." },
] as const;

export default function AraclarIndexScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Finansal Hesaplayıcılar</Text>
        <Text style={styles.subtitle}>Dalga sonu navigasyonda bağlanacak native ekranlar.</Text>

        {ROUTES.map((route) => (
          <Link key={route.href} href={route.href} style={styles.linkCard}>
            <Text style={styles.linkTitle}>{route.title}</Text>
            <Text style={styles.linkDesc}>{route.desc}</Text>
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

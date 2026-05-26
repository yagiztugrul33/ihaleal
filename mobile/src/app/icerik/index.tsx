import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { WEB_CONTENT_ITEMS } from "../../../features/webview/webContentCatalog";

const CATEGORIES = ["Hukuki", "Rehber/Bilgi", "İçerik"] as const;

export default function IcerikIndexScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Daha Fazla / Menü</Text>
        <Text style={styles.subtitle}>Statik içerik sayfaları WebView üzerinden açılır.</Text>

        {CATEGORIES.map((category) => {
          const items = WEB_CONTENT_ITEMS.filter((item) => item.category === category);
          if (!items.length) return null;

          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category}</Text>
              {items.map((item) => (
                <Link key={item.slug} href={`/icerik/${item.slug}`} style={styles.linkCard}>
                  <Text style={styles.linkTitle}>{item.title}</Text>
                  <Text style={styles.linkPath}>{item.path}</Text>
                </Link>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 14 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13 },
  section: { gap: 8 },
  sectionTitle: { color: "#dbeafe", fontSize: 15, fontWeight: "700" },
  linkCard: {
    borderWidth: 1,
    borderColor: "#1e3a8a",
    backgroundColor: "#0b1220",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  linkTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  linkPath: { color: "#93c5fd", fontSize: 11, marginTop: 2 },
});

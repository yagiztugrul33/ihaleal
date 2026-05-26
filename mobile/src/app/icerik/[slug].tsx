import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ContentWebViewScreen } from "../../../features/webview/ContentWebViewScreen";
import { findWebContentBySlug } from "../../../features/webview/webContentCatalog";

export default function IcerikDetailScreen() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const item = findWebContentBySlug(slug);

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ title: "İçerik bulunamadı" }} />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>İçerik bulunamadı</Text>
          <Text style={styles.emptyDetail}>Geçersiz içerik bağlantısı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: item.title }} />
      <ContentWebViewScreen item={item} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  emptyCard: {
    margin: 14,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    backgroundColor: "#0f172a",
    padding: 12,
    gap: 6,
  },
  emptyTitle: { color: "#f8fafc", fontSize: 15, fontWeight: "700" },
  emptyDetail: { color: "#cbd5e1", fontSize: 12 },
});

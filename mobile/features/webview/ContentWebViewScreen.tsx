import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import type { WebContentItem } from "./webContentCatalog";
import {
  getPathnameFromUrl,
  isAllowedWebUrl,
  isBlockedInWebView,
  mapBlockedPathToNative,
  toAbsoluteWebUrl,
  WEB_BASE_URL,
} from "./webContentConfig";

type RequestPayload = {
  url: string;
};

export function ContentWebViewScreen({ item }: { item: WebContentItem }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const targetUrl = useMemo(() => toAbsoluteWebUrl(item.path), [item.path]);
  const originWhitelist = useMemo(() => {
    const baseHost = new URL(WEB_BASE_URL).hostname.toLowerCase();
    const altHost = baseHost.startsWith("www.") ? baseHost.slice(4) : `www.${baseHost}`;
    return [`https://${baseHost}`, `https://${altHost}`];
  }, []);
  const webViewModule = useMemo(() => {
    try {
      const runtimeRequire = (
        globalThis as unknown as { require?: (moduleId: string) => unknown }
      ).require;
      if (typeof runtimeRequire !== "function") return null;
      return runtimeRequire("react-native-webview") as { WebView: React.ComponentType<any> };
    } catch {
      return null;
    }
  }, []);

  const openExternal = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleRequest = (req: RequestPayload): boolean => {
    const url = req.url;
    if (!isAllowedWebUrl(url)) {
      void openExternal(url);
      return false;
    }
    const pathname = getPathnameFromUrl(url);
    if (!pathname) {
      setError("URL doğrulanamadı.");
      return false;
    }

    const nativePath = mapBlockedPathToNative(pathname);
    if (nativePath) {
      router.push(nativePath);
      return false;
    }

    if (isBlockedInWebView(pathname)) {
      void openExternal(url);
      return false;
    }

    return true;
  };

  const onRetry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const WebView = webViewModule?.WebView;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
          onPress={() => router.back()}
          style={styles.backBtn}>
          <Text style={styles.backText}>Geri</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tarayıcıda aç"
          onPress={() => openExternal(targetUrl)}
          style={styles.browserBtn}>
          <Text style={styles.browserText}>Tarayıcı</Text>
        </Pressable>
      </View>

      {error ? (
        <StateCard title="Yükleme hatası" detail={error} buttonText="Yeniden dene" onPress={onRetry} />
      ) : null}

      {!WebView ? (
        <StateCard
          title="WebView modülü yok"
          detail="react-native-webview kurulu değil. İçeriği tarayıcıda açabilirsiniz."
          buttonText="Tarayıcıda aç"
          onPress={() => openExternal(targetUrl)}
        />
      ) : (
        <View style={styles.webContainer}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#dbeafe" />
              <Text style={styles.loadingText}>İçerik yükleniyor...</Text>
            </View>
          ) : null}

          <WebView
            key={`${item.slug}-${reloadKey}`}
            source={{ uri: targetUrl }}
            onShouldStartLoadWithRequest={handleRequest}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError("Sayfa yüklenemedi.");
            }}
            originWhitelist={originWhitelist}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function StateCard({
  title,
  detail,
  buttonText,
  onPress,
}: {
  title: string;
  detail: string;
  buttonText: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDetail}>{detail}</Text>
      <Pressable style={styles.stateButton} onPress={onPress} accessibilityRole="button">
        <Text style={styles.stateButtonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0b1220",
  },
  backBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  backText: { color: "#dbeafe", fontSize: 13, fontWeight: "700" },
  title: { color: "#f8fafc", fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center", marginHorizontal: 8 },
  browserBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  browserText: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
  webContainer: { flex: 1 },
  loadingOverlay: {
    position: "absolute",
    zIndex: 2,
    top: 8,
    right: 8,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.88)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loadingText: { color: "#dbeafe", fontSize: 12 },
  stateCard: {
    margin: 12,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    backgroundColor: "#0f172a",
    padding: 12,
    gap: 8,
  },
  stateTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  stateDetail: { color: "#cbd5e1", fontSize: 12 },
  stateButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stateButtonText: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
});

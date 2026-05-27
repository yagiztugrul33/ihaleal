import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeedbackStateCard } from "@/components/FeedbackStateCard";
import { getBridgeSignal, getDepremMockRows, type DepremRiskRow } from "./model";

export default function DepremModulScreen() {
  const [rows, setRows] = useState<DepremRiskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceError, setForceError] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const bridge = getBridgeSignal();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      if (forceError) throw new Error("Mock error");
      setRows(getDepremMockRows());
    } catch {
      setRows([]);
      setError("Deprem risk verisi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Modül / Deprem Risk</Text>
        <Text style={styles.subtitle}>
          Deprem risk ön-analizi. Çıktılar bilgilendirme içindir, resmi mühendislik raporu yerine geçmez.
        </Text>
        <Text style={styles.bridgeNote} accessibilityLabel={`Location bridge durumu: ${bridge.bridgeActive ? "aktif" : "pasif"}`}>
          locationIntelligence bridge: {bridge.bridgeActive ? `aktif (${bridge.exportCount} export)` : "pasif"}
        </Text>

        <View style={styles.consentCard}>
          <Text style={styles.consentTitle}>KVKK Rıza Adımı</Text>
          <Text style={styles.consentDetail}>
            Bölge detaylarını göstermeden önce deprem risk verisinin ön analiz amaçlı işlendiğini onaylayın.
          </Text>
          <Pressable
            style={[styles.checkboxRow, consentAccepted ? styles.checkboxRowOn : undefined]}
            onPress={() => setConsentAccepted((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consentAccepted }}
            accessibilityLabel="KVKK deprem risk rızası">
            <Text style={styles.checkboxIcon}>{consentAccepted ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>Açık rıza metnini okudum, deprem risk ön-analizini kabul ediyorum.</Text>
          </Pressable>
        </View>

        <View style={styles.controls}>
          <Pressable style={styles.btn} onPress={load} accessibilityLabel="Deprem sorgusunu yenile">
            <Text style={styles.btnText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, forceError ? styles.warnBtn : undefined]}
            onPress={() => {
              setLoading(true);
              setForceError((v) => !v);
            }}
            accessibilityLabel="Deprem hata modu aç kapa">
            <Text style={styles.btnText}>{forceError ? "Hata: Açık" : "Hata: Kapalı"}</Text>
          </Pressable>
        </View>

        {loading ? <FeedbackStateCard title="Yükleniyor" detail="Deprem risk verisi hazırlanıyor..." /> : null}
        {!loading && error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}
        {!loading && !error && rows.length === 0 ? <FeedbackStateCard title="Boş" detail="Gösterilecek risk verisi yok." variant="empty" /> : null}
        {!loading && !error && !consentAccepted ? (
          <FeedbackStateCard
            title="Rıza Bekleniyor"
            detail="KVKK rızası olmadan mahalle bazlı risk detayları maskeli gösterilir."
            variant="info"
          />
        ) : null}

        {!loading &&
          !error &&
          rows.map((row) => (
            <View key={row.id} style={styles.card} accessibilityRole="summary">
              <Text style={styles.region}>{consentAccepted ? row.region : row.region.replace(/\/.*/, "/ ***")}</Text>
              <Text style={styles.meta}>Risk skoru: {row.riskScore}/100</Text>
              <Text style={styles.meta}>Seviye: {row.level}</Text>
              <Text style={styles.meta}>Son olay: {row.lastEvent}</Text>
            </View>
          ))}

        <View style={styles.linksRow}>
          <Link href="/icerik/kvkk" asChild>
            <Pressable style={styles.linkBtn} accessibilityRole="button" accessibilityLabel="KVKK sayfasını aç">
              <Text style={styles.linkText}>KVKK</Text>
            </Pressable>
          </Link>
          <Link href="/icerik/guvenlik" asChild>
            <Pressable style={styles.linkBtn} accessibilityRole="button" accessibilityLabel="Güvenlik sayfasını aç">
              <Text style={styles.linkText}>Güvenlik</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  scroll: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#94a3b8", fontSize: 13 },
  bridgeNote: { color: "#93c5fd", fontSize: 12 },
  consentCard: { borderRadius: 12, borderWidth: 1, borderColor: "#334155", padding: 12, backgroundColor: "#0f172a", gap: 8 },
  consentTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  consentDetail: { color: "#cbd5e1", fontSize: 12 },
  checkboxRow: { borderRadius: 10, borderWidth: 1, borderColor: "#475569", padding: 10, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  checkboxRowOn: { borderColor: "#0ea5e9", backgroundColor: "#082f49" },
  checkboxIcon: { color: "#f8fafc", fontSize: 14, marginTop: 1 },
  checkboxText: { color: "#e2e8f0", fontSize: 12, flex: 1 },
  controls: { flexDirection: "row", gap: 8 },
  btn: { borderRadius: 10, backgroundColor: "#1d4ed8", paddingHorizontal: 10, paddingVertical: 8 },
  warnBtn: { backgroundColor: "#b45309" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  card: { borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a", padding: 12, gap: 4 },
  region: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  meta: { color: "#cbd5e1", fontSize: 12 },
  linksRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  linkBtn: { borderRadius: 10, borderWidth: 1, borderColor: "#334155", paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#111827" },
  linkText: { color: "#bfdbfe", fontSize: 12, fontWeight: "700" },
});

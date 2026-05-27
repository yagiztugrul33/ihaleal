import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { mockTapuAiService } from "./aiService";
import { canSendToAi } from "./privacy";
import type {
  TapuAiAnalysisResult,
  TapuAiConsentState,
  TapuDocumentSelection,
} from "./types";

const INITIAL_CONSENT: TapuAiConsentState = {
  illuminationAccepted: false,
  explicitConsentAccepted: false,
};

function normalizeDocument(asset: {
  uri: string;
  name?: string;
  mimeType?: string;
}): TapuDocumentSelection {
  const mime = asset.mimeType ?? "";
  const isPdf = mime.includes("pdf") || (asset.name ?? "").toLowerCase().endsWith(".pdf");
  return {
    uri: asset.uri,
    name: asset.name ?? (isPdf ? "tapu-belgesi.pdf" : "tapu-gorseli.jpg"),
    mimeType: isPdf ? "application/pdf" : mime || "image/jpeg",
    kind: isPdf ? "pdf" : "image",
  };
}

async function pickTapuDocument(): Promise<TapuDocumentSelection | null> {
  const docResult = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/*"],
    multiple: false,
    copyToCacheDirectory: false,
  });
  if (!docResult.canceled && docResult.assets?.length) {
    return normalizeDocument(docResult.assets[0]);
  }

  const imagePermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!imagePermission.granted) {
    return null;
  }

  const imageResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.9,
  });
  if (!imageResult.canceled && imageResult.assets.length) {
    return normalizeDocument(imageResult.assets[0]);
  }
  return null;
}

function ConsentModal({
  visible,
  consent,
  onClose,
  onToggle,
  onApprove,
}: {
  visible: boolean;
  consent: TapuAiConsentState;
  onClose: () => void;
  onToggle: (field: keyof TapuAiConsentState) => void;
  onApprove: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>KVKK Rıza Adımı</Text>
          <Text style={styles.modalDescription}>
            AI sağlayıcısı: MockAI Secure. Gönderilen veri: seçtiğiniz tapu dosyasının metin
            içeriği, doküman türü ve sınırlı belge alanları.
          </Text>

          <Text style={styles.sectionTitle}>Aydınlatma Metni</Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent.illuminationAccepted }}
            accessibilityLabel="Aydınlatma metnini okudum kutusu"
            style={styles.checkboxRow}
            onPress={() => onToggle("illuminationAccepted")}
          >
            <Text style={styles.checkboxIcon}>{consent.illuminationAccepted ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>
              Aydınlatma metnini okudum; verinin analiz amacıyla işleneceğini anladım.
            </Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Açık Rıza Beyanı</Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent.explicitConsentAccepted }}
            accessibilityLabel="Açık rıza veriyorum kutusu"
            style={styles.checkboxRow}
            onPress={() => onToggle("explicitConsentAccepted")}
          >
            <Text style={styles.checkboxIcon}>{consent.explicitConsentAccepted ? "☑" : "☐"}</Text>
            <Text style={styles.checkboxText}>
              Tapu belgesi verisinin MockAI Secure sağlayıcısına iletilmesine açık rıza veriyorum.
            </Text>
          </Pressable>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Vazgeç</Text>
            </Pressable>
            <Pressable
              onPress={onApprove}
              style={[styles.actionButton, canSendToAi(consent) ? styles.primaryButton : styles.disabledButton]}
              disabled={!canSendToAi(consent)}
            >
              <Text style={styles.primaryButtonText}>Onayla ve Gönder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TapuAiAnalysisScreen() {
  const [document, setDocument] = useState<TapuDocumentSelection | null>(null);
  const [consent, setConsent] = useState<TapuAiConsentState>(INITIAL_CONSENT);
  const [consentVisible, setConsentVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TapuAiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = useMemo(() => Boolean(document), [document]);

  const handlePickDocument = async () => {
    setError(null);
    const selected = await pickTapuDocument();
    if (!selected) {
      setError("Belge seçimi tamamlanmadı veya izin verilmedi.");
      return;
    }
    setDocument(selected);
    setResult(null);
  };

  const startAnalyzeFlow = () => {
    if (!document) {
      setError("Önce bir tapu dosyası seçmelisiniz.");
      return;
    }
    setConsentVisible(true);
  };

  const runAnalyze = async () => {
    if (!document || !canSendToAi(consent)) {
      return;
    }

    setConsentVisible(false);
    setIsLoading(true);
    setError(null);

    try {
      const analyzed = await mockTapuAiService.analyzeTapu({
        document,
        consent,
      });
      setResult(analyzed);
    } catch {
      setError("Tapu analizi sırasında beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
      setDocument(null);
      setConsent(INITIAL_CONSENT);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tapu → AI Analizi (Mock)</Text>
        <Text style={styles.caption}>
          Bu ekran erken aşama prototiptir. Ham belge analiz sonrasında bellekte tutulmaz.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1) Belge seçimi</Text>
          <Text style={styles.cardText}>PDF veya tapu fotoğrafı seçin.</Text>
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handlePickDocument}
            accessibilityRole="button"
            accessibilityLabel="Tapu dosyası seç"
          >
            <Text style={styles.primaryButtonText}>Belge Seç</Text>
          </Pressable>
          {document ? (
            <Text style={styles.inlineInfo}>Seçilen dosya: {document.name}</Text>
          ) : (
            <Text style={styles.inlineInfo}>Henüz belge seçilmedi.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2) Rıza sonrası analiz</Text>
          <Pressable
            style={[styles.actionButton, canAnalyze ? styles.primaryButton : styles.disabledButton]}
            onPress={startAnalyzeFlow}
            disabled={!canAnalyze || isLoading}
            accessibilityRole="button"
            accessibilityLabel="Tapu analizini başlat"
          >
            <Text style={styles.primaryButtonText}>AI Analizini Başlat</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Belge analiz ediliyor...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3) Analiz Sonucu</Text>
            <Text style={styles.cardText}>{result.summary}</Text>
            <Text style={styles.resultRow}>Risk seviyesi: {result.riskLevel}</Text>
            <Text style={styles.resultRow}>Malik (maskeli): {result.ownerMasked}</Text>
            <Text style={styles.resultRow}>TCKN (maskeli): {result.tcknMasked}</Text>
            <Text style={styles.resultRow}>Ada/Parsel (maskeli): {result.parcelMasked}</Text>
            <Text style={styles.resultRow}>Sağlayıcı: {result.providerName}</Text>
            {result.notes.map((note) => (
              <Text key={note} style={styles.noteItem}>
                • {note}
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>
              Sonuç alanı boş. Belge seçip rıza adımını tamamladığınızda analiz gösterilir.
            </Text>
          </View>
        )}
      </ScrollView>

      <ConsentModal
        visible={consentVisible}
        consent={consent}
        onClose={() => setConsentVisible(false)}
        onToggle={(field) => setConsent((prev) => ({ ...prev, [field]: !prev[field] }))}
        onApprove={runAnalyze}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  content: { padding: 16, gap: 12 },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "700" },
  caption: { color: "#cbd5e1", fontSize: 13, lineHeight: 18 },
  card: { backgroundColor: "#111827", borderRadius: 12, padding: 14, gap: 8 },
  cardTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "600" },
  cardText: { color: "#d1d5db", fontSize: 14 },
  actionButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: { backgroundColor: "#2563eb" },
  secondaryButton: { backgroundColor: "#1f2937" },
  disabledButton: { backgroundColor: "#334155" },
  primaryButtonText: { color: "#ffffff", fontWeight: "600" },
  secondaryButtonText: { color: "#e5e7eb", fontWeight: "600" },
  inlineInfo: { color: "#93c5fd", fontSize: 13 },
  stateCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  stateText: { color: "#cbd5e1", textAlign: "center" },
  errorCard: { backgroundColor: "#7f1d1d", borderRadius: 12, padding: 12 },
  errorText: { color: "#fee2e2", fontWeight: "600" },
  resultRow: { color: "#e2e8f0", fontSize: 13 },
  noteItem: { color: "#94a3b8", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.74)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    width: "100%",
    maxWidth: 540,
    gap: 10,
  },
  modalTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  modalDescription: { color: "#d1d5db", fontSize: 13, lineHeight: 18 },
  sectionTitle: { color: "#bfdbfe", fontWeight: "600", marginTop: 4 },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  checkboxIcon: { color: "#f8fafc", fontSize: 16, lineHeight: 20 },
  checkboxText: { color: "#cbd5e1", flex: 1, fontSize: 13, lineHeight: 18 },
  modalActions: { flexDirection: "row", gap: 8, marginTop: 6 },
});

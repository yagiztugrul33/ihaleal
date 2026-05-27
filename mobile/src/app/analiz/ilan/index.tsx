import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { findListing } from "../../../../shared/demoMarket";

import { mockIlanAiService } from "./aiService";
import type { IlanAiAnalysisResult, IlanAiConsentState, IlanRecord } from "./types";
import { FeedbackStateCard } from "@/components/FeedbackStateCard";

const INITIAL_CONSENT: IlanAiConsentState = {
  illuminationAccepted: false,
  explicitConsentAccepted: false,
};

function canAnalyzeIlan(consent: IlanAiConsentState): boolean {
  return consent.illuminationAccepted && consent.explicitConsentAccepted;
}

function formatTl(value: number): string {
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function ConsentModal({
  visible,
  consent,
  onToggle,
  onApprove,
  onClose,
}: {
  visible: boolean;
  consent: IlanAiConsentState;
  onToggle: (field: keyof IlanAiConsentState) => void;
  onApprove: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>KVKK Rıza Adımı</Text>
          <Text style={styles.modalDescription}>
            AI sağlayıcısı: MockAI Secure. Gönderilen veri: ilan kimliği, fiyat, tahmini değer,
            şehir/ilçe ve AI skor özet alanları.
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
              Aydınlatma metnini okudum ve ilan verisinin analiz için işleneceğini anladım.
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
              İlan verisinin MockAI Secure sağlayıcısına iletilmesine açık rıza veriyorum.
            </Text>
          </Pressable>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Vazgeç</Text>
            </Pressable>
            <Pressable
              onPress={onApprove}
              style={[styles.actionButton, canAnalyzeIlan(consent) ? styles.primaryButton : styles.disabledButton]}
              disabled={!canAnalyzeIlan(consent)}
              accessibilityRole="button"
              accessibilityLabel="Onayla ve ilan analizini çalıştır"
            >
              <Text style={styles.primaryButtonText}>Onayla ve Analiz Et</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function IlanAiAnalysisScreen() {
  const [ilanNo, setIlanNo] = useState("");
  const [selected, setSelected] = useState<IlanRecord | null>(null);
  const [result, setResult] = useState<IlanAiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentVisible, setConsentVisible] = useState(false);
  const [consent, setConsent] = useState<IlanAiConsentState>(INITIAL_CONSENT);

  const normalizedNo = useMemo(() => ilanNo.trim().toUpperCase(), [ilanNo]);

  const fetchIlan = () => {
    setError(null);
    setResult(null);
    const record = findListing(normalizedNo);
    if (!record) {
      setSelected(null);
      setError("İlan bulunamadı. Örnek: IST-KDK-001");
      return;
    }
    setSelected({
      id: record.id,
      title: record.title,
      city: record.city,
      district: record.district,
      priceTry: record.priceTry,
      estimatedValueTry: record.estimatedValueTry,
      aiScore: record.aiScore,
    });
  };

  const startAnalyze = () => {
    if (!selected) {
      setError("Önce geçerli bir ilan kaydı seçmelisiniz.");
      return;
    }
    setConsentVisible(true);
  };

  const runAnalyze = async () => {
    if (!selected || !canAnalyzeIlan(consent)) {
      return;
    }

    setConsentVisible(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await mockIlanAiService.analyzeIlan({
        ilan: selected,
        consent,
      });
      setResult(response);
    } catch {
      setError("İlan AI analizi sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
      setConsent(INITIAL_CONSENT);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>İlan → AI Analizi (Mock)</Text>
        <Text style={styles.caption}>
          Dış scraping yapılmaz; yalnız dahili mock kayıt üzerinden çalışır.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>1) İlan kaydı seç</Text>
          <TextInput
            value={ilanNo}
            onChangeText={setIlanNo}
            placeholder="Örn: IST-KDK-001"
            placeholderTextColor="#94a3b8"
            autoCapitalize="characters"
            style={styles.input}
            accessibilityLabel="İlan numarası girişi"
          />
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={fetchIlan}
            accessibilityRole="button"
            accessibilityLabel="İlan kaydını getir"
          >
            <Text style={styles.primaryButtonText}>Kayıdı Getir</Text>
          </Pressable>
          {selected ? (
            <View style={styles.inlinePanel}>
              <Text style={styles.inlineInfo}>{selected.title}</Text>
              <Text style={styles.inlineInfo}>
                {selected.city}/{selected.district} • {formatTl(selected.priceTry)}
              </Text>
            </View>
          ) : (
            <Text style={styles.inlineInfo}>Henüz ilan seçilmedi.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>2) Rıza sonrası analiz</Text>
          <Pressable
            style={[styles.actionButton, selected ? styles.primaryButton : styles.disabledButton]}
            onPress={startAnalyze}
            disabled={!selected || isLoading}
            accessibilityRole="button"
            accessibilityLabel="İlan analizini başlat"
          >
            <Text style={styles.primaryButtonText}>AI Analizini Başlat</Text>
          </Pressable>
        </View>

        {isLoading ? <FeedbackStateCard title="Yükleniyor" detail="İlan analizi hazırlanıyor..." variant="info" /> : null}

        {error ? <FeedbackStateCard title="Hata" detail={error} variant="error" /> : null}

        {result ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3) Analiz Sonucu</Text>
            <Text style={styles.cardText}>{result.summary}</Text>
            <Text style={styles.resultRow}>Risk skoru: {result.riskScore}/100</Text>
            <Text style={styles.resultRow}>Risk etiketi: {result.riskLabel}</Text>
            <Text style={styles.resultRow}>Fiyat makullüğü: {result.priceFairness}</Text>
            <Text style={styles.resultRow}>Sağlayıcı: {result.providerName}</Text>
            {result.highlights.map((item) => (
              <Text key={item} style={styles.noteItem}>
                • {item}
              </Text>
            ))}
          </View>
        ) : (
          <FeedbackStateCard
            title="Boş"
            detail="Sonuç alanı boş. İlan seçip rıza adımını tamamladığınızda analiz görünür."
            variant="empty"
          />
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
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f8fafc",
    backgroundColor: "#0f172a",
  },
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
  inlinePanel: { backgroundColor: "#1e293b", borderRadius: 10, padding: 10, gap: 4 },
  inlineInfo: { color: "#93c5fd", fontSize: 13 },
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

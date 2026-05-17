/**
 * ComplianceNlpService.ts
 * İhaleAL — Chat NLP Risk Skorlaması & Şüphe Logu
 * Otomatik ceza DEĞİL; sadece admin_review_queue tetikleyicisi.
 */


// ============================================
// TİPLER
// ============================================

export interface ChatRiskSignal {
  messageId: string;
  threadId: string;
  senderId: string;
  flaggedKeywords: string[];
  modelScore: number; // 0-1
  severity: "low" | "medium" | "high";
  requiresAutoBlock: boolean; // HER ZAMAN FALSE
  adminReviewQueue: boolean; // HER ZAMAN TRUE
  createdAt: string;
}

export interface KeywordRule {
  keyword: string;
  weight: number; // 0-1
  category: "dusuk_gosterim" | "vergi_kacak" | "dolandiricilik" | "dis_iletişim" | "diger";
}

// ============================================
// KURAL TABLOSU (Admin panelden yönetilebilir)
// ============================================

export const DEFAULT_KEYWORD_RULES: KeywordRule[] = [
  // Düşük gösterim
  { keyword: "düşük göster", weight: 0.95, category: "dusuk_gosterim" },
  { keyword: "tapuda şöyle yaz", weight: 0.90, category: "dusuk_gosterim" },
  { keyword: "düşük yazalım", weight: 0.92, category: "dusuk_gosterim" },
  { keyword: "tapu değeri farklı", weight: 0.85, category: "dusuk_gosterim" },
  { keyword: "gerçek fiyat", weight: 0.60, category: "dusuk_gosterim" },
  // Vergi kaçakçılığı
  { keyword: "vergiden kaç", weight: 0.88, category: "vergi_kacak" },
  { keyword: "vergi ödemey", weight: 0.85, category: "vergi_kacak" },
  { keyword: "kayıt dışı", weight: 0.90, category: "vergi_kacak" },
  { keyword: "nakit alalım", weight: 0.70, category: "vergi_kacak" },
  // Dolandırıcılık
  { keyword: "kapora yolla", weight: 0.75, category: "dolandiricilik" },
  { keyword: "şimdi havale", weight: 0.65, category: "dolandiricilik" },
  { keyword: "acil ödeme", weight: 0.50, category: "dolandiricilik" },
  // Dış iletişim
  { keyword: "whatsapp", weight: 0.40, category: "dis_iletişim" },
  { keyword: "telefon ver", weight: 0.45, category: "dis_iletişim" },
  { keyword: "dışarıda görüş", weight: 0.55, category: "dis_iletişim" },
  { keyword: "aradan çık", weight: 0.72, category: "dis_iletişim" },
  { keyword: "aradan cik", weight: 0.72, category: "dis_iletişim" },
  { keyword: "platformu bypass", weight: 0.68, category: "dis_iletişim" },
  { keyword: "şahsi iban", weight: 0.70, category: "dis_iletişim" },
  { keyword: "sahsi iban", weight: 0.70, category: "dis_iletişim" },
  { keyword: "komisyonsuz kapat", weight: 0.62, category: "dis_iletişim" },
  { keyword: "bana direkt öde", weight: 0.68, category: "dis_iletişim" },
  { keyword: "platformu atlayalım", weight: 0.70, category: "dis_iletişim" },
  { keyword: "disari tasiyalim", weight: 0.55, category: "dis_iletişim" },
];

// ============================================
// NLP SKORLAYICI
// ============================================

export class ComplianceNlpService {
  private rules: KeywordRule[];

  constructor(rules: KeywordRule[] = DEFAULT_KEYWORD_RULES) {
    this.rules = rules;
  }

  /**
   * Async queue'da çalışır; anlık cevap gerekmez.
   * Dönüş değeri HER ZAMAN admin_review_queue=true, requiresAutoBlock=false.
   */
  async scoreChatMessage(
    text: string,
    meta: { messageId: string; threadId: string; senderId: string }
  ): Promise<ChatRiskSignal> {
    const normalized = this.normalize(text);
    const flagged: string[] = [];
    let totalWeight = 0;
    let maxWeight = 0;

    for (const rule of this.rules) {
      const normKeyword = this.normalize(rule.keyword);
      if (normalized.includes(normKeyword)) {
        flagged.push(rule.keyword);
        totalWeight += rule.weight;
        if (rule.weight > maxWeight) maxWeight = rule.weight;
      }
    }

    // Model skoru: maksimum ağırlık + toplam ağırlık normalizasyonu
    const modelScore = Math.min(1, maxWeight + totalWeight * 0.1);

    // Severity mapping
    let severity: "low" | "medium" | "high" = "low";
    if (modelScore >= 0.85) severity = "high";
    else if (modelScore >= 0.60) severity = "medium";

    return {
      messageId: meta.messageId,
      threadId: meta.threadId,
      senderId: meta.senderId,
      flaggedKeywords: flagged,
      modelScore: r4(modelScore),
      severity,
      requiresAutoBlock: false, // KURAL: Otomatik ceza yok
      adminReviewQueue: true,   // KURAL: Her zaman insan onayı
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Yanlış pozitif eğitim verisi ekleme (admin onaylı)
   */
  async trainFalsePositive(messageId: string, adminId: string): Promise<void> {
    // Gerçek uygulamada: flagged kaydını "false_positive" olarak işaretle
    // Model ağırlıklarını azalt (gradual decay)
    console.log(`[ComplianceNLP] False positive kaydedildi: msg=${messageId} admin=${adminId}`);
  }

  /**
   * Yeni kural ekle (admin panelden)
   */
  addRule(rule: KeywordRule): void {
    this.rules.push(rule);
  }

  /**
   * Mevcut kuralları getir
   */
  getRules(): KeywordRule[] {
    return [...this.rules];
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,;:!?()[\]{}'"]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
  }
}

function r4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export const complianceNlpService = new ComplianceNlpService();

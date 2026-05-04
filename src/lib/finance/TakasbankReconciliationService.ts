/**
 * TakasbankReconciliationService.ts
 * İhaleAL — Takasbank Tutar Doğrulama & Uzlaştırma
 * Platform kapanış tutarı ile Takasbank API'den okunan tutarı karşılaştırır.
 */

import { z } from "zod";

// ============================================
// TİPLER
// ============================================

export interface SettlementRecord {
  id: string;
  transactionId: string;
  actualBiddingValue: number;
  tapuDeclaredValue?: number;
  takasbankAmount?: number;
  takasbankApiResponse?: unknown;
  amountMismatch: boolean;
  mismatchSeverity: "none" | "warning" | "critical";
  status: "pending" | "verified" | "mismatch_flagged" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  epsilon: number;
}

export interface ReconcileResult {
  matched: boolean;
  diffAmount: number;
  severity: "none" | "warning" | "critical";
  settlementRecord: SettlementRecord;
  warningMessage?: string;
}

export interface BatchReconcileResult {
  total: number;
  matched: number;
  mismatched: number;
  criticalCount: number;
  results: ReconcileResult[];
}

export interface TakasbankApiClient {
  fetchTransactionAmount(transactionId: string): Promise<{
    amount: number;
    currency: string;
    timestamp: string;
    rawResponse: unknown;
  }>;
}

// ============================================
// DOĞRULAMA ŞEMA
// ============================================

export const ReconcileInputSchema = z.object({
  transactionId: z.string().min(1),
  actualBiddingValue: z.number().positive().finite(),
  tapuDeclaredValue: z.number().positive().finite().optional(),
  epsilon: z.number().positive().default(100),
});

// ============================================
// ANA SERVİS
// ============================================

export class TakasbankReconciliationService {
  private api: TakasbankApiClient;
  private records: Map<string, SettlementRecord> = new Map();

  constructor(api: TakasbankApiClient) {
    this.api = api;
  }

  async verify(transactionId: string): Promise<ReconcileResult> {
    const record = this.records.get(transactionId);
    if (!record) {
      throw new Error(`SettlementRecord bulunamadı: ${transactionId}`);
    }

    try {
      const apiResult = await this.api.fetchTransactionAmount(transactionId);
      const takasbankAmount = apiResult.amount;

      const diff = Math.abs(record.actualBiddingValue - takasbankAmount);
      const matched = diff <= record.epsilon;
      const severity = this.calculateSeverity(diff, record.actualBiddingValue, record.epsilon);

      const updated: SettlementRecord = {
        ...record,
        takasbankAmount,
        takasbankApiResponse: apiResult.rawResponse,
        amountMismatch: !matched,
        mismatchSeverity: severity,
        status: matched ? "verified" : "mismatch_flagged",
      };

      this.records.set(transactionId, updated);

      let warningMessage: string | undefined;
      if (!matched) {
        warningMessage = `Takasbank tutarı (${takasbankAmount.toLocaleString("tr-TR")} TRY) ile platform kapanış tutarı (${record.actualBiddingValue.toLocaleString("tr-TR")} TRY) arasında ${diff.toLocaleString("tr-TR")} TRY fark tespit edildi. İşlem durduruldu, admin incelemesi bekleniyor.`;
      }

      return {
        matched,
        diffAmount: diff,
        severity,
        settlementRecord: updated,
        warningMessage,
      };
    } catch (err) {
      // API hatası — retry mantığı
      throw new TakasbankApiError(
        `Takasbank API hatası (tx: ${transactionId}): ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
        transactionId
      );
    }
  }

  async verifyBatch(transactionIds: string[]): Promise<BatchReconcileResult> {
    const results: ReconcileResult[] = [];
    let matchedCount = 0;
    let criticalCount = 0;

    for (const txId of transactionIds) {
      try {
        const result = await this.verify(txId);
        results.push(result);
        if (result.matched) matchedCount++;
        if (result.severity === "critical") criticalCount++;
      } catch {
        // Hata alan kayıtları skip et, rapora ekle
        results.push({
          matched: false,
          diffAmount: 0,
          severity: "critical",
          settlementRecord: this.records.get(txId)!,
          warningMessage: "API hatası nedeniyle doğrulama yapılamadı",
        });
        criticalCount++;
      }
    }

    return {
      total: transactionIds.length,
      matched: matchedCount,
      mismatched: transactionIds.length - matchedCount,
      criticalCount,
      results,
    };
  }

  createRecord(input: {
    transactionId: string;
    actualBiddingValue: number;
    tapuDeclaredValue?: number;
    epsilon?: number;
  }): SettlementRecord {
    const rec: SettlementRecord = {
      id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      transactionId: input.transactionId,
      actualBiddingValue: r2(input.actualBiddingValue),
      tapuDeclaredValue: input.tapuDeclaredValue ? r2(input.tapuDeclaredValue) : undefined,
      amountMismatch: false,
      mismatchSeverity: "none",
      status: "pending",
      createdAt: new Date().toISOString(),
      epsilon: input.epsilon ?? 100,
    };
    this.records.set(input.transactionId, rec);
    return rec;
  }

  resolveMismatch(transactionId: string, adminId: string, approved: boolean): SettlementRecord {
    const rec = this.records.get(transactionId);
    if (!rec) throw new Error(`Kayıt bulunamadı: ${transactionId}`);
    if (rec.status !== "mismatch_flagged") {
      throw new Error(`Sadece 'mismatch_flagged' kayıtlar çözümlenebilir. Mevcut: ${rec.status}`);
    }

    const updated: SettlementRecord = {
      ...rec,
      status: approved ? "resolved" : "mismatch_flagged",
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminId,
    };
    this.records.set(transactionId, updated);
    return updated;
  }

  private calculateSeverity(
    diff: number,
    actual: number,
    epsilon: number = 100
  ): "none" | "warning" | "critical" {
    if (diff <= epsilon) return "none";
    const ratio = diff / actual;
    if (ratio > 0.05) return "critical"; // %5+ fark kritik
    if (ratio > 0.01) return "warning";  // %1+ fark uyarı
    return "none";
  }

  getRecord(transactionId: string): SettlementRecord | undefined {
    return this.records.get(transactionId);
  }

  getAllRecords(): SettlementRecord[] {
    return Array.from(this.records.values());
  }
}

export class TakasbankApiError extends Error {
  public transactionId: string;
  constructor(message: string, transactionId: string) {
    super(message);
    this.name = "TakasbankApiError";
    this.transactionId = transactionId;
  }
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ============================================
// STUB API CLIENT (Test / Development)
// ============================================

export const stubTakasbankClient: TakasbankApiClient = {
  async fetchTransactionAmount(transactionId: string) {
    // Stub: txId'nin son 3 hanesi amount'u belirler (test için)
    const suffix = transactionId.slice(-3);
    const amount = Number(suffix) * 1000 || 500000;
    return {
      amount,
      currency: "TRY",
      timestamp: new Date().toISOString(),
      rawResponse: { txId: transactionId, status: "ok", amount },
    };
  },
};

/**
 * Tahsilat / e-Fatura entegrasyonu için taslak tip - DB semasi ile eslenir.
 */
export type FinanceTransactionType =
  | "HEMEN_AL"
  | "KAT_KARSILIGI_HIZMET"
  | "KIRALIK_HIZMET"
  | "DEVREN_PROVIZYON"
  | "CAYMA_AKCESI";

export interface FinanceTransactionDraft {
  id: string;
  userId: string;
  propertyId: string;
  transactionType: FinanceTransactionType;
  baseAmountTry: number;
  vatRate: number;
  vatAmountTry: number;
  totalAmountTry: number;
  corporateTaxExemptionCandidate?: boolean;
  vatExemptionCodeCandidate?: string;
  productSku?: string;
  externalInvoiceId?: string;
  actualPlatformDealTry: number;
  tapuDeclaredAmountTry?: number;
  takasbankLinked?: boolean;
}

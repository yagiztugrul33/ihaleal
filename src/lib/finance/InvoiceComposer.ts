/**
 * InvoiceComposer.ts
 * İhaleAL — e-Fatura UBL Payload Oluşturucu
 * Paraşüt / e-Fatura entegratörü için UBL-TR standardına uygun XML/JSON payload üretir.
 */


// ============================================
// TİPLER
// ============================================

export interface RevenueTemplate {
  sku: string;
  descriptionTr: string;
  descriptionEn: string;
  defaultVatRate: number;
  eligibleForTeknokent: boolean;
  forbiddenTermCheck: boolean;
  approvedBy: string;
  approvedAt: string;
}

export interface TaxProfile {
  id: string;
  name: string;
  isTeknokentExempt: boolean;
  exemptionCode?: string;
}

export interface CustomerInfo {
  tckn?: string;
  vkn: string;
  fullName: string;
  address: string;
  city: string;
  district: string;
  email: string;
  phone?: string;
}

export interface InvoiceLineItem {
  sku: string;
  descriptionRef: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  vatExemptionReasonCode?: string;
  vatExemptionReasonDesc?: string;
  teknokentProjectCode?: string;
  lineTotal: number;
}

export interface UBLLineItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  lineExtensionAmount: number;
  exemptionReasonCode?: string;
  exemptionReason?: string;
}

export interface UBLPayload {
  ublVersionId: string;
  customizationId: string;
  profileId: string;
  id: string;
  issueDate: string;
  issueTime: string;
  invoiceTypeCode: "SATIS" | "IADE" | "TEVKIFAT";
  documentCurrencyCode: string;
  lineCountNumeric: number;
  accountingSupplierParty: {
    partyName: string;
    taxScheme: string;
    vkn: string;
  };
  accountingCustomerParty: CustomerInfo;
  taxTotal: {
    taxAmount: number;
    taxSubtotal: Array<{
      taxableAmount: number;
      taxAmount: number;
      percent: number;
      taxCategory: {
        taxScheme: string;
        name: string;
        exemptionReasonCode?: string;
        exemptionReason?: string;
      };
    }>;
  };
  legalMonetaryTotal: {
    lineExtensionAmount: number;
    taxExclusiveAmount: number;
    taxInclusiveAmount: number;
    payableAmount: number;
  };
  invoiceLines: UBLLineItem[];
  notes?: string[];
  hash?: string;
}

// ============================================
// YASAKLI KELIME KONTROLÜ
// ============================================

export const FORBIDDEN_TERMS = [
  "komisyon",
  "aracılık bedeli",
  "emlak komisyonu",
  "aracılık ücreti",
  "komisyon ücreti",
  "emlakçı payı",
  "aracı ücret",
];

export interface ForbiddenCheckResult {
  blocked: boolean;
  matchedTerms: string[];
  normalizedText: string;
}

export function checkForbiddenTerms(text: string): ForbiddenCheckResult {
  const normalized = text.toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, "");

  const matched: string[] = [];
  for (const term of FORBIDDEN_TERMS) {
    const normTerm = term
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
    if (normalized.includes(normTerm)) matched.push(term);
  }

  return { blocked: matched.length > 0, matchedTerms: matched, normalizedText: normalized };
}

// ============================================
// TEKNOKENT PROJE KODU DOĞRULAMA
// ============================================

export interface TeknokentValidationResult {
  valid: boolean;
  code?: string;
  message: string;
  requiresAdminOverride: boolean;
}

export function validateTeknokentProjectCode(
  lineItem: InvoiceLineItem,
  taxProfile: TaxProfile
): TeknokentValidationResult {
  if (taxProfile.isTeknokentExempt && !lineItem.teknokentProjectCode) {
    return {
      valid: false,
      code: "INVOICE_BLOCKED_MISSING_AR_GE_CODE",
      message: "Teknokent KDV istisnası için AR-GE proje kodu zorunludur",
      requiresAdminOverride: true,
    };
  }
  return { valid: true, message: "OK", requiresAdminOverride: false };
}

// ============================================
// KDV ORANI ÇÖZÜMLEYİCİ
// ============================================

export function resolveTaxRate(template: RevenueTemplate, profile: TaxProfile): number {
  if (profile.isTeknokentExempt && template.eligibleForTeknokent) {
    return 0; // KDV istisna
  }
  return template.defaultVatRate; // Standart KDV (örn. %20)
}

// ============================================
// ANA COMPOSER
// ============================================

export interface InvoiceComposeInput {
  invoiceId: string;
  issueDate: string; // "YYYY-MM-DD"
  customer: CustomerInfo;
  lineItems: InvoiceLineItem[];
  template: RevenueTemplate;
  taxProfile: TaxProfile;
  legalEntityVkn: string;
  legalEntityName: string;
  notes?: string[];
}

export class InvoiceComposer {
  compose(input: InvoiceComposeInput): UBLPayload {
    // 1) Yasaklı kelime kontrolü
    for (const item of input.lineItems) {
      const desc = item.descriptionRef;
      const check = checkForbiddenTerms(desc);
      if (check.blocked) {
        throw new InvoiceBlockedError(
          `INVOICE_BLOCKED_FORBIDDEN_TERM: "${check.matchedTerms.join(", ")}" tespit edildi`,
          check.matchedTerms
        );
      }
    }

    // 2) Teknokent proje kodu doğrulama
    for (const item of input.lineItems) {
      const val = validateTeknokentProjectCode(item, input.taxProfile);
      if (!val.valid) {
        throw new InvoiceBlockedError(val.message, [], val.code);
      }
    }

    // 3) KDV oranını çözümle
    const resolvedVatRate = resolveTaxRate(input.template, input.taxProfile);

    // 4) UBL satırları oluştur
    const ublLines = input.lineItems.map((item, idx) => this.buildUBLLine(item, idx + 1, resolvedVatRate));

    // 5) Toplamlar
    const taxExclusiveTotal = ublLines.reduce((sum, l) => sum + l.lineExtensionAmount, 0);
    const vatTotal = ublLines.reduce((sum, l) => sum + l.vatAmount, 0);
    const taxInclusiveTotal = taxExclusiveTotal + vatTotal;

    // 6) Tax subtotals (KDV grupları)
    const taxSubtotal = this.buildTaxSubtotals(ublLines, resolvedVatRate, input.taxProfile);

    // 7) UBL payload derle
    const ubl: UBLPayload = {
      ublVersionId: "2.1",
      customizationId: "TR1.2",
      profileId: "TEMELFATURA",
      id: input.invoiceId,
      issueDate: input.issueDate,
      issueTime: "00:00:00",
      invoiceTypeCode: "SATIS",
      documentCurrencyCode: "TRY",
      lineCountNumeric: ublLines.length,
      accountingSupplierParty: {
        partyName: input.legalEntityName,
        taxScheme: "Vergi Dairesi",
        vkn: input.legalEntityVkn,
      },
      accountingCustomerParty: input.customer,
      taxTotal: {
        taxAmount: vatTotal,
        taxSubtotal,
      },
      legalMonetaryTotal: {
        lineExtensionAmount: taxExclusiveTotal,
        taxExclusiveAmount: taxExclusiveTotal,
        taxInclusiveAmount: taxInclusiveTotal,
        payableAmount: taxInclusiveTotal,
      },
      invoiceLines: ublLines,
      notes: input.notes || ["İhaleAL platform hizmeti — bilgilendirme faturası"],
    };

    // 8) Hash üret
    ubl.hash = this.generateUBLHash(ubl);

    return ubl;
  }

  private buildUBLLine(item: InvoiceLineItem, lineId: number, resolvedVatRate: number): UBLLineItem {
    const lineExtension = r2(item.unitPrice * item.quantity);
    const vatAmount = r2(lineExtension * resolvedVatRate);

    const ublLine: UBLLineItem = {
      id: lineId,
      name: item.descriptionRef,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: resolvedVatRate,
      vatAmount,
      lineExtensionAmount: lineExtension,
    };

    // İstisna kodu varsa ekle
    if (item.vatExemptionReasonCode) {
      ublLine.exemptionReasonCode = item.vatExemptionReasonCode;
      ublLine.exemptionReason = item.vatExemptionReasonDesc || "KDV istisnası";
    }

    return ublLine;
  }

  private buildTaxSubtotals(
    lines: UBLLineItem[],
    resolvedVatRate: number,
    profile: TaxProfile
  ): UBLPayload["taxTotal"]["taxSubtotal"] {
    const totalTaxable = lines.reduce((s, l) => s + l.lineExtensionAmount, 0);
    const totalTax = lines.reduce((s, l) => s + l.vatAmount, 0);

    const sub: UBLPayload["taxTotal"]["taxSubtotal"][0] = {
      taxableAmount: totalTaxable,
      taxAmount: totalTax,
      percent: resolvedVatRate,
      taxCategory: {
        taxScheme: "KDV",
        name: "Katma Değer Vergisi",
      },
    };

    if (profile.isTeknokentExempt && profile.exemptionCode) {
      sub.taxCategory.exemptionReasonCode = profile.exemptionCode;
      sub.taxCategory.exemptionReason = "4691 sayılı Kanun kapsamında AR-GE merkezi KDV istisnası";
    }

    return [sub];
  }

  private generateUBLHash(ubl: UBLPayload): string {
    // SHA-256(JSON canonical representation)
    const canonical = JSON.stringify(ubl, Object.keys(ubl).sort());
    // Node.js crypto veya web crypto kullanılabilir; burada basit hash
    let hash = 0;
    for (let i = 0; i < canonical.length; i++) {
      const char = canonical.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return "ubl_sha256_" + Math.abs(hash).toString(16).padStart(64, "0");
  }
}

export class InvoiceBlockedError extends Error {
  public matchedTerms: string[];
  public errorCode?: string;
  constructor(message: string, matchedTerms: string[] = [], code?: string) {
    super(message);
    this.name = "InvoiceBlockedError";
    this.matchedTerms = matchedTerms;
    this.errorCode = code;
  }
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const invoiceComposer = new InvoiceComposer();

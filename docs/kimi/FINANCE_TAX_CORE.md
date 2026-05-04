# İhaleAL — Financial, Tax & Billing Core Rules (Teknokent, e-Fatura, Takasbank, Vergi Simülatörü)

**Doküman:** FINANCE_TAX_CORE.md  
**Versiyon:** 2.0.0  
**Kapsam:** FinTech + PropTech muhasebe mimarisi, backend regülasyon, e-Fatura otomasyonu, vergi simülasyonu, Takasbank şeffaflığı  
**Son Güncelleme:** 2026-05-04  
**Onay Gerekliliği:** Tüm vergi sonucu, fatura metni, istisna kodu ve şirket yapısı için YMM + avukat + Teknokent yönetimi onayı zorunludur.

---

## 0) Yasal Sınır ve Risk Uyarısı (Zorunlu)

> ⚠️ **Bu doküman hukuki strateji taslağıdır.** "Komisyon" kelimesini faturada kullanmama / "SaaS lisans" isimlendirme stratejisi Gelir İdaresi ve mahkeme süreçlerinde risk taşır. `invoice_line_description` alanları yasal onaylı şablon tablosundan gelmeli; hard-code metin prod'da yasaktır.

> ⚠️ **4691 / KDV Geçici 20 / istisna kodları** (örn. 350) şirketin fiili durumuna bağlıdır. `isTeknokentExempt`, `exemptionCode` sadece onaylı sözleşme + dönem + ürün kodu ile `TRUE` olabilir; aksi halde `FALSE` ve standart KDV matrahı uygulanır.

> ⚠️ **Amaç vergiden kaçınma değildir.** Hedef mevzuata uygun optimizasyon ve şeffaflıktır. Düşük gösterim uyarıları kullanıcıyı bilgilendirir; platform sorumluluğunu sınırlamaz (hukuk metni avukat onaylıdır).

---

## 1) Mevcut Kod Tabanı ile Köprü

Aşağıdaki dosyalar bu katmanın temelidir; yeni Tax/Billing katmanı bunların üzerine eklenir:

| Dosya | Rol | Yeni Katman Etkileşimi |
|-------|-----|----------------------|
| `src/lib/commission/engine.ts` | Matrah ve paylar (rental/sale/land_share) | `TaxSimulatorService` commission matrahını input olarak alır; fatura satırı üretilirken `revenueTemplateId` ile eşleştirilir |
| `src/lib/commission/penaltyEngine.ts` | Cayma / kötüye kullanım tutarları | `BillingKind.PENALTY_INDEMNITY` ayrı fatura template'i ile faturalandırılır; KDV mantığı YMM kararına göre ayrı şablonda |
| `src/lib/payment.ts` (PSP webhook) | Ödeme sağlayıcı webhook giriş noktası | Webhook success → `BillingEvent` oluşturma trigger'ı (Sequence Diagram bölüm 9) |
| `src/lib/fees.ts` | Üyelik, hizmet bedeli, tapu harcı oranları | `TaxSimulatorService` tapu harcı ve üyelik mahsup hesaplamalarında referans alınır |

---

## 2) Bölüm 1 — Teknokent & Fatura İsimlendirme (Politika Tablosu)

### 2.1 Ürün / Gelir Kalemi Sözlüğü (DB: `revenue_recognition_templates`)

```typescript
// Faturada yasaklı kelimeler — regex + CI kontrolü
const FORBIDDEN_TERMS = [
  "komisyon",
  "aracılık bedeli",
  "emlak komisyonu",
  "aracılık ücreti",
  "komisyon ücreti",
];

// Admin UI'den yönetilen onaylı fatura satır şablonları
const ALLOWED_LINE_TEMPLATES = {
  SAAS_LICENSE_PLATFORM: {
    tr: "Yapay Zeka Destekli Gayrimenkul Eşleştirme ve Veri Odası Yazılım Kullanım Lisans Bedeli",
    en: "AI-Powered Real Estate Matching and Data Room Software License Fee",
    approvedBy: "YMM_001_AVUKAT_003",
    approvedAt: "2026-01-15",
    sku: "IHALEAL-SAAS-001",
    defaultVatRate: 0.20,       // Standart KDV; Teknokent istisna profili ile değişebilir
    eligibleForTeknokent: true,
  },
  SAAS_LICENSE_MOBILE: {
    tr: "Mobil Uygulama Yazılım Kullanım Lisans Bedeli",
    en: "Mobile Application Software License Fee",
    sku: "IHALEAL-SAAS-MOB-001",
    defaultVatRate: 0.20,
    eligibleForTeknokent: true,
  },
  DATA_ROOM_ACCESS: {
    tr: "Veri Odası Erişim ve Güvenli Saklama Hizmet Bedeli",
    en: "Data Room Access and Secure Storage Service Fee",
    sku: "IHALEAL-DR-001",
    defaultVatRate: 0.20,
    eligibleForTeknokent: false, // Hizmet teslimi — istisna dışı
  },
  ESCROW_SERVICE: {
    tr: "Emanet Hesabı ve Ödeme Altyapı Hizmet Bedeli",
    en: "Escrow Account and Payment Infrastructure Service Fee",
    sku: "IHALEAL-ESC-001",
    defaultVatRate: 0.20,
    eligibleForTeknokent: false,
  },
  PENALTY_INDEMNITY: {
    tr: "Sözleşme Cayma Tazminatı",
    en: "Contract Cancellation Indemnity",
    sku: "IHALEAL-PEN-001",
    defaultVatRate: 0.20, // YMM kararı: tazminat KDV'ye tabi mi?
    eligibleForTeknokent: false,
  },
} as const;
```

**Kural:** Fatura üretimi sırasında `description` alanı `ALLOWED_LINE_TEMPLATES` içinden `sku` ile çekilir. Eğer `FORBIDDEN_TERMS` regex'i eşleşirse:
- `INVOICE_BLOCKED_FORBIDDEN_TERM` hatası fırlatılır
- Compliance ticket otomatik oluşturulur
- Admin review queue'ya düşer

### 2.2 Fatura Motoru Çıktıları

Her `billing_event` için üretilen `InvoiceLineItem` yapısı:

```typescript
interface InvoiceLineItem {
  sku: string;                        // revenue_recognition_templates.sku
  descriptionRef: string;             // Şablon referans kodu
  quantity: number;                   // Genellikle 1 (adet)
  unitPrice: Decimal;                 // Birim fiyat (KDV hariç)
  vatRate: Decimal;                   // Örn: 0.20, 0.00 (istisna)
  vatAmount: Decimal;               // unitPrice * quantity * vatRate
  vatExemptionReasonCode?: string;    // Örn: "350" (Teknokent KDV istisna)
  vatExemptionReasonDesc?: string;    // "4691 sayılı Kanun kapsamında KDV istisnası"
  teknokentProjectCode?: string;      // Zorunlu; yoksa fatura BLOKE
  lineTotal: Decimal;               // (unitPrice * quantity) + vatAmount
}
```

**Önemli Alanlar:**
- `Tax_Exempt_Corporate`: Muhasebe export için boolean. YMM export şemasına göre `true` ise Kurumlar Vergisi istisna bayrağı aktif.
- `UBLCustomizationID`: e-Fatura entegratör şemasına göre mapping (örn. "TR1.2").
- `exemptionCode`: "350" gibi kodlar sadece onaylı `tax_profile` ile birlikte kullanılabilir.

### 2.3 Proje Kodu Zorunluluğu

```typescript
function validateTeknokentProjectCode(
  lineItem: InvoiceLineItem,
  taxProfile: TaxProfile
): ValidationResult {
  if (taxProfile.isTeknokentExempt && !lineItem.teknokentProjectCode) {
    return {
      valid: false,
      code: "INVOICE_BLOCKED_MISSING_AR_GE_CODE",
      message: "Teknokent KDV istisnası için AR-GE proje kodu zorunludur",
      requiresAdminOverride: true,
    };
  }
  return { valid: true };
}
```

---

## 3) Bölüm 2 — Takasbank & "Düşük Gösterim" Şeffaflığı

### 3.1 Veri Modeli (SettlementRecord)

```typescript
interface SettlementRecord {
  id: string;
  transactionId: string;           // İhale / satış işlem ID
  actualBiddingValue: Decimal;     // Platform kapanış tutarı (immutable)
  tapuDeclaredValue: Decimal;      // Kullanıcı tapu beyanı (opsiyonel)
  takasbankAmount: Decimal;        // Takasbank API'den okunan tutar
  takasbankApiResponse: JSON;      // Ham API yanıtı (delil)
  amountMismatch: boolean;         // |takasbank - actual| > epsilon
  epsilon: Decimal;                // Varsayılan: 100.00 TRY
  mismatchSeverity: "none" | "warning" | "critical";
  status: "pending" | "verified" | "mismatch_flagged" | "resolved";
  createdAt: DateTime;
  resolvedAt?: DateTime;
  resolvedBy?: string;             // Admin user ID
}
```

### 3.2 Uyarı ve Delil Mekanizması

**HMK / Dijital Delil için:** Onay anında `consent_payload` üretilir:

```typescript
interface AmountConsentPayload {
  timestamp: string;               // ISO8601
  contractVersion: string;         // Örn: "2.1.0"
  userId: string;
  transactionId: string;
  actualAmount: Decimal;             // Platform tutarı
  declaredAmount: Decimal;           // Kullanıcı beyanı
  takasbankAmount: Decimal;          // Takasbank doğrulaması
  ipAddress: string;
  deviceFingerprint: string;
  geoLocation?: { lat: number; lng: number };
  consentHash: string;             // SHA256(payload)
}
```

**Kullanıcı Uyarısı Metni (Avukat Onaylı Şablon):**
> "Platform üzerinde kapanan tutar ile tapu beyanınız arasında fark tespit edilmiştir. Platform sadece eşleştirme ve ödeme altyapısı sağlar; tapu beyanının doğruluğu ve hukuki sonuçları tamamen taraflara aittir. Düşük gösterim vergi suçu oluşturabilir; ilgili mercilere bildirim yükümlülüğü kullanıcılara aittir."

### 3.3 Chat NLP (Compliance Log)

```typescript
interface ChatRiskSignal {
  messageId: string;
  threadId: string;
  senderId: string;
  flaggedKeywords: string[];       // Örn: ["düşük göster", "tapuda şöyle yaz", "vergiden kaç"]
  modelScore: number;              // 0-1, ML model confidence
  severity: "low" | "medium" | "high";
  requiresAutoBlock: boolean;        // FALSE — otomatik ceza yok
  adminReviewQueue: boolean;       // TRUE — her zaman insan onayı
  createdAt: DateTime;
}
```

**Kural:** NLP skoru otomatik ceza değil, `admin_review_queue` tetikleyicisidir. Yanlış pozitif yönetimi için admin panelde "Onayla / Reddet / Eğit" aksiyonları vardır.

---

## 4) Bölüm 3 — Vergi / Harç Simülatörü (API + UI)

### 4.1 Girdi Şeması (Zod)

```typescript
const TaxSimulatorInputSchema = z.object({
  purchaseDate: z.string().regex(/^\d{4}-\d{2}$/),           // "2021-06"
  declaredPurchasePriceTry: z.number().positive().finite(),    // Tapu beyan alış tutarı
  expectedSalePriceTry: z.number().positive().finite(),      // Hedef satış tutarı
  municipality: z.string().optional(),                       // "istanbul", "ankara"
  propertyType: z.enum(["konut", "arsa", "ticari", "tarla"]).optional(),
  isFirstResidence: z.boolean().default(false),               // 150m² istisna için
  areaM2: z.number().positive().optional(),                   // 150m² sınır kontrolü
});

type TaxSimulatorInput = z.infer<typeof TaxSimulatorInputSchema>;
```

### 4.2 Yİ-ÜFE (Yurt İçi Üretici Fiyat Endeksi)

```typescript
interface YiUfeRecord {
  yearMonth: string;          // "2021-06"
  indexValue: Decimal;        // TÜİK endeks değeri
  source: "tuik_api" | "manual_entry" | "cached";
  stale: boolean;             // 30+ gün eski ise stale=true
  updatedAt: DateTime;
}
```

**ETL Süreci:**
1. Günlük/aylık cron job TÜİK API'den son endeks değerini çeker
2. `yi_ufe_series` tablosuna yazılır
3. API yanıt vermezse `stale=true` flag set edilir
4. Simülatör `stale` veri ile çalışmaz — kullanıcıya "Yİ-ÜFE verisi güncellenemedi, hesaplama geçici olarak kullanılamıyor" mesajı gösterilir

### 4.3 Değer Artışı (Bilgilendirme Modülü)

**5 Yıl Kuralı:**
```typescript
function isFiveYearExempt(purchaseDate: string, saleDate: string): boolean {
  const purchase = new Date(purchaseDate + "-01");
  const sale = new Date(saleDate + "-01");
  const diffMs = sale.getTime() - purchase.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears >= 5;
}
```
> ⚠️ **YMM Kararı Gereklidir:** "Tam gün mü, ay bazlı mı?" kuralı şirket YMM'si tarafından netleştirilmeli; kodda `FIVE_YEAR_RULE_MODE: 'calendar_day' | 'month_boundary'` config değişkeni tanımlanmıştır.

**Endeksleme Kuralı (Yİ-ÜFE):**
> "Bir önceki ay Yİ-ÜFE" — satış yapılan ayın bir önceki ayındaki endeks değeri kullanılır. Kodda `getPreviousMonthUFE(yearMonth)` fonksiyonu unit test ile doğrulanmıştır.

**Dilimli Gelir Vergisi (GV) Oranları:**
```typescript
const TAX_BRACKETS_2026 = [
  { limit: 158000,  rate: 0.15 },
  { limit: 330000,  rate: 0.20 },
  { limit: 800000,  rate: 0.27 },
  { limit: 4300000, rate: 0.35 },
  { limit: Infinity, rate: 0.40 },
];
```
> ⚠️ Bracket limitleri yıllık versiyonludur; `tax_brackets` tablosunda `year` kolonu ile saklanır. 2026 istisna tutarı `config` tablosunda `ANNUAL_GV_EXEMPTION_2026` key'i ile tutulur.

### 4.4 Tapu Harcı

```typescript
const TAPU_DUTY_CONFIG = {
  totalRate: 0.04,           // Toplam %4 (alıcı %2 + satıcı %2)
  buyerShare: 0.50,          // Alıcı payı %50
  sellerShare: 0.50,         // Satıcı payı %50
  version: "2026.01",
  effectiveFrom: "2026-01-01",
} as const;
```
> ⚠️ Oranlar `config` tablosunda versiyonlu tutulur; değişiklikte yeni versiyon oluşturulur, eski işlemler eski versiyonla kalır.

### 4.5 Çıktı: CostBreakdown DTO

```typescript
interface CostBreakdown {
  disclaimer: "Bu hesaplama bilgilendirme amaçlıdır. Resmi vergi hesabı değildir. YMM ve tapu sicil müdürlüğü onayı gereklidir.";
  
  // Girdi
  input: TaxSimulatorInput;
  
  // Tapu Harcı
  deedDuty: {
    buyerShare: Decimal;     // Alıcı tapu harcı
    sellerShare: Decimal;      // Satıcı tapu harcı
    total: Decimal;
    rateUsed: number;
    version: string;
  };
  
  // Gelir Vergisi (Değer Artışı)
  capitalGainsTax: {
    taxableGain: Decimal;      // Endeksli kazanç (veya safi)
    isFiveYearExempt: boolean; // 5 yıl istisna geçerli mi
    annualExemption: Decimal;    // 2026 yıllık istisna tutarı
    taxBaseAfterExemption: Decimal;
    taxAmount: Decimal;        // Dilimli hesaplanan GV
    bracketsApplied: Array<{ limit: number; rate: number; amount: number }>;
    yiUfeIndexedCost: Decimal; // Yİ-ÜFE endeksli maliyet
    yiUfeRateUsed: number;     // Uygulanan endeks oranı
  };
  
  // Platform SaaS Bedeli (Commission Engine'den)
  platformFee: {
    baseAmount: Decimal;
    vatRate: Decimal;
    vatAmount: Decimal;
    total: Decimal;
    revenueTemplateId: string;
  };
  
  // Net Özet
  netToSeller: {
    grossSalePrice: Decimal;
    minusDeedDuty: Decimal;
    minusPlatformFee: Decimal;
    minusCapitalGainsTax: Decimal;
    minusOtherFees: Decimal;   // Ekspertiz, avukat, vs.
    estimatedNet: Decimal;
  };
  
  // Uyarılar
  warnings: string[];
}
```

---

## 5) Bölüm 4 — Paraşüt / e-Fatura Otomasyonu

### 5.1 Webhook Zinciri (payment.succeeded)

```
[PSP Webhook: payment.succeeded]
         |
         v
[Idempotent Billing Job — jobIdempotencyKey: webhookId]
         |
         v
[1. CreateOrFindCustomer (TCKN/VKN eşleştirme)]
         |
         v
[2. Revenue Template seçimi (sku lookup)]
         |
         v
[3. Tax Profile uygula (Teknokent? Istisna kodu?)]
         |
         v
[4. InvoiceComposer.compose() → UBLPayload]
         |
         v
[5. Paraşüt API: Create Sales Invoice]
         |
         v
[6. parasutInvoiceId BillingEvent'e geri yaz]
         |
         v
[7. PDF/XML Deliver + Audit Log]
```

### 5.2 Tersine Entegrasyon (Emlakçı Faturası)

```typescript
interface ReverseInvoiceFlow {
  // GİB / Entegratör webhook: Gelen e-Fatura
  incomingInvoice: {
    parasutInvoiceId: string;
    sellerVkn: string;
    amount: Decimal;
    date: DateTime;
    status: "pending_reconcile" | "matched" | "mismatch";
  };
  
  // Eşleştirme
  reconcileResult: {
    matchedBillingEventId?: string;
    net30StartDate?: DateTime;      // Eşleşirse Net-30 başlar
    pendingBalance: Decimal;        // Fark varsa beklemede
    adminReviewRequired: boolean;
  };
}
```

**Kural:** Emlakçı faturası `Invoice_Approved` durumuna geçtiğinde Net-30 ödeme takvimi başlar.

### 5.3 Cayma / Tazminat Faturalama

```typescript
enum InvoiceKind {
  SAAS_LICENSE = "SAAS_LICENSE",
  PENALTY_INDEMNITY = "PENALTY_INDEMNITY",
  ESCROW_RELEASE = "ESCROW_RELEASE",
  REFUND = "REFUND",
}
```

| Tür | Fatura/İade | KDV | Şablondan | Not |
|-----|-------------|-----|-----------|-----|
| `SAAS_LICENSE` | Satış faturası | Profil'e göre | `ALLOWED_LINE_TEMPLATES.SAAS_LICENSE_PLATFORM` | Teknokent istisna uygun |
| `PENALTY_INDEMNITY` | Satış faturası | YMM kararı | `ALLOWED_LINE_TEMPLATES.PENALTY_INDEMNITY` | Ayrı template |
| `ESCROW_RELEASE` | Mahsup fişi | KDV'siz | Escrow transferi | Bilanço hareketi |
| `REFUND` | İade faturası | Profil'e göre | İade şablonu | Tam tersi kayıt |

---

## 6) Bölüm 5 — Şirket Ayrımı & Escrow

### 6.1 Legal Entity Modeli

```typescript
enum LegalEntity {
  COMPANY_A_SAAS = "A",        // Yazılım lisansı, platform hizmetleri
  COMPANY_B_OPS = "B",         // Operasyon, escrow, ödeme altyapısı
}

interface EntityAssignment {
  billingEventKind: BillingKind;
  issuingEntity: LegalEntity;   // Hangi şirket fatura keser
  escrowEntity: LegalEntity;    // Hangi şirket escrow sözleşmesinde taraf
  ledgerAccountType: "REVENUE" | "ESCROW_POOL" | "PAYABLE";
}
```

| İşlem Türü | Fatura Eden | Escrow | Ledger Tipi |
|------------|-------------|--------|-------------|
| SaaS Lisans | A | B (ops altyapı) | REVENUE |
| Hemen Al Provizyon | — | B | ESCROW_POOL |
| KKA Data Room | A | B | REVENUE |
| Cayma Tazminatı | B | B | PAYABLE |

### 6.2 Escrow Havuz (BDDK Lisanslı Havuz Modeli)

```typescript
interface EscrowLedgerEntry {
  id: string;
  escrowPoolId: string;        // BDDK lisanslı havuz referansı
  transactionId: string;
  amount: Decimal;
  direction: "IN" | "OUT";
  status: "blocked" | "released" | "captured" | "refunded";
  isRevenueRecognized: boolean; // FALSE — escrow gelir sayılmaz
  glExportCode: string;         // Muhasebe export şeması kodu
  createdAt: DateTime;
}
```

> ⚠️ **Bilanço / GL Export Şeması** muhasebe departmanı ile tanımlanır; kod sadece `glExportCode` taşır. "Gelir sayma" flag'i (`isRevenueRecognized`) her escrow kaydında `FALSE` olarak başlar; sadece `SAAS_LICENSE` faturası kesildiğinde `TRUE` olur.

---

## 7) Prisma / DB Model (Temiz Taslak)

```prisma
// Prisma Schema — İhaleAL Tax & Billing Core

model BillingEvent {
  id                      String   @id @default(cuid())
  userId                  String
  propertyId              String?
  kind                    BillingKind
  currency                String   @default("TRY")
  baseAmountTry           Decimal  @db.Decimal(18, 2)
  vatRate                 Decimal  @db.Decimal(5, 4)
  vatAmountTry            Decimal  @db.Decimal(18, 2)
  totalAmountTry          Decimal  @db.Decimal(18, 2)
  isTeknokentExempt       Boolean  @default(false)
  exemptionCode           String?  // Örn: "350"
  revenueTemplateId       String
  teknokentProjectCode    String?
  parasutInvoiceId        String?
  actualDealAmountTry     Decimal? @db.Decimal(18, 2)
  declaredTapuAmountTry   Decimal? @db.Decimal(18, 2)
  takasbankSynced         Boolean  @default(false)
  takasbankAmountTry      Decimal? @db.Decimal(18, 2)
  amountMismatch          Boolean  @default(false)
  legalEntityId           String   @default("A") // A=SaaS, B=Ops
  escrowPoolId            String?
  isRevenueRecognized     Boolean  @default(false)
  auditLogId              String?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@index([userId, kind])
  @@index([parasutInvoiceId])
  @@index([createdAt])
}

enum BillingKind {
  HEMEN_AL
  KAT_KARSILIGI_SERVICE
  RENTAL_SAAS
  SALE_SAAS
  PENALTY_INDEMNITY
  ESCROW_RELEASE
  REFUND
}

model RevenueTemplate {
  id                String   @id @default(cuid())
  sku               String   @unique
  descriptionTr     String
  descriptionEn     String
  defaultVatRate    Decimal  @db.Decimal(5, 4)
  eligibleForTeknokent Boolean @default(false)
  forbiddenTermCheck Boolean @default(true)
  approvedBy        String
  approvedAt        DateTime
  isActive          Boolean  @default(true)
}

model TaxProfile {
  id                  String   @id @default(cuid())
  name                String
  isTeknokentExempt   Boolean  @default(false)
  exemptionCode       String?
  effectiveFrom       DateTime
  effectiveTo         DateTime?
  isActive            Boolean  @default(true)
}

model YiUfeRecord {
  id          String   @id @default(cuid())
  yearMonth   String   @unique // "YYYY-MM"
  indexValue  Decimal  @db.Decimal(18, 6)
  source      String   // "tuik_api" | "manual" | "cached"
  stale       Boolean  @default(false)
  updatedAt   DateTime @updatedAt
}

model TaxBracket {
  id        String   @id @default(cuid())
  year      Int
  limit     Decimal  @db.Decimal(18, 2)
  rate      Decimal  @db.Decimal(5, 4)
  createdAt DateTime @default(now())

  @@unique([year, limit])
}

model SettlementRecord {
  id                String   @id @default(cuid())
  transactionId     String   @unique
  actualBiddingValue Decimal @db.Decimal(18, 2)
  tapuDeclaredValue Decimal? @db.Decimal(18, 2)
  takasbankAmount   Decimal? @db.Decimal(18, 2)
  takasbankApiResponse Json?
  amountMismatch    Boolean  @default(false)
  mismatchSeverity  String   @default("none") // "none" | "warning" | "critical"
  status            String   @default("pending")
  createdAt         DateTime @default(now())
  resolvedAt        DateTime?
  resolvedBy        String?
}

model AuditLog {
  id          String   @id @default(cuid())
  action      String   // "invoice_created", "template_changed", "exemption_override"
  actorId     String
  actorType   String   // "system" | "admin" | "user"
  targetId    String   // BillingEventId veya InvoiceId
  payload     Json     // Değişiklik öncesi/sonrası diff
  reason      String?  // Admin override sebebi
  secondApproverId String? // Maker-checker: ikinci onaylayıcı
  createdAt   DateTime @default(now())
}

model ChatComplianceFlag {
  id              String   @id @default(cuid())
  messageId       String
  threadId        String
  senderId        String
  flaggedKeywords String[]
  modelScore      Decimal  @db.Decimal(5, 4)
  severity        String   // "low" | "medium" | "high"
  adminReviewed   Boolean  @default(false)
  adminDecision   String?  // "approved" | "rejected" | "false_positive"
  createdAt       DateTime @default(now())
}
```

---

## 8) Servis Katmanı (TypeScript Arayüzleri)

### 8.1 TaxSimulatorService

```typescript
class TaxSimulatorService {
  // Pure: dış bağımlılık yok, test edilebilir
  estimate(input: TaxSimulatorInput, deps: {
    yiUfeRecords: YiUfeRecord[];
    taxBrackets: TaxBracket[];
    config: TaxConfig;
  }): CostBreakdown;

  // Yardımcı pure fonksiyonlar
  private indexCost(purchasePrice: Decimal, purchaseYM: string, saleYM: string, records: YiUfeRecord[]): Decimal;
  private calculateGV(taxableGain: Decimal, brackets: TaxBracket[]): { taxAmount: Decimal; bracketsApplied: Array<...> };
  private calculateDeedDuty(salePrice: Decimal, config: TapuDutyConfig): { buyer: Decimal; seller: Decimal };
}
```

### 8.2 InvoiceComposer

```typescript
class InvoiceComposer {
  compose(billingEvent: BillingEvent, context: {
    template: RevenueTemplate;
    taxProfile: TaxProfile;
    customer: CustomerInfo;
  }): UBLPayload;

  private buildUBLLineItems(lines: InvoiceLineItem[]): UBLLineItem[];
  private addExemptionNote(ubl: UBLPayload, code?: string): UBLPayload;
  private generateUBLHash(ubl: UBLPayload): string;
}
```

### 8.3 TakasbankReconciliationService

```typescript
class TakasbankReconciliationService {
  // Side-effect: API çağrısı
  verify(transactionId: string): Promise<{
    matched: boolean;
    diffAmount: Decimal;
    severity: "none" | "warning" | "critical";
    settlementRecord: SettlementRecord;
  }>;

  // Batch
  verifyBatch(transactionIds: string[]): Promise<BatchReconcileResult>;
}
```

### 8.4 ComplianceNlpService

```typescript
class ComplianceNlpService {
  // Async queue'da çalışır; anlık cevap gerekmez
  scoreChatMessage(text: string): Promise<ChatRiskSignal>;

  // Model eğitim verisi ekleme (admin onaylı mesajlar)
  trainFalsePositive(messageId: string, adminId: string): Promise<void>;
}
```

---

## 9) Güvenlik & Denetim

### 9.1 Audit Log

Tüm fatura oluşturma işlemleri `AuditLog` tablosuna yazılır:
- Kim (actorId)
- Hangi template (revenueTemplateId)
- Hangi exemption flag (isTeknokentExempt, exemptionCode)
- Değişiklik öncesi/sonrası diff (payload JSON)

### 9.2 Admin Override (Maker-Checker)

```typescript
interface AdminOverride {
  billingEventId: string;
  requestedBy: string;          // Birinci admin (maker)
  approvedBy: string;            // İkinci admin (checker) — zorunlu
  reason: string;               // Sebep zorunlu, min 20 karakter
  oldValue: Json;
  newValue: Json;
  approvedAt: DateTime;
}
```

**Kural:** Tek admin fatura bloke kaldırma, KDV istisna kodu değiştirme, tutar değiştirme gibi kritik aksiyonları yapamaz. İki kişi onayı zorunludur.

---

## 10) Teslimat Çıktıları (Checklist)

| # | Çıktı | Durum | Yer |
|---|-------|-------|-----|
| 1 | `FINANCE_TAX_CORE.md` (bu dosya) | ✅ | `docs/FINANCE_TAX_CORE.md` |
| 2 | Prisma şema + migration planı | ✅ | `prisma/schema.prisma` (diff) |
| 3 | `TaxSimulatorService` + 20+ unit test | ✅ | `src/lib/tax/TaxSimulatorService.ts` + `*.test.ts` |
| 4 | Payment webhook → BillingEvent sequence diagram | ✅ | Bu doküman Bölüm 5.1 |
| 5 | "Bilgilendirme / Tahmin" vs "Resmi Vergi" UI disclaimer | ✅ | `src/components/tax/TaxDisclaimerBanner.tsx` |
| 6 | `InvoiceComposer` (UBL payload) | ✅ | `src/lib/finance/InvoiceComposer.ts` |
| 7 | `TakasbankReconciliationService` | ✅ | `src/lib/finance/TakasbankReconciliationService.ts` |
| 8 | `ComplianceNlpService` | ✅ | `src/lib/compliance/ComplianceNlpService.ts` |
| 9 | `featureFlag`: `billing_v2_enabled` | ✅ | Her servis girişinde kontrol |

---

## 11) Bilinçli Çelişki Yönetimi

Mevcut kodda (`fees.ts`, `commission/engine.ts`) bazı senaryolarda KDV %20 gösterimi vardır. Bu dokümandaki **istisna** senaryosu ile çakışırsa:

**Kural:** `tax_profile` seçimine göre **tek doğruluk** — çifte KDV hesabı üretilmez.

```typescript
function resolveTaxRate(template: RevenueTemplate, profile: TaxProfile): Decimal {
  if (profile.isTeknokentExempt && template.eligibleForTeknokent) {
    return new Decimal(0); // KDV istisna
  }
  return template.defaultVatRate; // Standart KDV (örn. %20)
}
```

> ⚠️ `billing_v2_enabled` feature flag'i `true` olmadan hiçbir yeni fatura üretimi aktif olmaz. Eski komisyon motoru (`commission/engine.ts`) ile yeni `InvoiceComposer` paralel çalışmaz; flag açıldığında tam geçiş yapılır.

---

## 12) Quick Reference: Hukuki Onay Gerektiren Alanlar

| Konu | Kod İçindeki Yer | Gerekli Onay |
|------|-----------------|-------------|
| Fatura satır açıklaması | `ALLOWED_LINE_TEMPLATES.*.tr` | YMM + Avukat |
| KDV istisna kodu "350" | `exemptionCode` field | YMM + Teknokent Yönetimi |
| Teknokent KDV istisna uygunluğu | `isTeknokentExempt` flag | Teknokent Yönetimi + Sözleşme |
| Cayma tazminatı KDV'si | `PENALTY_INDEMNITY` template | YMM |
| 5 yıl GV istisna kuralı | `FIVE_YEAR_RULE_MODE` | YMM |
| Tapu harcı oranı | `TAPU_DUTY_CONFIG` | Tapu Sicil + Belediye |
| Escrow gelir sayımı | `isRevenueRecognized` | YMM + Denetçi |
| Şirket A/B ayrımı | `LegalEntity` enum | Avukat + Şirketler Müdürlüğü |
| Düşük gösterim uyarı metni | `AmountConsentPayload` disclaimer | Avukat |

---

*Bu doküman İhaleAL finansal çekirdeğinin teknik tasarım rehberidir. Tüm vergi sonuçları ve hukuki yorumlar YMM + avukat onayına tabidir.*

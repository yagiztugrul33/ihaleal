/** Mega içerik paketi — TS arabirimleri (JSON yerine tek kaynak). */

/** SSS ürün spec — 5 kategori: Hesap/KYC, Üyelik, İhale, Komisyon, Emlakçı */
export type FaqCategoryId = "account_kyc" | "membership" | "auction_flow" | "commission" | "realtor";

export interface MegaFaqItem {
  id: string;
  categoryId: FaqCategoryId;
  /** Gösterim sırası (1–40). */
  order: number;
  question: string;
  answer: string;
}

export interface MegaFaqCategory {
  id: FaqCategoryId;
  title: string;
  description: string;
}

export interface MegaBlogAuthor {
  name: string;
  role?: string;
}

export type MegaBlogCategory =
  | "ihale"
  | "komisyon"
  | "ortaklik"
  | "hesap-guvenlik"
  | "teknik"
  | "politika"
  | "hukuk";

export interface MegaBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO tarih */
  publishedAt: string;
  /** Liste ve filtre için ana kategori. */
  category: MegaBlogCategory;
  tags: string[];
  /** Markdown olmayan düz paragraflar */
  paragraphs: string[];
  author: MegaBlogAuthor;
  /** Demo metni işaretleri */
  is_demo_content?: boolean;
}

/** Ortaklık başvuru formu gönderimi (istemci tarafı). */
export interface RealtorPartnershipPayload {
  companyLegalName: string;
  taxIdOrTc: string;
  email: string;
  phone: string;
  city: string;
  licenseCertificateUrlHint?: string;
  notes: string;
  kvkkAccepted: boolean;
  submittedAt: string;
}

export type KycSimulationStepId = "account" | "phone_otp" | "identity_match" | "risk_review";

export interface KycSimulationStep {
  id: KycSimulationStepId;
  title: string;
  description: string;
}

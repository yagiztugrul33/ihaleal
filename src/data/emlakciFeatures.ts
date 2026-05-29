import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Shield,
  Upload,
  Brain,
  BarChart3,
  Webhook,
  Coins,
  ShieldCheck,
} from "lucide-react";

export type EmlakciFeatureSlug =
  | "multi-tenant"
  | "rol-yetki"
  | "toplu-ilan"
  | "ai-fiyat"
  | "analytics"
  | "webhook-api"
  | "komisyon"
  | "kyc";

export interface EmlakciFeature {
  slug: EmlakciFeatureSlug;
  title: string;
  shortDesc: string;
  detail: string;
  bullets: string[];
  icon: LucideIcon;
}

export const EMLAKCI_FEATURES: EmlakciFeature[] = [
  {
    slug: "multi-tenant",
    title: "Multi-Tenant Portföy",
    shortDesc: "Tüm ofislerinizi tek panelden yönetin. Her ofis kendi ilanlarını, ekibini ve performansını görür.",
    detail:
      "Çok şubeli emlak grupları için tasarlanmış tenant mimarisi. Her ofis izole veri alanında çalışır; merkez yönetim tüm portföyü konsolide görür.",
    bullets: [
      "Ofis bazlı alt alan ve marka ayarları",
      "Merkezden ilan ve ekip ataması",
      "Şube performans panosu",
      "Tek oturumla çok ofis geçişi",
    ],
    icon: Building2,
  },
  {
    slug: "rol-yetki",
    title: "Rol Bazlı Yetki",
    shortDesc: "Owner, Admin, Manager, Agent, Viewer rolleri. Her kullanıcı sadece görmesi gerekeni görür.",
    detail:
      "Kurumsal erişim modeli; hassas finansal ve müşteri verilerini rol matrisiyle korur. Denetim izi her kritik işlemde tutulur.",
    bullets: [
      "Beş katmanlı hazır rol şablonu",
      "Özel izin setleri",
      "İki aşamalı onay (opsiyonel)",
      "Oturum ve cihaz politikaları",
    ],
    icon: Shield,
  },
  {
    slug: "toplu-ilan",
    title: "Toplu İlan Yükleme",
    shortDesc: "CSV veya Excel ile yüzlerce ilanı saniyede yükleyin. AI sanity check ve duplicate kontrolü dahil.",
    detail:
      "Mevcut CRM veya Excel arşivinizi dakikalar içinde platforma taşıyın. Yükleme öncesi ve sonrası otomatik kalite kontrolleri hata oranını düşürür.",
    bullets: [
      "Şablon indirme ve alan eşleme",
      "Duplicate ve eksik alan uyarıları",
      "Toplu fotoğraf paketi",
      "Yükleme raporu ve geri alma",
    ],
    icon: Upload,
  },
  {
    slug: "ai-fiyat",
    title: "AI Destekli Fiyat",
    shortDesc: "Türkiye gayrimenkul verisi üzerinde eğitilmiş model. Piyasa karşılaştırması, güven aralığı.",
    detail:
      "Bölge, m², kat, cephe ve son işlem verileriyle önerilen fiyat aralığı. Danışmanınızın teklifini destekleyen şeffaf gerekçe kartı.",
    bullets: [
      "Mahalle ve ilçe endeks karşılaştırması",
      "Güven aralığı ve sapma uyarısı",
      "İlan başına fiyat geçmişi",
      "API ile CRM entegrasyonu",
    ],
    icon: Brain,
  },
  {
    slug: "analytics",
    title: "Detaylı Analytics",
    shortDesc: "İlan başına görüntülenme, lead, dönüşüm. Ofis bazlı performans, ajan bazlı leaderboard.",
    detail:
      "Operasyon ekibiniz için gerçek zamanlı KPI panosu. Hangi ilanın lead ürettiğini, hangi danışmanın dönüşüm sağladığını tek ekranda izleyin.",
    bullets: [
      "İlan ve ofis hunisi",
      "Lead kaynağı kırılımı",
      "Ajan leaderboard",
      "Dışa aktarım (CSV, webhook)",
    ],
    icon: BarChart3,
  },
  {
    slug: "webhook-api",
    title: "Webhook ve REST API",
    shortDesc: "Mevcut CRM'inize entegre edin. Yeni ilan, yeni teklif, KYC durumu — anlık webhook bildirimi.",
    detail:
      "Kurumsal entegrasyon katmanı; Salesforce, özel CRM veya back-office sistemlerinize olay tabanlı veri akışı sağlar.",
    bullets: [
      "REST API ve OAuth2 hazırlığı",
      "İmzalı webhook payload",
      "Sandbox ve üretim anahtarları",
      "Rate limit ve SLA dokümantasyonu",
    ],
    icon: Webhook,
  },
  {
    slug: "komisyon",
    title: "Komisyon Paylaşımı",
    shortDesc: "Çok ofisli yapılarda otomatik komisyon split. Şeffaf, denetlenebilir, denkleştirilebilir.",
    detail:
      "Ortak satış ve referans senaryolarında komisyon kurallarını önceden tanımlayın; kapanış sonrası otomatik bölüşüm raporu üretin.",
    bullets: [
      "Kural tabanlı split şablonları",
      "Onay akışı",
      "Muhasebe dışa aktarımı",
      "Geçmiş işlem arşivi",
    ],
    icon: Coins,
  },
  {
    slug: "kyc",
    title: "KYC ve Doğrulama",
    shortDesc: "Mernis, Findeks, tapu doğrulama. Doğrulanmış ilanlar daha hızlı satılır.",
    detail:
      "Alıcı ve satıcı kimlik doğrulama süreçlerini platform içinde yönetin. Uyum ekibi için durum panosu ve saklama politikası uyumu.",
    bullets: [
      "Kimlik ve telefon OTP",
      "Tapu ve yetki belgesi kontrolü",
      "Risk skoru (demo / üretim ayrımı)",
      "KYC durumu webhook",
    ],
    icon: ShieldCheck,
  },
];

export const EMLAKCI_FEATURE_MAP = Object.fromEntries(
  EMLAKCI_FEATURES.map((f) => [f.slug, f]),
) as Record<EmlakciFeatureSlug, EmlakciFeature>;

export const EMLAKCI_PLANS = [
  {
    name: "Free",
    price: "₺0",
    suited: "Bireysel emlakçılar",
    features: ["5 ilan/ay", "Temel AI fiyat", "E-posta destek"],
    highlighted: false,
  },
  {
    name: "Agency",
    price: "₺2.490",
    suited: "Boutique ofisler (1–10 kişi)",
    features: ["100 ilan/ay", "5 ekip üyesi", "Toplu yükleme", "Öncelikli destek", "AI kota 500/ay"],
    highlighted: false,
  },
  {
    name: "GYO",
    price: "₺7.490",
    suited: "GYO ve gruplar (10–50 kişi)",
    features: [
      "Sınırsız ilan",
      "25 ekip üyesi",
      "API erişimi",
      "Webhook",
      "AI kota 2000/ay",
      "Özel hesap yöneticisi",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Özel",
    suited: "RE/MAX, büyük gruplar (50+)",
    features: ["Sınırsız her şey", "Sınırsız ekip", "Özel SLA", "White-label opsiyonu", "Kurumsal sözleşme"],
    highlighted: false,
  },
] as const;

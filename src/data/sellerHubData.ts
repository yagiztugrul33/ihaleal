/** Bilgilendirme verisi — hukuki bağlayıcılık için avukat onayı gerekir. */

import { feeBadgeLabel } from "@/lib/fees";

export type SellerModeId = "browse" | "listing_only" | "auction_only" | "listing_then_auction" | "full_mandate";

export interface SellerMode {
  id: SellerModeId;
  title: string;
  subtitle: string;
  uiSummary: string;
  steps: string[];
  documents: string[];
  legalNote: string;
}

export const SELLER_MODES: SellerMode[] = [
  {
    id: "browse",
    title: "Üye — sadece ilan ve ihale izleme",
    subtitle: "Teklif vermez, satmaz; bildirim ve favori.",
    uiSummary: "Minimal doğrulama (e-posta / telefon). Findeks zorunlu değil.",
    steps: ["Kayıt ol", "Tercih: Alıcı / İzleyici", "Favori ve arama"],
    documents: ["Kimlik (ilk teklif aşamasında genişletilir — üretim kuralı)"],
    legalNote: "Canlı teklif için ayrı KYC şartı backend’de tanımlanmalıdır.",
  },
  {
    id: "listing_only",
    title: "Sadece ilan (kartta ihaleal.com — üç moddan biri)",
    subtitle: "Açık artırma yok; hedef gelir yalnızca başarılı işlem komisyonu (ilan paketi ücreti yok — patron).",
    uiSummary: "İlan formu, foto, fiyat; kartta taraf telefonu yok, muhatap platform.",
    steps: ["Mod seç: Sadece ilan", "Gayrimenkul bilgisi + foto", "Yayınla", "İsteğe bağlı: sonra ihaleye çevir"],
    documents: ["Tapu özeti veya bilgi formu", "Yetkili kimlik", "İmar / iskan (kategori bazlı opsiyonel)"],
    legalNote: "Yayınlanan metin için sorumluluk reddi ve KVKK aydınlatması şart.",
  },
  {
    id: "auction_only",
    title: "Doğrudan ihale ile satış",
    subtitle: "Doğrudan ihale süreci; ilan listeleme ücreti hedefi yok.",
    uiSummary: "Başlangıç bedeli, süre, teminat; teklif kuralları.",
    steps: ["Mod: Doğrudan ihale", "Ekspertiz + tapu kontrolü", "Teminat yolu", "İhale takvimi"],
    documents: ["Tam tapu kaydı", "Findeks (hedef — API ile)", "Gelir / teminat belgeleri", "Şirket ise ticaret sicil + yetki"],
    legalNote: "İhale şartnamesi avukat onaylı PDF; İİK / TBK çerçevesinde özelleştirme.",
  },
  {
    id: "listing_then_auction",
    title: "Önce ilan, sonra ihaleye çevir",
    subtitle: "Sahibinden akışına yakın + ihale aşaması.",
    uiSummary: "Tek ilan kartı; ‘İhale başlat’ butonu ikinci fazda açılır.",
    steps: ["İlan yayınla", "Alıcı ilgisi topla", "Eşik sağlandığında ihale moduna geç", "Katılımcı KYC"],
    documents: ["İlan fazı: temel tapu + kimlik", "İhale fazı: Findeks + teminat + ekspertiz güncellemesi"],
    legalNote: "İki faz için ayrı sözleşme ekleri (avukat).",
  },
  {
    id: "full_mandate",
    title: "Sanal emlakçı — bize yetki (e-Devlet / vekalet hedefi)",
    subtitle: "Satışı platform adına yürütme vizyonu.",
    uiSummary: "Yetki adımları, KEP, vekaletname şablonları (placeholder).",
    steps: ["Sözleşme taslağı indir", "Noter / e-imza ile yetki (üretim)", "Banka ve tapu süreçleri", "Komisyon mahsubu"],
    documents: ["Noter vekaletname taslağı", "Kimlik", "Tapu", "Vergi levhası (şirket)", "KEP adresi beyanı"],
    legalNote: "e-Devlet üzerinden yetki: resmi API + baro uyumu olmadan iddia edilmemeli.",
  },
];

export const PRICING_COMPARISON = {
  disclaimer:
    "Rakip ücretleri pazara göre değişir; aşağıdaki rakamlar örnek iş modeli taslağıdır. Yayınlamadan muhasebe + hukuk onayı alın.",
  rows: [
    { label: "İlan listeleme / vitrin paketi (kullanıcıya)", ihaleal: "Hedef: ücret yok (patron)", sahibinden: "Örn. segment bazlı paket ücreti", note: "ihaleal ürün vaadi" },
    { label: "Öne çıkarma / doping (kullanıcıya)", ihaleal: "Hedef: satılmaz (patron)", sahibinden: "Yaygın ücretli opsiyonlar", note: "Şirket içi kampanya ayrı" },
    { label: "Başarılı satış — ihale", ihaleal: `${feeBadgeLabel()} (fees.ts)`, sahibinden: "Komisyon / ilan modeli farklı", note: "Sözleşmede net" },
    { label: "Başarılı satış — sadece ilan", ihaleal: "%1,25 + KDV (hedef)", sahibinden: "Karşılaştırmalı teklif iste", note: "Hukuki çerçeve" },
    { label: "Ekspertiz platform komisyonu", ihaleal: "Sabit ₺ veya %", sahibinden: "—", note: "Anlaşmalı eksper" },
  ],
};

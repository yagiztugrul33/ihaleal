export type ConsistencyRule = {
  id: string;
  title: string;
  detail: string;
};

export const PLATFORM_CONSISTENCY_RULES: ConsistencyRule[] = [
  {
    id: "single-property-single-mode",
    title: "Tek mülk, tek mod, tek fiyat",
    detail: "Bir mülk aynı anda hem standart hem borsa modunda açık olamaz.",
  },
  {
    id: "single-core",
    title: "Tek çekirdek akış",
    detail: "Teklif, ödeme ve escrow akışları aynı çekirdek servisleri çağırır.",
  },
  {
    id: "single-commission",
    title: "Tek komisyon kuralı",
    detail: "Satıcı %2 + alıcı %2 + KDV tek kaynak olarak fees/taxConfig üzerinden yönetilir.",
  },
  {
    id: "platform-does-not-hold-money",
    title: "Platform para tutmaz",
    detail: "Para lisanslı PSP escrow hattında tutulur; platform sadece orkestrasyon sağlar.",
  },
  {
    id: "mock-labeling",
    title: "Mock veri işaretleme",
    detail: "Demo para, skor, bildirim ve hukuk metinleri açıkça demo/taslak olarak etiketlenir.",
  },
  {
    id: "auction-branding-boundary",
    title: "Borsa marka dili sınırı",
    detail: "UI'de 'borsa' deneyim adıdır; hukuki tanım ticaret/açık artırma platformudur.",
  },
  {
    id: "simple-surface-deep-compliance",
    title: "Basit yüzey, derin uyum",
    detail: "Kullanıcı akışı sade kalır; KVKK/AML/ceza-süre tabloları işlem öncesi görünür.",
  },
  {
    id: "not-investment-advice",
    title: "Yatırım tavsiyesi değildir",
    detail: "AI/analiz/metrik çıktıları bilgilendirme amaçlıdır; uzman görüşü yerine geçmez.",
  },
  {
    id: "country-module-readiness",
    title: "Ülke modülü hazırlığı",
    detail: "Vergi/komisyon oranları parametrik tutulur; mevzuat değişimi uzman onayıyla uygulanır.",
  },
  {
    id: "broker-partner-positioning",
    title: "Emlakçıya rakip değil ortak",
    detail: "Platform dili ve akışları emlakçıyı dışlamaz; partner/B2B rolü net korunur.",
  },
];


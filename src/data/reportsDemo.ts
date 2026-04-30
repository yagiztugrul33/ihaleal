/** Demo analiz ve bilgilendirme belgeleri — gerçek PDF bağlantısı yok. */

export type DemoReport = {
  id: string;
  title: string;
  category: "piyasa" | "operasyon" | "uyumluluk";
  excerpt: string;
  updatedAt: string;
  readingMinutes: number;
  body: string[];
};

export const DEMO_REPORTS: DemoReport[] = [
  {
    id: "gm-endeks-q1",
    title: "Gayrimenkul talebi — bölgeler arası özet (demo)",
    category: "piyasa",
    excerpt:
      "İstanbul ve Ankara için talep göstergeleri ve liste süresi varsayımları; kesin veri değildir.",
    updatedAt: "2026-03-15",
    readingMinutes: 8,
    body: [
      "Bu metin tanıtım ve demo amaçlıdır; yatırım tavsiyesi değildir.",
      "Bölge bazlı liste süresi ve talep göstergeleri üçüncü taraf veri kaynaklarına bağlı olarak güncellenir.",
      "Üretim ortamında raporlar lisanslı sağlayıcılarla imzalı teslim edilir.",
    ],
  },
  {
    id: "komisyon-mahsusu-cebir",
    title: "Komisyon mahsup — iş hesap özeti (demo)",
    category: "operasyon",
    excerpt:
      "Mahsup çizgisinin nasıl okunduğuna dair iç kullanıcı özeti; resmi muhasebe belgesi değildir.",
    updatedAt: "2026-02-01",
    readingMinutes: 5,
    body: [
      "Üye işlem başına komisyon hesapları `src/lib/fees.ts` ile tutarlı özet sunar.",
      "Gerçek kesinti kayıtları ödeme sağlayıcısı ekstreleriyle teyit edilir.",
    ],
  },
  {
    id: "kyc-evrak-kontrol",
    title: "KYC ve evrak kontrol çizgisi (demo)",
    category: "uyumluluk",
    excerpt:
      "Kimlik doğrulama ve teminat havuzu için beklenen belge sırası; hukuki danışmanlık yerine geçmez.",
    updatedAt: "2026-01-10",
    readingMinutes: 6,
    body: [
      "Temel kimlik ve adres doğrulaması sonrası Findeks / ekspertiz istekleri tutarına göre tetiklenebilir.",
      "Üretimde KVKK ve saklama politikası güncellenmiş bilgilendirme metinleriyle birlikte sunulur.",
    ],
  },
];

export function getReportById(id: string): DemoReport | undefined {
  return DEMO_REPORTS.find((r) => r.id === id);
}

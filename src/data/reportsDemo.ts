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
    id: "piyasa-guncel-mayis-2026",
    title: "Piyasa nabzi - Mayis 2026 guncel veri ozet raporu",
    category: "piyasa",
    excerpt:
      "KFE nominal/reel ayrimi, bolgesel likidite farklari ve teklif hizinin son aylik gorunumu.",
    updatedAt: "2026-05-20",
    readingMinutes: 9,
    body: [
      "Bu rapor, kullanici panelinde gorulen fiyat ve talep sinyallerini tek yerde birlestiren guncel ozet dokumandir.",
      "KFE 2026 nominal +%26,6 ve reel -%4,3 gorunumu birlikte degerlendirildiginde bolge seciminde likidite ve kira devamligi daha kritik hale gelmektedir.",
      "Ankara tarafinda gozlenen +%36,7 nominal sapma, tek basina karar gerekcesi degil; satis hizi ve gelir devamliligi ile birlikte okunmalidir.",
      "Bu icerik bilgilendirme amaclidir; baglayici yatirim veya hukuk gorusu olarak kullanilmamalidir.",
    ],
  },
  {
    id: "gm-endeks-q1",
    title: "Gayrimenkul talebi — bölgeler arası özet (demo)",
    category: "piyasa",
    excerpt:
      "İstanbul ve Ankara için talep göstergeleri ve liste süresi varsayımları; kesin veri değildir.",
    updatedAt: "2026-05-10",
    readingMinutes: 8,
    body: [
      "Bu metin tanıtım ve demo amaçlıdır; yatırım tavsiyesi değildir.",
      "KFE 2026 referansı: nominal +%26,6, reel -%4,3; Ankara yıllık nominal +%36,7 örnek veri olarak izlenmiştir.",
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
    updatedAt: "2026-05-08",
    readingMinutes: 5,
    body: [
      "Üye işlem başına komisyon hesapları `src/lib/fees.ts` ile tutarlı özet sunar.",
      "Satış senaryosunda matrah, KDV ve emlakçı paylaşımı ayrı satırlarda okunmalıdır; tek toplam rakam yanıltıcı olabilir.",
      "Gerçek kesinti kayıtları ödeme sağlayıcısı ekstreleriyle teyit edilir.",
    ],
  },
  {
    id: "kyc-evrak-kontrol",
    title: "KYC ve evrak kontrol çizgisi (demo)",
    category: "uyumluluk",
    excerpt:
      "Kimlik doğrulama ve teminat havuzu için beklenen belge sırası; hukuki danışmanlık yerine geçmez.",
    updatedAt: "2026-05-05",
    readingMinutes: 6,
    body: [
      "Temel kimlik ve adres doğrulaması sonrası Findeks / ekspertiz istekleri tutarına göre tetiklenebilir.",
      "Yüksek riskli işlemlerde manuel inceleme kuyruğu ve delil kayıtları (zaman damgası, oturum izi) birlikte ele alınmalıdır.",
      "Üretimde KVKK ve saklama politikası güncellenmiş bilgilendirme metinleriyle birlikte sunulur.",
    ],
  },
  {
    id: "deprem-dayaniklilik-bolge-notu",
    title: "Deprem dayaniklilik bolge notu (demo)",
    category: "piyasa",
    excerpt:
      "Zemin sinifi, bina yasi ve guclendirme sinyallerinin birlikte okunmasi icin yonetici ozeti.",
    updatedAt: "2026-05-12",
    readingMinutes: 7,
    body: [
      "Deprem riskini tek bir puanla degil, yapi + zemin + mevzuat + sigorta katmanlariyla birlikte yorumlamak gerekir.",
      "Bina yasina dayali kaba eleme, yaniltici olabilir; guclendirme gecmisi ve proje notlari birlikte incelenmelidir.",
      "Bu rapor bilgilendirme amaclidir; kesin teknik kanaat icin lisansli uzman raporu gerekir.",
    ],
  },
  {
    id: "kiralik-getiri-senaryolari",
    title: "Kiralik getiri senaryolari (demo)",
    category: "operasyon",
    excerpt:
      "Brut/net getiri, bosluk riski ve gider kalemleriyle uc senaryolu yatirim okuma notu.",
    updatedAt: "2026-05-15",
    readingMinutes: 6,
    body: [
      "Brut kira getirisi sadece ilk sinyaldir; net getiri icin bos kalma suresi ve isletme giderleri mutlaka eklenmelidir.",
      "Temkinli senaryoda gelir dususu ve gider artisi birlikte test edilmelidir.",
      "Bu rapor yatirim tavsiyesi degildir; mali mustavir gorusu ile birlikte degerlendirilmelidir.",
    ],
  },
];

export function getReportById(id: string): DemoReport | undefined {
  return DEMO_REPORTS.find((r) => r.id === id);
}

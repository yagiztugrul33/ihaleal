export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type RealEstateGuide = {
  slug: string;
  title: string;
  summary: string;
  sections: GuideSection[];
  relatedTool: { label: string; path: string };
  seoDescription: string;
};

export const REAL_ESTATE_GUIDES: RealEstateGuide[] = [
  {
    slug: "ev-alirken-dikkat-edilecekler",
    title: "Ev alırken dikkat edilecekler",
    summary: "Konut satın alma öncesi kontrol listesi: tapu, iskan, bölge ve finansman.",
    seoDescription: "Ev alırken tapu, iskan, bölge analizi ve finansman kontrol listesi — ihaleal.com rehberi.",
    relatedTool: { label: "İlan ara", path: "/arama" },
    sections: [
      {
        heading: "Tapu ve mülkiyet",
        paragraphs: [
          "Tapu kaydında satıcı ile imza sahibinin aynı kişi olduğunu doğrulayın. Şerh, haciz ve ipotek kayıtlarını tapu müdürlüğünden veya e-Devlet üzerinden sorgulayın.",
          "Kat mülkiyeti veya kat irtifakı durumunu, arsa payını ve ortak alanları sözleşmede netleştirin.",
        ],
      },
      {
        heading: "Bina ve iskan",
        paragraphs: [
          "Yapı kullanma izin belgesi (iskan) olup olmadığını kontrol edin. Deprem yönetmeliğine uygunluk ve bina yaşı önemli risk göstergeleridir.",
          "Aidat, yakıt ve ortak gider kalemlerini satıcıdan yazılı alın.",
        ],
      },
      {
        heading: "Bölge ve değer",
        paragraphs: [
          "Mahalle fiyat bandını İhaleal Endeksi ve benzer ilanlarla karşılaştırın. Ulaşım, okul ve yeşil alan mesafelerini saha ziyaretinde not edin.",
        ],
      },
    ],
  },
  {
    slug: "ihaleye-nasil-girilir",
    title: "İhaleye nasıl girilir",
    summary: "Platform ihalelerine katılım adımları, teminat ve teklif kuralları.",
    seoDescription: "Gayrimenkul ihalelerine nasıl katılınır; teminat, teklif ve süreç rehberi — ihaleal.com.",
    relatedTool: { label: "Aktif ihaleler", path: "/ihaleler" },
    sections: [
      {
        heading: "Hesap ve KYC",
        paragraphs: [
          "Üye olun ve kimlik doğrulama (KYC) adımlarını tamamlayın. İhale katılımı için geçerli iletişim bilgileri zorunludur.",
        ],
      },
      {
        heading: "Teminat ve teklif",
        paragraphs: [
          "İlan detayında belirtilen teminat oranına göre kapora yatırın. Teklifler bağlayıcıdır; vermeden önce AI analiz ve ekspertiz özetini inceleyin.",
          "Son dakika tekliflerinde süre uzatma kuralı uygulanabilir — ilan şartlarını okuyun.",
        ],
      },
      {
        heading: "Kazanma sonrası",
        paragraphs: [
          "Kazanan teklif sahibi ödeme takvimine uymalıdır. Tapu devri için gerekli evrak listesine /evraklar sayfasından ulaşın.",
        ],
      },
    ],
  },
  {
    slug: "tapu-islemleri",
    title: "Tapu işlemleri",
    summary: "Satış öncesi ve sonrası tapu süreçleri, harçlar ve vekalet.",
    seoDescription: "Gayrimenkul tapu devri, harçlar ve resmi süreçler rehberi — ihaleal.com.",
    relatedTool: { label: "Gerekli evraklar", path: "/evraklar" },
    sections: [
      {
        heading: "Ön hazırlık",
        paragraphs: [
          "Alıcı ve satıcı kimlik belgeleri, tapu senedi, DASK poliçesi (konut) ve belediye borcu yoktur yazısı hazırlanır.",
        ],
      },
      {
        heading: "Tapu müdürlüğü",
        paragraphs: [
          "Randevu ile birlikte harç ve döner sermaye ödemeleri yapılır. Resmi satış bedeli beyanı gerçek işlem tutarıyla uyumlu olmalıdır.",
        ],
      },
    ],
  },
  {
    slug: "kredi-rehberi",
    title: "Kredi rehberi",
    summary: "Konut kredisi türleri, faiz ve ön onay süreci.",
    seoDescription: "Konut kredisi türleri, faiz ve başvuru süreci — ihaleal.com kredi rehberi.",
    relatedTool: { label: "Kredi hesaplayıcı", path: "/mortgage" },
    sections: [
      {
        heading: "Kredi türleri",
        paragraphs: [
          "Sabit faiz, değişken faiz ve karma yapıdaki konut kredilerini bankaların güncel tablolarıyla karşılaştırın.",
        ],
      },
      {
        heading: "Ön onay",
        paragraphs: [
          "İhale veya satış öncesi bankadan ön onay almak teklif gücünüzü artırır. Gelir belgesi ve kredi notu (Findeks) istenebilir.",
        ],
      },
    ],
  },
  {
    slug: "muteahhitle-anlasma",
    title: "Müteahhitle anlaşma",
    summary: "Proje satış sözleşmesi, teslim takvimi ve garanti.",
    seoDescription: "Müteahhit projelerinde sözleşme, teslim ve garanti rehberi — ihaleal.com.",
    relatedTool: { label: "Müteahhit paneli", path: "/muteahhit" },
    sections: [
      {
        heading: "Sözleşme maddeleri",
        paragraphs: [
          "Teslim tarihi, cezai şart, ödeme planı ve değişiklik talepleri sözleşmede açıkça yazılmalıdır.",
        ],
      },
      {
        heading: "Proje takibi",
        paragraphs: [
          "Ruhsat, iskan ve yapı denetim raporlarını talep edin. Platformdaki doğrulanmış projeleri /proje sayfalarından inceleyin.",
        ],
      },
    ],
  },
  {
    slug: "kira-sozlesmesi",
    title: "Kira sözleşmesi",
    summary: "Kiralık konut sözleşmesi maddeleri, depozito ve yenileme.",
    seoDescription: "Kira sözleşmesi, depozito ve haklar rehberi — ihaleal.com.",
    relatedTool: { label: "Kiralık ilanlar", path: "/kiralik/istanbul" },
    sections: [
      {
        heading: "Zorunlu maddeler",
        paragraphs: [
          "Kira bedeli, süre, depozito, aidat ve kullanım amacı yazılı olmalıdır. e-Devlet üzerinden bildirim yükümlülüklerini kontrol edin.",
        ],
      },
    ],
  },
  {
    slug: "ekspertiz-nedir",
    title: "Ekspertiz nedir",
    summary: "Gayrimenkul değerleme raporu, SPK lisanslı ekspertiz ve ne zaman gerekir.",
    seoDescription: "Gayrimenkul ekspertiz raporu nedir, ne zaman alınır — ihaleal.com rehberi.",
    relatedTool: { label: "Ekspertiz bilgi", path: "/ekspertiz" },
    sections: [
      {
        heading: "Ekspertiz türleri",
        paragraphs: [
          "Banka kredisi için SPK lisanslı değerleme kuruluşu raporu istenir. Platform AI analizi bilgilendirme amaçlıdır; resmi ekspertizin yerini tutmaz.",
        ],
      },
    ],
  },
  {
    slug: "kka-nedir",
    title: "KKA nedir",
    summary: "Kat karşılığı inşaat (KKA) modeli, arsa sahibi hakları ve riskler.",
    seoDescription: "Kat karşılığı inşaat (KKA) modeli ve arsa sahibi hakları — ihaleal.com rehberi.",
    relatedTool: { label: "KKA stüdyo", path: "/kka-hub" },
    sections: [
      {
        heading: "KKA özeti",
        paragraphs: [
          "Arsa sahibi arsasını müteahhide devreder; karşılığında projede bağımsız bölüm alır. Sözleşmede pay oranı, süre ve cezai şartlar kritiktir.",
        ],
      },
      {
        heading: "Riskler",
        paragraphs: [
          "Müteahhit iflası, gecikme ve kalite uyuşmazlığı için teminat, hakediş ve bağımsız denetim maddeleri ekleyin.",
        ],
      },
    ],
  },
];

export function findGuideBySlug(slug: string): RealEstateGuide | undefined {
  return REAL_ESTATE_GUIDES.find((g) => g.slug === slug);
}

export const GUIDE_SLUGS = REAL_ESTATE_GUIDES.map((g) => g.slug);

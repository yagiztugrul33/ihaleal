/**
 * "Nasıl çalışır?" derin içerik — /nasil-calisir rehberi.
 */

export type NasilCalisirStepSlug = "kesfet" | "teklif" | "kazan" | "teslim";

export type NasilCalisirStep = {
  slug: NasilCalisirStepSlug;
  stepNum: 1 | 2 | 3 | 4;
  title: string;
  tagline: string;
  intro: string;
  userJourney: { title: string; bullets: string[] }[];
  platformSide: { title: string; paragraphs: string[] }[];
  dataAndTrust: string[];
  risksAndLimits: string[];
  relatedRoutes: { label: string; path: string; note?: string }[];
  faq: { q: string; a: string }[];
};

export const NASIL_CALISIR_INTRO = {
  title: "Gayrimenkul ihale yolculuğu: uçtan uca çerçeve",
  lead:
    "ihaleal.com, ilan keşfinden teslimata kadar net ve tekrarlanabilir bir akış sunar. Aşağıdaki adımlar, kullanıcı aksiyonları ile platform sorumluluklarını ayrı gösterir.",
  audience:
    "Bu rehber öncelikle alıcı ve yatırımcılar içindir; satıcı, emlak danışmanı ve yönetici akışları panel ve sözleşme ekranlarında ayrıca tanımlanır.",
};

export const NASIL_CALISIR_ARCHITECTURE = {
  title: "Bilgi mimarisi: katmanlar ve sorumluluklar",
  layers: [
    {
      name: "Deneyim katmanı (web istemcisi)",
      desc: "React tabanlı istemci; ilan listesi, detay, teklif paneli, bildirim tercihleri ve hesap ayarlarını sunar. Oturum ve rota koruması, üyelik durumuna göre eylemleri açar veya yönlendirir.",
    },
    {
      name: "Uygulama kuralları",
      desc: "Minimum teklif artışı, ihale süresi, uzatma, teminat yüzdesi ve ücret matrisi gibi kurallar merkezi yapılandırmadan okunur; arayüz ile iş mantığı tutarlı kalır.",
    },
    {
      name: "Veri ve kimlik",
      desc: "Profil, favoriler, teklif geçmişi ve mesajlaşma gibi veriler hesabınıza bağlanır. Üretimde erişim denetimi ve yedekleme politikaları uygulanmalıdır.",
    },
    {
      name: "Entegrasyon ve bildirim",
      desc: "E-posta ve anlık bildirim kanalları kazanan ve kaybeden durumu için kullanılır. Ödeme ve tapu aşamalarında üçüncü taraf süreçleri sözleşmede belirtilen sırayı izler.",
    },
  ],
  flowSummary:
    "Özet akış: Keşifte ilan ve analiz okunur; teklifte kurallar doğrulanır; kapanışta kazanan üretilir; teslimatta ödeme ve hukuki adımlar tamamlanır.",
};

export const NASIL_CALISIR_STEPS: NasilCalisirStep[] = [
  {
    slug: "kesfet",
    stepNum: 1,
    title: "Keşfet",
    tagline: "İlanları inceleyin, AI analiz raporlarını okuyun",
    intro:
      "Doğru teklif, doğru bilgiyle başlar. Her ilan; konum, metrekare, yapı durumu, hukuki statü ve görsellerle sunulur. Yapay zeka destekli özetler tahmin niteliğindedir; nihai kararınızı ekspertiz ve yerinde inceleme ile pekiştirin.",
    userJourney: [
      {
        title: "Hesap ve kişiselleştirme",
        bullets: [
          "Kayıt ile favori ilanlarınızı saklayın, arama uyarılarını açın.",
          "Profilde ihale ve mesaj bildirim tercihlerinizi yönetin.",
        ],
      },
      {
        title: "İlan detayında nelere bakmalısınız?",
        bullets: [
          "Başlangıç fiyatı, minimum artış, bitiş zamanı, varsa anında satın alma.",
          "Tapu türü, imar, ipotek veya şerh uyarıları, satıcı beyanları.",
          "AI raporundaki bölge karşılaştırması ve risk işaretleri.",
        ],
      },
      {
        title: "Harita ve analiz",
        bullets: [
          "Haritada komşu ilanlar ve fiyat yoğunluğu fikri verir.",
          "Analiz sayfalarında şehir ve bölge trendlerini inceleyin.",
        ],
      },
    ],
    platformSide: [
      {
        title: "Ne sunuyoruz?",
        paragraphs: [
          "Filtreli listeleyici: fiyat, oda, ilçe, ihale tipi.",
          "AI çıktıları ilan alanlarından türetilir; güven aralığı raporda belirtilmelidir.",
        ],
      },
    ],
    dataAndTrust: [
      "KVKK kapsamında verileriniz aydınlatma metnine uygun işlenir.",
      "İlan içeriği satıcı veya temsilci tarafından yüklenir; yerinde doğrulama yine sizin sorumluluğunuzdadır.",
    ],
    risksAndLimits: [
      "AI kesin değer bildirimi değildir.",
      "İlan metinleri güncel olmayabilir; kritik konularda resmi belge isteyin.",
    ],
    relatedRoutes: [
      { label: "İhale listesi", path: "/ihaleler" },
      { label: "İlan listesi", path: "/ilanlar" },
      { label: "Analiz", path: "/analiz" },
      { label: "Harita", path: "/harita" },
    ],
    faq: [
      {
        q: "AI raporuna güvenebilir miyim?",
        a: "Destek aracıdır, yatırım tavsiyesi değildir; ekspertiz ve hukuk ile destekleyin.",
      },
      {
        q: "Favori ilan değişir mi?",
        a: "Evet; teklif öncesi detayı yenileyin.",
      },
    ],
  },
  {
    slug: "teklif",
    stepNum: 2,
    title: "Teklif ver",
    tagline: "Canlı ihaleye katılın veya kapalı teklif gönderin",
    intro:
      "Teklif, ilan kurallarına uygun tutar ve zamanlamayla verilir. Canlı ihalede teklifler sıralanır; son dakika tekliflerine karşı süre uzatma adil pencere bırakmayı hedefler. Alternatif modeller ilan şartlarında yazılmalıdır.",
    userJourney: [
      {
        title: "Önce kontrol",
        bullets: [
          "Minimum artış ve üzeri tutar; hızlı artış butonları yardımcıdır.",
          "Teminat ve katılım koşullarını okuyun.",
          "Kredi veya nakit planını netleştirin.",
        ],
      },
      {
        title: "Bağlayıcılık",
        bullets: [
          "Onaylanan teklif geri alınamaz.",
          "Kuralları aşmaya yönelik otomasyon yasaktır.",
        ],
      },
    ],
    platformSide: [
      {
        title: "Doğrulama",
        paragraphs: [
          "Tutar kurallara uyuyorsa kayıt ve zaman damgası oluşur.",
          "Kapanışta en yüksek geçerli teklif kazanan adayı; beraberlik ilan şartlarında tanımlanır.",
        ],
      },
    ],
    dataAndTrust: [
      "Teklif geçmişi hesabınızda izlenir.",
      "TLS ile korunan kanallar; hassas bilgide dikkatli olun.",
    ],
    risksAndLimits: [
      "Hatalı tutar iptal edilmeyebilir.",
      "Ödeme gecikmeleri sonraki süreleri etkileyebilir.",
    ],
    relatedRoutes: [
      { label: "Canlı ihaleler", path: "/ihaleler" },
      { label: "İhale koşulları", path: "/ihale-kosullari" },
      { label: "Güvenlik", path: "/guvenlik" },
      { label: "Yardım", path: "/rehber" },
    ],
    faq: [
      {
        q: "Son saniyede teklif, süre uzar mı?",
        a: "Yapılandırmaya bağlı; kesin kural ilanda yazar.",
      },
      { q: "Teklifi düşürebilir miyim?", a: "Hayır; yalnızca daha yüksek teklif verilebilir." },
    ],
  },
  {
    slug: "kazan",
    stepNum: 3,
    title: "Kazan",
    tagline: "En yüksek teklifi verdiğinizde anında bildirim",
    intro:
      "Kapanışta teklifler sıralanır, en yüksek geçerli teklif kazanan sayılır. Bildirim e-posta veya uygulama içi olabilir. Kazanma bildirimi tek başına sözleşme değildir; imza ve ödeme ile resmileşir.",
    userJourney: [
      {
        title: "Kazanan iseniz",
        bullets: [
          "Teminat, kapora, bakiye ve evrak takvimini panelden izleyin.",
          "Satıcı ve platform ile sözleşme adımlarını tamamlayın.",
          "Krediyi erkenden başlatın.",
        ],
      },
      {
        title: "Kazanamadıysanız",
        bullets: [
          "Teminat iadesi şartlara tabidir.",
          "Benzer ilanlar için uyarıları kullanın.",
        ],
      },
    ],
    platformSide: [
      {
        title: "Otomasyon",
        paragraphs: [
          "Kazanan ve kaybeden durumu üretilir.",
          "Uyuşmazlıkta yönetim prosedürleri uygulanır.",
        ],
      },
    ],
    dataAndTrust: [
      "Bildirim tercihlerini ayarlardan yönetin.",
      "Ödeme talimatı yalnızca doğrulanmış kanallardan.",
    ],
    risksAndLimits: [
      "Ödeme yapılmazsa teminat yaptırımları devreye girebilir.",
    ],
    relatedRoutes: [
      { label: "Hizmet bedelleri", path: "/hizmet-bedelleri" },
      { label: "Mesafeli satış", path: "/mesafeli-satis-sozlesmesi" },
      { label: "İade ve iptal", path: "/iade-iptal" },
    ],
    faq: [
      {
        q: "Ödeme yapamazsam?",
        a: "Teminat ve yeniden ihale maddeleri sözleşmede; detayları okuyun.",
      },
    ],
  },
  {
    slug: "teslim",
    stepNum: 4,
    title: "Teslim al",
    tagline: "Hukuki süreçlerde rehberlik, tapu işlemleri",
    intro:
      "Mülkiyet tapu sicilinde resmileşir. Platform rehberlik sağlar; noter ve tapu süreçleri esastır. Bilgi geneldir, avukatlık yerine geçmez.",
    userJourney: [
      {
        title: "Ödeme",
        bullets: ["Sözleşme sırasına uygun kapora ve bakiye.", "Escrow koşullarını okuyun."],
      },
      {
        title: "Tapu",
        bullets: ["Evraklar sayfası ve ilan ekleri.", "Teslimde ölçü ve anahtar kontrolü."],
      },
      {
        title: "Sonrası",
        bullets: ["Abonelik ve aidat devirleri.", "İletişim tercihlerini güncelleyin."],
      },
    ],
    platformSide: [
      {
        title: "Destek",
        paragraphs: [
          "Belgeler ve yasal metinler çapraz bağlanır.",
          "İleri operasyon üretimde açılır.",
        ],
      },
    ],
    dataAndTrust: [
      "Veriler şifreli kanallarla korunmayı hedefler.",
      "Aktarım mevzuata uygun olmalıdır.",
    ],
    risksAndLimits: [
      "Şerh veya ret durumunda uzman görüşü alın.",
    ],
    relatedRoutes: [
      { label: "Evraklar", path: "/evraklar" },
      { label: "Yasal çerçeve", path: "/yasal-cerceve" },
      { label: "KVKK", path: "/kvkk" },
      { label: "İletişim", path: "/iletisim" },
    ],
    faq: [
      {
        q: "Tapu platformda mı?",
        a: "Hayır; resmi makamlarda yapılır, platform yol gösterir.",
      },
    ],
  },
];

export type NasilCalisirJourneySlug = "alici" | "satici" | "danisman" | "kurumsal" | "operasyon";

export type NasilCalisirJourneyStep = {
  baslik: string;
  metin: string;
  yapilacaklar: string[];
  belgeler: { label: string; path: string }[];
  sure?: string;
};

export type NasilCalisirJourney = {
  slug: NasilCalisirJourneySlug;
  baslik: string;
  ozet: string;
  icon: "Home" | "UserCheck" | "Building2" | "Shield";
  adimlar: NasilCalisirJourneyStep[];
  ilgiliSozlesmeler: { label: string; path: string }[];
  ilgiliSayfalar: { label: string; path: string }[];
};

export const NASIL_CALISIR_VIDEO = {
  title: "Platform tanıtımı",
  lead:
    "Bu bölüm ürün tanıtım videosu içindir — ana sayfa hero’sundaki kısa intro değil. Videoda keşif, teklif, kapanış ve teslimat akışı; güven katmanları ve belge süreçleri özetlenir. Dosya henüz yüklenmemişse aşağıdaki bölüm anlatımı otomatik gösterilir.",
  src: "/videos/ihaleal-tanitim.mp4",
  poster: "/images/auction-1.jpg",
  durationLabel: "~2 dk",
  chapters: [
    { at: "0:00", title: "Keşif ve analiz", desc: "İlan listesi, AI özet ve risk işaretleri." },
    { at: "0:30", title: "Teklif ve teminat", desc: "Canlı ihale kuralları, minimum artış, bid bond." },
    { at: "1:00", title: "Kapanış", desc: "Kazanan bildirimi, sözleşme ve ödeme hattı." },
    { at: "1:30", title: "Teslim ve tapu", desc: "Evrak listesi, noter ve tapu rehberliği." },
  ],
} as const;

export const NASIL_CALISIR_PRENSIPLER = {
  title: "Çalışma prensibi",
  lead:
    "ihaleal.com, gayrimenkul ihalelerinde keşiften tapu teslimine kadar tekrarlanabilir bir akış sunar. Platform aracılık ve dijital süreç yönetimi sağlar; tapu devri ve ödeme yükümlülükleri taraflar arası sözleşme ve mevzuata tabidir.",
  items: [
    {
      title: "Şeffaf kurallar",
      body: "Minimum artış, süre uzatma, teminat ve ücretler ilan şartnamesinde ve merkezi yapılandırmada tutarlı gösterilir.",
    },
    {
      title: "Rol bazlı erişim",
      body: "Alıcı, satıcı, emlakçı, müteahhit ve operasyon rolleri farklı paneller ve onay hatları kullanır.",
    },
    {
      title: "Denetim izi",
      body: "Teklif, bildirim ve belge yüklemeleri hesap ve zaman damgası ile izlenir (üretim hedefi).",
    },
    {
      title: "Hukuki çerçeve",
      body: "Kesin yükümlülükler ihale şartnamesi, mesafeli satış ve ilgili sözleşme eklerinde tanımlanır.",
    },
  ],
} as const;

export const NASIL_CALISIR_BELGELER = {
  title: "İstenilen belgeler (özet)",
  lead: "Aşağıdaki liste rol ve işlem tipine göre değişir. Tam kontrol listesi evraklar sayfasındadır.",
  categories: [
    {
      title: "Kimlik ve uyum",
      items: ["Nüfus cüzdanı / pasaport", "Adli sicil kaydı", "KYC doğrulama (yüksek tutarlı işlemler)"],
      path: "/evraklar",
    },
    {
      title: "Finansal",
      items: ["IBAN doğrulama", "Gelir belgesi / bordro", "Teminat mektubu veya kapora dekontu"],
      path: "/hizmet-bedelleri",
    },
    {
      title: "Gayrimenkul",
      items: ["Tapu kayıt örneği", "Ekspertiz raporu", "İmar durumu (varsa)"],
      path: "/evraklar",
    },
    {
      title: "Kurumsal / vekalet",
      items: ["Ticaret sicil gazetesi", "İmza sirküleri", "Noter onaylı vekaletname"],
      path: "/evraklar",
    },
  ],
} as const;

export const NASIL_CALISIR_SOZLESMELER = {
  title: "İlgili sözleşmeler",
  lead: "Taslak metinler bilgilendirme amaçlıdır; nihai metinler avukat onayı ile yürürlüğe girer.",
  links: [
    { label: "İhale katılım sözleşmesi", path: "/yasal/sozlesmeler/ihale-katilim" },
    { label: "Kapalı teklif gizlilik", path: "/yasal/sozlesmeler/kapali-teklif" },
    { label: "Emlak aracılık", path: "/yasal/sozlesmeler/emlak-aracilik" },
    { label: "Kat karşılığı arsa", path: "/yasal/sozlesmeler/kat-karsiligi" },
    { label: "Mesafeli satış", path: "/mesafeli-satis-sozlesmesi" },
    { label: "İhale koşulları", path: "/ihale-kosullari" },
    { label: "Tüm şablonlar", path: "/yasal/sozlesmeler" },
  ],
} as const;

export const NASIL_CALISIR_JOURNEYS: NasilCalisirJourney[] = [
  {
    slug: "alici",
    baslik: "Alıcı ve yatırımcı",
    ozet: "İlan keşfinden teklif netleşmesine ve tapu hazırlığına kadar uçtan uca güvenli rota.",
    icon: "Home",
    adimlar: [
      {
        baslik: "Keşif ve filtreleme",
        metin: "Konum, bütçe, ilan türü ve risk etiketlerine göre arayın. AI özetleri karar destek içindir; nihai kararı ekspertiz ile pekiştirin.",
        yapilacaklar: ["Favori ilanları kaydedin", "Harita ve analiz sayfalarını inceleyin", "İlan şartnamesini okuyun"],
        belgeler: [
          { label: "İlan listesi", path: "/ilanlar" },
          { label: "Analiz", path: "/analiz" },
        ],
        sure: "1–3 gün (araştırma)",
      },
      {
        baslik: "Detay ve analiz",
        metin: "Şartname, görseller, tapu uyarıları ve piyasa kıyasını değerlendirin. KYC gereksinimi tutara göre açılabilir.",
        yapilacaklar: ["Ekspertiz talep edin", "Finansman planını netleştirin", "KYC adımlarını tamamlayın"],
        belgeler: [
          { label: "KYC", path: "/kyc" },
          { label: "Ekspertiz", path: "/ekspertiz" },
        ],
      },
      {
        baslik: "Teminat ve teklif",
        metin: "Ön yetki kutularını onaylayın; minimum artışa uyun. Onaylanan teklif geri alınamaz.",
        yapilacaklar: ["Teminat yatırın", "Canlı veya kapalı teklif verin", "Bildirim tercihlerini açın"],
        belgeler: [
          { label: "İhale koşulları", path: "/ihale-kosullari" },
          { label: "Hizmet bedelleri", path: "/hizmet-bedelleri" },
        ],
      },
      {
        baslik: "Kapanış ve tapu hazırlığı",
        metin: "Kazanan netleşince sözleşme, ödeme ve evrak takvimi panelde görünür. Tapu resmi makamlarda tamamlanır.",
        yapilacaklar: ["Sözleşmeyi imzalayın", "Kapora ve bakiyeyi planlayın", "Evrak listesini tamamlayın"],
        belgeler: [
          { label: "Evraklar", path: "/evraklar" },
          { label: "Mesafeli satış", path: "/mesafeli-satis-sozlesmesi" },
        ],
        sure: "30–90 gün (tapu tipine göre)",
      },
    ],
    ilgiliSozlesmeler: [
      { label: "İhale katılım", path: "/yasal/sozlesmeler/ihale-katilim" },
      { label: "Kapalı teklif", path: "/yasal/sozlesmeler/kapali-teklif" },
    ],
    ilgiliSayfalar: [
      { label: "Canlı ihaleler", path: "/ihaleler" },
      { label: "Adım: Keşfet", path: "/how-it-works/adim/kesfet" },
      { label: "Adım: Teklif", path: "/how-it-works/adim/teklif" },
    ],
  },
  {
    slug: "satici",
    baslik: "Satıcı ve malik",
    ozet: "İlan yayınından en iyi teklifi seçmeye ve sözleşmeye kadar kontrollü süreç.",
    icon: "UserCheck",
    adimlar: [
      {
        baslik: "Portföy bilgisi",
        metin: "Tapu, imar, ipotek ve kiracı durumunu eksiksiz girin. Yanlış beyan riski azaltır ve teklif güvenini artırır.",
        yapilacaklar: ["Tapu belgesini yükleyin", "İmar durumunu ekleyin", "Satıcı beyan formunu doldurun"],
        belgeler: [{ label: "Evrak rehberi", path: "/evraklar" }],
      },
      {
        baslik: "İlan modeli seçimi",
        metin: "Açık artırma, kapalı teklif veya hibrit model; süre, minimum artış ve Hemen Al eşiğini belirleyin.",
        yapilacaklar: ["İhale aç formunu doldurun", "Minimum artış ve süreyi belirleyin", "Hemen Al eşiğini ayarlayın"],
        belgeler: [{ label: "İhale aç", path: "/ihale-ac" }],
      },
      {
        baslik: "Teklif izleme",
        metin: "Panoda teklif yoğunluğu ve katılımcı sayısını takip edin; gerekirse soru-cevap turu açın.",
        yapilacaklar: ["Panelden teklifleri izleyin", "Uzatma kurallarını kontrol edin"],
        belgeler: [{ label: "Panel", path: "/panel" }],
      },
      {
        baslik: "Kazanan ile sözleşme",
        metin: "Anlaşılan rakam sözleşmeye işlenir; tapu için vekalet ve evrak listesi üretilir.",
        yapilacaklar: ["Kazanan teklifi onaylayın", "Komisyon ve fatura adımlarını takip edin"],
        belgeler: [
          { label: "Komisyon modeli", path: "/komisyon-modeli" },
          { label: "İade ve iptal", path: "/iade-iptal" },
        ],
      },
    ],
    ilgiliSozlesmeler: [{ label: "İhale katılım", path: "/yasal/sozlesmeler/ihale-katilim" }],
    ilgiliSayfalar: [
      { label: "Satışa başla", path: "/sat-basla" },
      { label: "Adım: Kazan", path: "/how-it-works/adim/kazan" },
    ],
  },
  {
    slug: "danisman",
    baslik: "Emlak danışmanı",
    ozet: "Müşteri portföyünü profesyonel araçlarla yönetme ve kapanış desteği.",
    icon: "Building2",
    adimlar: [
      {
        baslik: "Yetki ve vekalet",
        metin: "Satıcıdan yetki alın; platforma yüklenen belgeler denetim izi ile saklanır.",
        yapilacaklar: ["Emlakçı kaydı", "Ofis paneline giriş"],
        belgeler: [
          { label: "Emlakçı girişi", path: "/emlakci-giris" },
          { label: "Aracılık sözleşmesi", path: "/yasal/sozlesmeler/emlak-aracilik" },
        ],
      },
      {
        baslik: "Çoklu ilan yönetimi",
        metin: "Kota dahilinde ilan açın; şablonlarla süre ve tavan fiyatını hızlı ayarlayın.",
        yapilacaklar: ["CRM özellikleri", "İlan şablonları"],
        belgeler: [{ label: "Emlakçı paneli", path: "/emlakci/panel" }],
      },
      {
        baslik: "Müşteri ile paylaşım",
        metin: "Özel bağlantı ve rapor çıktılarıyla alıcıyı bilgilendirin.",
        yapilacaklar: ["Rapor paylaşımı", "Mesajlaşma"],
        belgeler: [{ label: "Mesajlar", path: "/mesajlar" }],
      },
      {
        baslik: "Kapanış desteği",
        metin: "Komisyon ve fatura adımları üretimde netleşir; operasyon ekibiyle senkron kalın.",
        yapilacaklar: ["Komisyon hesaplayıcı", "Ortaklık programı"],
        belgeler: [
          { label: "Komisyon hesaplayıcı", path: "/komisyon-hesaplayici" },
          { label: "B2B ortaklık", path: "/emlakci-ortaklik" },
        ],
      },
    ],
    ilgiliSozlesmeler: [{ label: "Emlak aracılık", path: "/yasal/sozlesmeler/emlak-aracilik" }],
    ilgiliSayfalar: [{ label: "Emlakçı vitrini", path: "/emlakci" }],
  },
  {
    slug: "kurumsal",
    baslik: "Müteahhit ve GYO",
    ozet: "Proje çıkışlarında ölçek, onay hatları ve raporlama.",
    icon: "Building2",
    adimlar: [
      {
        baslik: "Lot ve faz planı",
        metin: "Çok ünite ve fazlı satış için gruplu ilanlar; stok gerçek zamanlı güncellenir.",
        yapilacaklar: ["Proje paneli", "Kat karşılığı modülü"],
        belgeler: [
          { label: "Müteahhit paneli", path: "/muteahhit/panel" },
          { label: "Kat karşılığı", path: "/kat-karsiligi-arsa" },
        ],
      },
      {
        baslik: "Rol ve onay",
        metin: "Finans ve hukuk onay hatları ile teklif kapanışları çift kontrollü yapılabilir.",
        yapilacaklar: ["Kurumsal dashboard", "Rol atamaları"],
        belgeler: [{ label: "Kurumsal", path: "/kurumsal" }],
      },
      {
        baslik: "Kurumsal rapor",
        metin: "Pazarlık seviyesi, süre ve dönüşüm oranları yönetim özetine aktarılır.",
        yapilacaklar: ["Piyasa raporları", "Analitik"],
        belgeler: [{ label: "Piyasa raporları", path: "/piyasa-raporlari" }],
      },
      {
        baslik: "Entegrasyon",
        metin: "CRM ve ERP ile webhook; kurumsal planda API kotası genişletilir.",
        yapilacaklar: ["API dokümantasyonu (yol haritası)", "Webhook yapılandırması"],
        belgeler: [{ label: "Kat karşılığı sözleşme", path: "/yasal/sozlesmeler/kat-karsiligi" }],
      },
    ],
    ilgiliSozlesmeler: [
      { label: "Kat karşılığı", path: "/yasal/sozlesmeler/kat-karsiligi" },
      { label: "Müteahhit hakediş", path: "/yasal/sozlesmeler/muteahhit-hakedis" },
    ],
    ilgiliSayfalar: [{ label: "Müteahhit lansman", path: "/muteahhit" }],
  },
  {
    slug: "operasyon",
    baslik: "Platform operasyonu",
    ozet: "İç ekip, uyum ve destek için referans katmanlar.",
    icon: "Shield",
    adimlar: [
      {
        baslik: "Kural motoru",
        metin: "Minimum artış, uzatma, ücret matrisi ve ülke ayarları merkezi yapılandırmadan okunur.",
        yapilacaklar: ["Admin paneli", "Ücret matrisi"],
        belgeler: [{ label: "Hizmet bedelleri", path: "/hizmet-bedelleri" }],
      },
      {
        baslik: "KYC ve risk",
        metin: "Kimlik ve kara liste taramaları yüksek tutarlı işlemler için devreye alınır.",
        yapilacaklar: ["KYC akışı", "Dolandırıcılık savunması"],
        belgeler: [
          { label: "Güvenlik merkezi", path: "/yasal/guvenlik" },
          { label: "Dolandırıcılık mimarisi", path: "/yasal/dolandiricilik-savunmasi" },
        ],
      },
      {
        baslik: "Bildirim ve kanıt",
        metin: "E-posta ve uygulama içi olaylar kayıt altına alınır; süre tutanakları üretilir.",
        yapilacaklar: ["Bildirim şablonları", "Denetim logları"],
        belgeler: [{ label: "Yedekleme", path: "/yedekleme" }],
      },
      {
        baslik: "Destek ve SLA",
        metin: "Öncelik kuyrukları plana göre ayrılır; kritik arızalarda nöbet hattı hedeflenir.",
        yapilacaklar: ["Destek merkezi", "Canlıya hazırlık"],
        belgeler: [
          { label: "Destek", path: "/destek" },
          { label: "Canlıya hazırlık", path: "/canliya-hazirlik" },
        ],
      },
    ],
    ilgiliSozlesmeler: [{ label: "Gizlilik eki", path: "/yasal/sozlesmeler/gizlilik-ek" }],
    ilgiliSayfalar: [{ label: "Supabase uyum", path: "/yasal/supabase-uyum" }],
  },
];

export function getJourneyBySlug(slug: string): NasilCalisirJourney | undefined {
  return NASIL_CALISIR_JOURNEYS.find((j) => j.slug === slug);
}

export function getStepBySlug(slug: string): NasilCalisirStep | undefined {
  return NASIL_CALISIR_STEPS.find((s) => s.slug === slug);
}

export function isJourneySlug(v: string | null): v is NasilCalisirJourneySlug {
  return v === "alici" || v === "satici" || v === "danisman" || v === "kurumsal" || v === "operasyon";
}

export function isStepSlug(v: string | null): v is NasilCalisirStepSlug {
  return v === "kesfet" || v === "teklif" || v === "kazan" || v === "teslim";
}

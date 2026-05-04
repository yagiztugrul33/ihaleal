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
    "ihaleal.com, ilan keşfinden tapu teslimine kadar tekrarlanabilir bir akış sunar. Aşağıdaki dört adım, hem sizin yapmanız gerekenleri hem de platformun arka planda hedeflediği süreçleri ayırır. Ödeme, teminat ve tapu adımları yürürlükteki mevzuat ve sözleşme metinlerine tabidir; arayüzde gördüğünüz tutarlar ve süreler yapılandırılabilir referans değerler içerebilir.",
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

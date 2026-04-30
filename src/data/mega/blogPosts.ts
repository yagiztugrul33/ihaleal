import type { MegaBlogPost } from "@/types/megaContent";

export const MEGA_BLOG_POSTS: MegaBlogPost[] = [
  {
    slug: "gayrimenkul-muzayede-online-rehber",
    title: "Online gayrimenkul açık artırmada süreç rehberi",
    excerpt: "Teklif turu, rezerv fiyat ve iletişim kanalı nasıl işler?",
    publishedAt: "2026-03-15",
    category: "ihale",
    tags: ["ihale", "rehber"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik", role: "Platform notu" },
    paragraphs: [
      "Gayrimenkul satışında süreli teklif turu, satıcı ile önceden tanımlanan kurallar ve şartname ile yürür.",
      "Teklif verenlerin kimlik bilgileri ilanda yayınlanmaz; kabul sonrası süreç taraf sözleşmeleri ile devam eder.",
      "Bu yazı bilgilendirme amaçlıdır; bağlayıcı hukuki görüş değildir.",
    ],
  },
  {
    slug: "komisyon-mahsup-nasil-hesaplanir",
    title: "Komisyon mahsubu nasıl düşünülür?",
    excerpt: "Yıllık üyelik ve hizmet bedellerinin komisyonla ilişkisi (genel çerçeve).",
    publishedAt: "2026-03-22",
    category: "komisyon",
    tags: ["komisyon", "üyelik"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Satıcı işlem komisyonu matrahı üzerinden KDV hesaplanır; önceden ödenen yıllık üyelik ve seçilen hizmet bedelleri mahsup kalemi olarak planlanır.",
      "Net tahsilat üretim fatura politikasına bağlıdır; rakamlar için `fees.ts` tek doğruluk kaynağıdır.",
    ],
  },
  {
    slug: "ortak-emlakci-b2b-paylasim",
    title: "Ortak emlakçı (B2B) paylaşım çizgisi",
    excerpt: "İşlem tutarı üzerinden ortak pay ve ödeme takvimi bilgilendirmesi.",
    publishedAt: "2026-04-01",
    category: "ortaklik",
    tags: ["B2B", "ortaklık"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Ortak emlakçı payı işlem tutarı üzerinden matrah olarak tanımlanır ve B2B faturalama ile ilişkilendirilir.",
      "Özel protokoller yazılı mutabakat gerektirir.",
    ],
  },
  {
    slug: "kyc-zorunlulugu-ve-veri",
    title: "KYC zorunluluğu ve kişisel veri",
    excerpt: "Kimlik doğrulama adımları ve KVKK kapsamında şeffaflık.",
    publishedAt: "2026-04-08",
    category: "hesap-guvenlik",
    tags: ["KYC", "KVKK"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Teklif güvenliği için kimlik ve uygunluk kontrolleri uygulanır; işlenen veriler aydınlatma metninde listelenir.",
      "Saklama süreleri kanuni zorunluluklara göre sınırlanır.",
    ],
  },
  {
    slug: "supabase-ve-anon-anahtar",
    title: "Tarayıcı istemcisi ve güvenlik sınırları",
    excerpt: "SPA + Supabase anon anahtar kullanımında pratik notlar.",
    publishedAt: "2026-04-12",
    category: "teknik",
    tags: ["teknik", "güvenlik"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Anon anahtar tarayıcıda görünür; hassas işlemler için sunucu doğrulaması veya Edge katmanı önerilir.",
      "RLS politikaları doğru yapılandırılmalıdır.",
    ],
  },
  {
    slug: "odemede-idempotency",
    title: "Ödemede mükerrer işlem önlemi",
    excerpt: "İstemci ve sunucu tarafında idempotency kavramı.",
    publishedAt: "2026-04-18",
    category: "teknik",
    tags: ["ödeme", "teknik"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Aynı işlem için benzersiz anahtar kullanımı tekrar tahsilat riskini azaltır.",
      "Webhook doğrulaması üretim tahsilatında zorunlu kabul edilmelidir.",
    ],
  },
  {
    slug: "moderasyon-ve-sahte-ilan",
    title: "Moderasyon ve şüpheli ilan bildirimi",
    excerpt: "Kullanıcı şikayeti ve içerik politikası özeti.",
    publishedAt: "2026-04-21",
    category: "politika",
    tags: ["politika"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Şüpheli içerik bildirimi ve moderasyon kuyruğu hedeflenir; gerektiğinde yetkili mercilere aktarım süreçleri tanımlanır.",
    ],
  },
  {
    slug: "tapu-oncesi-taahhut-yok",
    title: "Tapu öncesi taahhütler hakkında uyarı",
    excerpt: "Platformun sıfatı ve sonuç garantisi olmaması.",
    publishedAt: "2026-04-26",
    category: "hukuk",
    tags: ["hukuki bilgi"],
    is_demo_content: true,
    author: { name: "ihaleal.com İçerik" },
    paragraphs: [
      "Platform ihale ve yazılım süreçlerinde aracılık ve araç sunmayı hedefler; tapu sonucuna doğrudan garanti vermez.",
      "Somut işler için avukat ve yetkili kurumlardan görüş alınmalıdır.",
    ],
  },
];

export function getBlogPostBySlug(slug: string): MegaBlogPost | undefined {
  return MEGA_BLOG_POSTS.find((p) => p.slug === slug);
}

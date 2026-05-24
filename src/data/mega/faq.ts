import type { MegaFaqCategory, MegaFaqItem, FaqCategoryId } from "@/types/megaContent";

/** Gösterim sırası: Hesap/KYC → Üyelik → İhale → Komisyon → Emlakçı */
export const MEGA_FAQ_CATEGORIES: MegaFaqCategory[] = [
  {
    id: "account_kyc",
    title: "Hesap/KYC",
    description: "Kimlik doğrulama, ödeme, KVKK ve hesap güvenliği.",
  },
  {
    id: "membership",
    title: "Üyelik",
    description: "Yıllık ücretler, sözleşme ve tüketici bilgilendirmesi.",
  },
  {
    id: "auction_flow",
    title: "İhale",
    description: "Teklif süreci, süre uzatma, teknik kayıt ve bildirimler.",
  },
  {
    id: "commission",
    title: "Komisyon",
    description: "İşlem komisyonu, mahsup, hizmet bedelleri ve KDV.",
  },
  {
    id: "realtor",
    title: "Emlakçı",
    description: "Ortak emlakçı başvurusu, pay ve B2B faturalama.",
  },
];

function f(order: number, c: FaqCategoryId, q: string, a: string): MegaFaqItem {
  return { id: `faq-${order}`, categoryId: c, order, question: q, answer: a };
}

/** 40 soru — dağılım: Hesap/KYC 8 · Üyelik 9 · İhale 9 · Komisyon 6 · Emlakçı 8 */
export const MEGA_FAQ_ITEMS: MegaFaqItem[] = [
  f(1, "membership", "Yıllık satıcı ücreti neye karşılık gelir?", "Platformda ilan ve açık artırma süreçlerine erişim, şeffaf ücret çizelgesi ve komisyon mahsubu (satıcı) ile ilişkilidir. İlan başına veya aylık ‘paket’ satışı yoktur."),
  f(2, "membership", "Alıcı yıllık ücreti zorunlu mu?", "Ürün kuralına göre alıcı yıllık ücreti tanımlanır; teklif ve içerik erişimi bu çerçevede yönetilir. Kesin koşullar sözleşme ve ön bilgilendirmede yer alır."),
  f(3, "commission", "Komisyon oranı nedir?", "İşlem matrahı üzerinden satıcı %2 + alıcı %2 + KDV hedeflenir (fees.ts tek kaynak). Toplam komisyon matrahı %4’tür."),
  f(4, "commission", "Mahsup nasıl çalışır?", "Ödenen yıllık satıcı üyeliği ve seçilen hizmet bedelleri satıcı komisyonuna mahsup edilir; alıcı tarafı kendi %2 + KDV payını ayrıca görür."),
  f(5, "commission", "B2B emlakçı payı kim öder?", "İşlem tutarı üzerinden ortak emlakçı payı (matrah %2 + KDV) ayrı kalem olarak düzenlenir; ödeme hedefi operasyonel olarak tanımlanır."),
  f(6, "commission", "Hizmet bedelleri nelerdir?", "Fotoğraf, ekspertiz, hukuki danışmanlık gibi kalemler `SERVICE_FEES` ile tek kaynaklıdır; ‘doping’ veya ‘vitrin’ satışı değildir."),
  f(7, "commission", "Komisyon KDV’si kime yansır?", "KDV, komisyon matrahı üzerinden hesaplanır; gösterimde ön bilgilendirme ile uyum hedeflenir."),
  f(8, "commission", "Güvenli ödeme havuzu ne anlama gelir?", "Para akışı, müşteri parasının işletme hesabında serbest birikmediği modellerle tasarlanmalıdır; uygulama banka/ÖHS ile hukuk tarafından netleştirilir."),

  f(9, "account_kyc", "KYC neden zorunlu?", "Sahte teklif ve kimlik risklerini azaltmak için kimlik ve uygunluk adımları uygulanır; süreç KVKK ve saklama politikalarına tabidir."),
  f(10, "account_kyc", "MASAK uyumu nasıl ele alınır?", "Şüpheli işlem tespitinde iç prosedür ve yasal yükümlülükler devreye girebilir; platform kullanıcıyı bilgilendiren kanallar sunar (detay avukat/uyum)."),
  f(11, "account_kyc", "Teminat ne zaman istenir?", "Teklif güvenliği için ihale başına teminat veya bloke süreci tanımlanabilir; tutar ve iade şartnamesinde yazılır."),
  f(12, "account_kyc", "Kart bilgisi saklanır mı?", "Hedef mimari: kart PAN tarayıcıda tutulmaz; ödeme yönlendirme (3DS/ÖHS) modeli."),
  f(13, "account_kyc", "Çift ödeme (double charge) nasıl önlenir?", "İstemci idempotency ve sunucu tarafı tekil işlem kaydı ile mükerrer tahsilat engellenir."),
  f(14, "membership", "İade süreci kimde?", "İade koşulları ödeme sağlayıcı ve sözleşmeye göre; platform iletişim ve kayıt sağlar."),
  f(15, "membership", "KVKK kapsamında hangi veriler?", "Kimlik, iletişim, işlem ve güvenlik logları; saklama süreleri aydınlatma metninde listelenir."),
  f(16, "membership", "Hatalı havale durumu?", "Kayıtlı ödeme referansı ve destek kanalı üzerinden düzeltme; hukuki süreç taraflar arasında kalır."),

  f(17, "realtor", "Ortak emlakçı nasıl başvurur?", "Kurumsal bilgi, yetki belgesi ve iletişim formu ile talep iletilir; operasyon ekibi ön değerlendirme yapar."),
  f(18, "realtor", "Pay oranı sabit mi?", "Hedef oran iş modelinde tanımlıdır; özel protokoller yazılı mutabakat gerektirir."),
  f(19, "realtor", "Bölge tahsisi var mı?", "Operasyonel anlaşmaya bağlıdır; platformda şeffaf kural seti hedeflenir."),
  f(20, "realtor", "Fatura ve sözleşme kimle?", "B2B fatura kalemleri şirket politikasına göre; taraflar arasında yazılı çerçeve."),
  f(21, "realtor", "Çoklu ofis çatısı desteklenir mi?", "Evet; kurumsal hesap ve yetkilendirme modelleri değerlendirilebilir."),
  f(22, "realtor", "Yönlendirme ücreti ayrı mı?", "Yönlendirme veya danışmanlık kalemleri ayrı hizmet bedeli olarak sözleşmede tanımlanmalıdır; ‘paket’ dili kullanılmaz."),
  f(23, "realtor", "Performans raporu alır mıyım?", "Panel ve raporlama üretim aşamasında; özet metrikler sözleşmeye bağlanır."),
  f(24, "realtor", "Sonlandırma koşulları?", "Taraflar arası fesih maddeleri yazılı sözleşmede; bildirim kanıtlı olmalıdır."),

  f(25, "auction_flow", "Teklif sırası nasıl belirlenir?", "Sunucu zamanı ve `place_bid` RPC ile sıralı kayıt; çakışmalar transaction ile çözülür."),
  f(26, "auction_flow", "Anti-sniping var mı?", "Şema ve ücret sabitleri ile tutarlı süre uzatma kuralları tanımlanabilir (ör. son dakika uzatması)."),
  f(27, "auction_flow", "Veriler nerede saklanır?", "Üretimde barındırıcı ve veri konumu sözleşmelerde; yedekleme politikası ayrıca."),
  f(28, "auction_flow", "Loglar silinebilir mi?", "Hukuki saklama süreleri dolmadan silme yapılmaz; denetim izi korunur."),
  f(29, "auction_flow", "API ile ihale oluşturulur mu?", "Yönetim ve partner entegrasyonları için endpoint seti planlanır; `docs/API_REFERENCE.md` örneklere bakın."),
  f(30, "auction_flow", "Hata durumunda ne olur?", "Kullanıcıya anlaşılır mesaj; tekrar deneme ve destek kaydı; kritik işlemlerde idempotency."),
  f(31, "auction_flow", "Mobil uygulama var mı?", "Web öncelikli; PWA/Native yol haritasında."),
  f(32, "auction_flow", "Bildirimler nasıl gider?", "E-posta/SMS şablonları `src/emails` altında; üretimde gönderim sağlayıcı entegrasyonu gerekir."),
  f(33, "auction_flow", "Platform tapu garantisi verir mi?", "Hayır; tapu ve sonuç noter/yasal süreçle taraflar arasındadır. Platform süreç aracılığı ve yazılım sunar."),

  f(34, "membership", "Uyuşmazlıkta hangi hukuk?", "Sözleşmede yetkili mahkeme/arabuluculuk seçilir; depoda hukuki taslaklar referans."),
  f(35, "membership", "Mesafeli satış cayması?", "Sunulan hizmetin niteliğine göre rejim değişir; mesafe satımına ilişkin hükümler avukatça netleştirilir."),
  f(36, "account_kyc", "Şüpheli ilan bildirimi?", "‘Şikayet et’ ve moderasyon kuyruğu; gerektiğinde yetkili mercilere aktarım prosedürü."),
  f(37, "account_kyc", "Çerez ve izleme?", "Çerez politikası ve tercih yönetimi ayrı sayfada."),
  f(38, "account_kyc", "Veri ihlali bildirimi?", "Olgu oluşursa KVKK ve ilgili mevzuat süreleri içinde süreç tanımlanır."),
  f(39, "membership", "Yabancı uyruk uyumu?", "Türk hukuku ve ilgili kısıtlamalar için uyarılar gösterilir; özel durumlarda hukuki danışmanlık önerilir."),
  f(40, "membership", "Bu SSS hukuki görüş mü?", "Hayır; genel bilgilendirme. Bağlayıcı görüş için Türkiye Barosu avukatı."),
];

export function getFaqByCategory(cat: FaqCategoryId): MegaFaqItem[] {
  return MEGA_FAQ_ITEMS.filter((x) => x.categoryId === cat).sort((a, b) => a.order - b.order);
}

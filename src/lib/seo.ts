import { SEO_LANDING_PAGES } from "@/data/seoLandings";
import { resolveProgrammaticRoute, buildSeoTitle, buildSeoDescription, findProvince } from "@/lib/seo/programmaticSeo";
import { findGuideBySlug } from "@/data/realEstateGuides";
import { HOME_SEO, OG_IMAGE } from "@/data/homeSeo";
import {
  SITE_ORIGIN,
  getCanonicalHref,
  getShareUrlForPath,
} from "@/data/siteOrigin";

/**
 * Tek cümle — müşteri seçimi (hibrit): kanonik her zaman kök URL;
 * og:url ve twitter:url ilgili rotanın tam hash adresidir.
 */
export const SEO_CANONICAL_POLICY_TR =
  "HashRouter demo (hibrit): kanonik her zaman kök URL; og:url ve twitter:url ilgili rotanın tam hash adresidir.";

/** HashRouter: paylaşım ve `og:url` için taban; kanonik ayrı (kök URL). */
export { SITE_ORIGIN, getCanonicalHref, getShareUrlForPath };

/** `ROUTES["/"]` ile aynı nesne (`HOME_SEO`), drift yok. */
export const DEFAULT_SEO = HOME_SEO;

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": HOME_SEO,
  "/arama": {
    title: "İlan arama — ihaleal.com",
    description: "Şehir, semt ve kategoriye göre gayrimenkul ihale ilanlarında arama yapın.",
  },
  "/ihaleler": {
    title: "İhaleler — ihaleal.com",
    description: "Aktif gayrimenkul ihale ve ilanları keşfedin (demo veri).",
  },
  "/analiz": {
    title: "İhaleal Endeksi — AI analiz ve fiyat tahmini — ihaleal.com",
    description:
      "Teklif ve bölge sinyalleriyle zenginleştirilmiş demo analiz; kesin değer için resmi ekspertiz gerekir.",
  },
  "/karsilastir": {
    title: "İlan karşılaştırma — ihaleal.com",
    description: "Seçtiğiniz ilanları yan yana karşılaştırın.",
  },
  "/mortgage": {
    title: "Mortgage / kredi hesaplayıcı — ihaleal.com",
    description: "Taksit ve faiz tahmini için örnek hesaplama aracı.",
  },
  "/evraklar": {
    title: "Katılım evrakları — ihaleal.com",
    description: "İhale ve tapu süreçlerinde sık istenen belgelerin kontrol listesi (bilgilendirme).",
  },
  "/ihale-kosullari": {
    title: "İhale koşulları ve komisyon — ihaleal.com",
    description: "Platform kuralları ve komisyon çerçevesi için taslak metinler.",
  },
  "/kvkk": {
    title: "KVKK aydınlatma — ihaleal.com",
    description: "Kişisel verilerin işlenmesine ilişkin bilgilendirme metni.",
  },
  "/gizlilik": {
    title: "Gizlilik politikası — ihaleal.com",
    description: "Veri saklama, çerezler ve üçüncü taraflar hakkında bilgi.",
  },
  "/cerez-politikasi": {
    title: "Çerez politikası — ihaleal.com",
    description: "Çerez türleri ve tercihleriniz hakkında bilgilendirme.",
  },
  "/guvenlik": {
    title: "Güvenlik merkezi — ihaleal.com",
    description: "Hesap güvenliği ve en iyi uygulamalar (bilgilendirme).",
  },
  "/reklam": {
    title: "Reklam ve tanıtım videoları — ihaleal.com",
    description: "Platform tanıtımı ve kısa video içerikleri.",
  },
  "/sat-basla": {
    title: "Satıcı modu — ihaleal.com",
    description: "İlan ve ihale ile satış için başlangıç rehberi.",
  },
  "/giris": { title: "Giriş — ihaleal.com", description: "Hesabınıza giriş yapın (demo, yerel tarayıcı)." },
  "/kayit": { title: "Kayıt — ihaleal.com", description: "Yeni hesap oluşturun (demo, yerel tarayıcı)." },
  "/profil": { title: "Profil — ihaleal.com", description: "Hesap bilgileriniz ve güvenlik özeti (demo)." },
  "/favoriler": { title: "Favori ilanlar — ihaleal.com", description: "Kaydettiğiniz gayrimenkul ihale ve ilanları görüntüleyin." },
  "/harita": { title: "Harita — ihaleal.com", description: "İlanları harita üzerinde keşfedin (demo veri)." },
  "/dashboard": {
    title: "Hesap paneli — ihaleal.com",
    description: "Seçilen kullanıcı akışına göre kısayollar; demo oturum.",
  },
  "/dashboard/yatirimci": {
    title: "Yatırımcı portföyü — ihaleal.com",
    description: "Favori ilanlar ve grafik özetleri (demo veri).",
  },
  "/sehirler": { title: "Şehir rehberi — ihaleal.com", description: "Şehirlere göre ilan ve bölge notları." },
  "/rehber": { title: "Yardım rehberi — ihaleal.com", description: "İhale ve platform kullanımı için rehber." },
  "/nasil-calisir": {
    title: "Nasıl çalışır — ihaleal.com",
    description: "İlan, teklif ve ihale akışları; demo ve taslak metinler.",
  },
  "/yasal/agency-contract": {
    title: "Acentelik sözleşmesi taslağı — ihaleal.com",
    description: "agency_contract.md genel çerçeve (demo, avukat onayı gerekir).",
  },
  "/ihale-ac": { title: "İlan / ihale aç — ihaleal.com", description: "Satıcı olarak ilan oluşturma akışı (demo, tarayıcıda saklama)." },
  "/ekspertiz": { title: "Ekspertiz ve uzman görüşü — ihaleal.com", description: "Değerleme ve rapor süreçleri hakkında bilgilendirme." },
  "/karsilastir-rakipler": { title: "Rakip karşılaştırma — ihaleal.com", description: "Pazar ve özellik karşılaştırması (bilgilendirme)." },
  "/yedekleme": { title: "Yedekleme ve felaket kurtarma — ihaleal.com", description: "Veri dayanıklılığı hedefleri (taslak)." },
  "/yasal-cerceve": { title: "Yasal çerçeve — ihaleal.com", description: "Platform hukuki çerçeve taslağı." },
  "/canliya-hazirlik": { title: "Canlıya hazırlık — ihaleal.com", description: "Kontrol listesi ve operasyonel hazırlık." },
  "/komisyon-modeli": {
    title: "Komisyon modeli — ihaleal.com",
    description: "Yalnızca komisyon: ilan, vitrin ve kullanıcıya satılan reklam ücreti yok (hedef). Kira: kiraya verenden bir aylık kira çizgisi (taslak).",
  },
  "/kat-karsiligi": {
    title: "Kat karşılığı arsa — pay dağılımı ve hak ediş hesaplayıcı — ihaleal.com",
    description: "Arsa sahibi/müteahhit pay dağılımı, hak ediş projeksiyonu ve imar hakkı hesabı; kat karşılığı sözleşme sürecine giriş.",
  },
  "/kat-karsiligi/studio": {
    title: "Ada / parsel ve imar stüdyosu — ihaleal.com",
    description: "Ada, parsel ve imar parametreleriyle yaklaşık inşaat hakkı ve kat adedi hesaplayın; doldurulabilir KKA sözleşme paketi üretin.",
  },
  "/kat-karsiligi-arsa": {
    title: "Arsa sahipleri için kat karşılığı rehberi — ihaleal.com",
    description: "Arsanızı kat karşılığı vermeden önce süreç nasıl işler, haklarınız neler, hangi risklere dikkat etmelisiniz? Adım adım rehber ve hak ediş hesaplayıcıya yönlendirme.",
  },
  "/veri-ve-endeks": {
    title: "İhaleal Endeksi ve veri stratejisi — ihaleal.com",
    description:
      "İhale akışına bağlı çoklu sinyal: bölge bandı, talep ve yapay zeka özetleri; lisanslı veri entegrasyon planı ve demo sınırları.",
  },
  "/onboarding/akis": {
    title: "Kullanıcı akışı seçimi — ihaleal.com",
    description: "İlan, ihale satıcı, teklif veren veya izleyici akışları için evrak taslağı (demo).",
  },
  "/auth/edevis-mock": {
    title: "e-Devlet yetki (demo) — ihaleal.com",
    description: "Akış B için yetki simülasyonu; gerçek e-Devlet yok.",
  },
  "/ilan": {
    title: "İlan detayı — ihaleal.com",
    description: "Gayrimenkul ilanı, fiyat, konum ve ihale bilgileri (demo içerik).",
  },
  "/ilanlar": {
    title: "Tüm ihaleler — ihaleal.com",
    description: "Şehir, tip ve duruma göre filtrelenmiş demo ihale listesi.",
  },
  "/iletisim": {
    title: "İletişim — ihaleal.com",
    description: "Destek ve iş birliği için iletişim kanalları (demo).",
  },
  "/hakkimizda": {
    title: "Hakkımızda — ihaleal.com",
    description: "ihaleal.com vizyonu ve platform özeti (bilgilendirme).",
  },
  "/raporlar": {
    title: "Analiz belgeleri — ihaleal.com",
    description: "Piyasa ve operasyon özetleri (demo içerik).",
  },
  "/blog": {
    title: "Blog — ihaleal.com",
    description: "Gayrimenkul ve ihale ekosistemine dair yazılar (demo).",
  },
  "/emlakciler": {
    title: "Ortak emlakçılar — ihaleal.com",
    description: "Demo emlakçı profilleri ve performans özetleri.",
  },
  "/panel": {
    title: "Hesap paneli — ihaleal.com",
    description: "Özet, mesajlar ve evraklar için kullanıcı alanı (demo).",
  },
  "/mesajlar": {
    title: "Mesajlar — ihaleal.com",
    description: "Teklif ve görüşme kutusu (demo akış).",
  },
  "/belgeler": {
    title: "Belgelerim — ihaleal.com",
    description: "Yüklenen evrakların özeti (demo).",
  },
  "/ayarlar": {
    title: "Ayarlar — ihaleal.com",
    description: "Hesap ve bildirim tercihleri (demo).",
  },
  "/komisyon-hesaplayici": {
    title: "Komisyon hesaplayıcı — ihaleal.com",
    description: "Üyelik, hizmet bedeli ve satış komisyonu tahmini (demo).",
  },
  "/konut-kredisi-hesaplayici": {
    title: "Konut kredisi hesaplayıcı — ihaleal.com",
    description: "Kredi tutarı, vade ve faiz oranına göre aylık taksit ve toplam geri ödeme tahmini.",
  },
  "/borsa": {
    title: "İhaleal Borsa — canlı piyasa endeksi — ihaleal.com",
    description: "Bölgesel fiyat endeksi, işlem hacmi ve canlı ilan sinyalleri.",
  },
  "/bildirimler": {
    title: "Bildirimler — ihaleal.com",
    description: "Hesap ve ilan bildirimleriniz.",
  },
  "/modul/parsel-zekasi": {
    title: "Parsel zekası modülü — ihaleal.com",
    description: "Parsel ve imar zekası analiz modülü.",
  },
  "/modul/ges-analizi": {
    title: "GES analizi modülü — ihaleal.com",
    description: "Güneş enerjisi arazi ve proje analizi modülü.",
  },
  "/modul/degerleme": {
    title: "Değerleme modülü — ihaleal.com",
    description: "Gayrimenkul değerleme ve rapor modülü.",
  },
  "/modul/kentsel-donusum": {
    title: "Kentsel dönüşüm modülü — ihaleal.com",
    description: "Kentsel dönüşüm bölgeleri ve proje haritası.",
  },
  "/modul/afet-risk-haritasi": {
    title: "Afet risk haritası — ihaleal.com",
    description: "Bölgesel afet risk katmanları ve harita görünümü.",
  },
  "/modul/afet-toplanma-alanlari": {
    title: "Afet toplanma alanları — ihaleal.com",
    description: "Yakın toplanma alanları haritası ve listesi.",
  },
  "/sifremi-unuttum": {
    title: "Şifre sıfırlama — ihaleal.com",
    description: "Hesap kurtarma akışı (taslak / demo).",
  },
  "/yasal-master-brief": {
    title: "Yasal özet brif — ihaleal.com",
    description: "Master hukuk özeti ve bağlantılı politikalar (taslak).",
  },
  "/kampanyalar": {
    title: "Kampanyalar — ihaleal.com",
    description: "Gayrimenkul yatırım ve ihale kampanyaları.",
  },
  "/proje": {
    title: "Lansman projesi — ihaleal.com",
    description: "Müteahhit lansman projesi, birim listesi ve konum bilgisi.",
  },
  "/kyc": {
    title: "Kimlik doğrulama — ihaleal.com",
    description: "KYC ve hesap doğrulama adımları.",
  },
  "/hizmet-bedelleri": {
    title: "Hizmet bedelleri — ihaleal.com",
    description: "Platform üyelik ve hizmet bedeli özeti.",
  },
  "/uluslararasi": {
    title: "Uluslararası yatırımcı — ihaleal.com",
    description: "Yabancı yatırımcılar için Türkiye gayrimenkul rehberi.",
  },
  "/services": {
    title: "İhaleal Kurumsal — çoklu ofis emlak yönetim platformu — ihaleal.com",
    description: "Multi-tenant portföy, rol bazlı yetki, toplu ilan yükleme ve AI destekli fiyatlama; emlak ofisleri ve GYO'lar için.",
  },
  "/how-it-works": {
    title: "Nasıl çalışır — ihaleal.com",
    description: "İlan, teklif ve ihale akışları; demo ve taslak metinler.",
  },
  "/borsa/varliklar": {
    title: "Varlık terminali — İhaleal Borsa — ihaleal.com",
    description: "Bölgesel fiyat endeksi ve varlık bazlı canlı piyasa terminali.",
  },
  "/borsa/izleme": {
    title: "İzleme listesi — İhaleal Borsa — ihaleal.com",
    description: "Takip ettiğiniz varlıklar ve bölgeler için izleme listesi terminali.",
  },
  "/borsa/veri": {
    title: "Veri analiz terminali — İhaleal Borsa — ihaleal.com",
    description: "Bölgesel fiyat, hacim ve talep sinyallerinin derin veri analizi.",
  },
  "/borsa/portfoy": {
    title: "Borsa portföyüm — İhaleal Borsa — ihaleal.com",
    description: "Gayrimenkul varlık portföyünüzün değer ve getiri özeti (demo).",
  },
  "/emlakci": {
    title: "Emlakçılar için ihaleal.com — ortak ol",
    description: "Emlak ofisleri için ilan, portföy ve ihale entegrasyonu; ortaklık başvurusu.",
  },
  "/emlakci-ortaklik": {
    title: "Emlakçı ortaklık programı — ihaleal.com",
    description: "Emlak ofisleri için komisyon paylaşımlı ortaklık programı şartları ve başvuru süreci.",
  },
  "/muteahhit": {
    title: "Müteahhitler için proje lansmanı — ihaleal.com",
    description: "Ruhsatlı proje ve birim envanterini yayınlayın; lansman ilanlarını ihaleal.com üzerinden yönetin.",
  },
  "/kurumsal/iletisim": {
    title: "Kurumsal demo talebi — ihaleal.com",
    description: "GYO ve emlak grupları için kurumsal demo talebi oluşturun.",
  },
  "/degerleme": {
    title: "Ne kadar eder? — AI gayrimenkul değer tahmini — ihaleal.com",
    description: "Konum ve özelliklere göre demo değer tahmini; kesin değer için resmi ekspertiz gerekir.",
  },
  "/oduller": {
    title: "Sadakat programı ve ödüller — ihaleal.com",
    description: "Platform kullanımına bağlı puan ve ödül programı özeti (demo).",
  },
  "/fiyatlandirma": {
    title: "Fiyatlandırma ve üyelik paketleri — ihaleal.com",
    description: "Bireysel, ofis ve kurumsal kullanım için üyelik paketleri ve fiyatlandırma.",
  },
  "/magaza": {
    title: "Ek hizmet mağazası — ihaleal.com",
    description: "İlan öne çıkarma ve ek hizmet paketleri (demo).",
  },
  "/pre-launch": {
    title: "Erken erişim / lansman — ihaleal.com",
    description: "Platform lansmanına erken erişim kaydı ve bilgilendirme.",
  },
  "/kunye": {
    title: "Künye — ihaleal.com",
    description: "Platform işletmecisi, iletişim ve yasal künye bilgileri.",
  },
  "/destek": {
    title: "Destek — ihaleal.com",
    description: "Sık karşılaşılan sorunlar ve destek ekibine ulaşma kanalları.",
  },
  "/kullanim-kosullari": {
    title: "Kullanım koşulları — ihaleal.com",
    description: "Platform kullanım koşulları ve kullanıcı yükümlülükleri.",
  },
  "/mesafeli-satis-sozlesmesi": {
    title: "Mesafeli satış ve üyelik sözleşmesi — ihaleal.com",
    description: "Mesafeli satış ve üyelik sözleşmesi metni.",
  },
  "/iade-iptal": {
    title: "İade ve iptal koşulları — ihaleal.com",
    description: "Ücretli hizmetlerde iade ve iptal koşulları.",
  },
  "/aydinlatma-metni": {
    title: "Aydınlatma metni — ihaleal.com",
    description: "KVKK kapsamında kişisel veri işleme aydınlatma metni özeti.",
  },
  "/yasal": {
    title: "Yasal metinler ve rehberler — ihaleal.com",
    description: "KVKK, gizlilik, çerez ve sözleşme metinlerine tek noktadan erişim.",
  },
  "/arastirma/hukuki-cozucu": {
    title: "Hukuki senaryo çözücü — ihaleal.com",
    description: "İhale ve gayrimenkul süreçlerinde sık karşılaşılan hukuki senaryolar için rehber araç.",
  },
  "/yasal/risk-uyarilari": {
    title: "Hukuki risk uyarı sistemi — ihaleal.com",
    description: "Platform içi işlemlerde otomatik hukuki risk uyarı mekanizması özeti.",
  },
  "/yasal/sablonlar": {
    title: "Sözleşme ve belge şablonları — ihaleal.com",
    description: "İhale ve satış süreçlerinde kullanılan sözleşme ve belge şablonları kütüphanesi.",
  },
  "/yasal/dolandiricilik-savunmasi": {
    title: "Dolandırıcılık ve dava riski savunma çerçevesi — ihaleal.com",
    description: "Platform içi dolandırıcılık ve hukuki risklere karşı ürün, hukuk ve teknik kontrol özeti (iç doküman).",
  },
  "/yasal/supabase-uyum": {
    title: "Teknik uyum kontrol listesi — ihaleal.com",
    description: "Veritabanı erişim politikaları ve denetim izi kontrol listesi (iç doküman).",
  },
  "/admin": {
    title: "Yönetim paneli — ihaleal.com",
    description: "Platform yönetim paneli (yetkili erişim).",
  },
  "/aninda-teklif": {
    title: "Anında nakit teklif — ihaleal.com",
    description: "Gayrimenkulünüz için hızlı, nakit satın alma teklifi (demo).",
  },
  "/araclar/finans-uyumluluk": {
    title: "Finans ve uyumluluk çekirdeği — ihaleal.com",
    description: "Ödeme, KYC ve AML akışlarının uyumluluk simülasyon alanı (demo).",
  },
  "/araclar/vergi-simulator": {
    title: "Vergi simülatörü — ihaleal.com",
    description: "Gayrimenkul alım satımında vergi yükü tahmini için simülasyon aracı (demo).",
  },
  "/abone/onay": {
    title: "Abonelik onayı — ihaleal.com",
    description: "E-posta bülteni abonelik onay işlemi.",
  },
  "/abone/iptal": {
    title: "Abonelik iptali — ihaleal.com",
    description: "E-posta bülteni abonelik iptal işlemi.",
  },
  "/uyelik": {
    title: "Üyeliğim — ihaleal.com",
    description: "Üyelik durumu, plan ve fatura bilgileri (hesap paneli).",
  },
  "/uyelik/yillik": {
    title: "Yıllık üyelik — ihaleal.com",
    description: "Yıllık üyelik planı satın alma akışı.",
  },
  "/odeme/baslat": {
    title: "Ödeme başlat — ihaleal.com",
    description: "Üyelik veya hizmet bedeli ödeme akışı başlatma.",
  },
  "/odeme/basarili": {
    title: "Ödeme başarılı — ihaleal.com",
    description: "Ödeme işlemi başarıyla tamamlandı.",
  },
  "/komisyon": {
    title: "Komisyon hesabı ve teminat blokajı — ihaleal.com",
    description: "İşlem bazlı komisyon hesabı ve teminat blokaj özeti (hesap paneli).",
  },
  "/muteahhit/panel": {
    title: "Müteahhit paneli — ihaleal.com",
    description: "Projeleriniz ve lansman birimlerini yönetin (yetkili erişim).",
  },
  "/muteahhit/onay-bekleniyor": {
    title: "Hesap onayı bekleniyor — ihaleal.com",
    description: "Müteahhit hesabı onay süreci bilgilendirmesi.",
  },
  "/muteahhit/yeni-proje": {
    title: "Yeni proje oluştur — ihaleal.com",
    description: "Müteahhit paneli üzerinden yeni proje ve birim kaydı (yetkili erişim).",
  },
  "/emlakci/panel": {
    title: "Emlakçı paneli — ihaleal.com",
    description: "Ofis ilanları ve performans özeti (yetkili erişim).",
  },
  "/kurumsal/dashboard": {
    title: "Kurumsal panel — ihaleal.com",
    description: "Çoklu ofis ve ekip yönetimi paneli (yetkili erişim).",
  },
  // Modüller — her biri ModuleShell title/subtitle içeriğinden türetildi (SSOT: src/pages/modules/*)
  "/modul/bina-risk-sorgu": {
    title: "Bina risk sorgu — TBDY 2018 risk skoru — ihaleal.com",
    description: "Fay mesafesi, zemin, sıvılaşma ve yapı davranışını tek risk skorunda birleştiren sorgu sihirbazı.",
  },
  "/modul/deprem-risk-haritasi": {
    title: "Deprem risk haritası — ihaleal.com",
    description: "Fay, deprem, zemin özeti ve ilan dayanıklılık seçkisini tam ekran harita üzerinde inceleyin.",
  },
  "/modul/canli-deprem-takip": {
    title: "Canlı deprem takibi — ihaleal.com",
    description: "Son 24 saat, 7 gün veya 30 gün penceresinde büyüklük eşikli deprem olay akışı.",
  },
  "/modul/guclendirme-rehberi": {
    title: "Güçlendirme rehberi — ihaleal.com",
    description: "Sekiz güçlendirme yöntemi, maliyet hesaplayıcı ve devlet destekleri karşılaştırması.",
  },
  "/modul/aile-acil-plan": {
    title: "Aile acil planı — ihaleal.com",
    description: "Altı adımda toplanma, iletişim, evrak ve tesisat sırasını netleştiren yazdırılabilir plan.",
  },
  "/modul/airbnb-potansiyel": {
    title: "Airbnb potansiyeli hesaplayıcı — ihaleal.com",
    description: "Kısa dönem kira gelirini hesaplar ve uzun dönem kira ile kıyaslar.",
  },
  "/modul/deprem-cantasi": {
    title: "Deprem çantası listesi — ihaleal.com",
    description: "Hane profiline göre sekiz kategoride çanta listesi ve yenileme takvimi.",
  },
  "/modul/deprem-sigortasi": {
    title: "Deprem sigortası (DASK) karşılaştırma — ihaleal.com",
    description: "DASK prim hesaplayıcı ve sigorta şirketi karşılaştırma tablosu.",
  },
  "/modul/imar-sorgu": {
    title: "İmar sorgu — parsel fizibilite motoru — ihaleal.com",
    description: "Belediye plan notları ve parsel fizibilite motorunu tek ekranda birleştiren sorgu aracı.",
  },
  "/modul/komsuluk-risk-analizi": {
    title: "Komşuluk risk analizi — ihaleal.com",
    description: "Mahalle ölçeğinde deprem skoru dağılımı ve yapay zeka özeti.",
  },
  "/modul/kredi-pazaryeri": {
    title: "Kredi pazaryeri — konut kredisi karşılaştırma — ihaleal.com",
    description: "Banka konut kredisi tekliflerini faiz, taksit ve onay olasılığına göre karşılaştırın.",
  },
  "/modul/portfoy-yonetimi": {
    title: "Portföy yönetimi modülü — ihaleal.com",
    description: "Tüm gayrimenkul varlıklarınızı tek panelde izleyin; değer ve getiri güncellemeleri.",
  },
  "/modul/renovasyon-roi": {
    title: "Renovasyon ROI hesaplayıcı — ihaleal.com",
    description: "Renovasyon yatırımının getirisini gerçek formülle hesaplayan araç.",
  },
  "/modul/sigorta-pazaryeri": {
    title: "Sigorta pazaryeri — ihaleal.com",
    description: "Konut, DASK ve deprem teminatları için çoklu sigorta şirketi teklif karşılaştırması.",
  },
  "/modul/tatbikat-rehberi": {
    title: "Tatbikat rehberi — ihaleal.com",
    description: "İş yeri, okul, site ve kamu senaryoları için adım adım deprem tatbikat kontrol listeleri.",
  },
  "/modul/uzman-randevu": {
    title: "Uzman randevu — ihaleal.com",
    description: "Statik, zemin, mimari proje, ekspertiz, sigorta ve hukuk uzmanlarından randevu alın.",
  },
  "/modul/yapay-zeka-hasar-tahmini": {
    title: "Yapay zeka hasar tahmini — ihaleal.com",
    description: "Bina yaşı ve gözlemlenen hasara göre hasar sınıfı ve ekonomik kayıp tahmini üretir.",
  },
  "/modul/yatirim-onerisi": {
    title: "Yatırım önerisi — ROI hesaplayıcı — ihaleal.com",
    description: "Kira getirisi, kira çarpanı ve geri dönüş süresini hesaplayan yatırım motoru.",
  },
  "/modul/yikilan-binalar-arsivi": {
    title: "Yıkılan binalar arşivi — ihaleal.com",
    description: "Geçmiş deprem olaylarına ait örnek yıkım kayıtları; müteahhit ve denetim firması sorgusu.",
  },
  "/modul/deprem-egitimi": {
    title: "Deprem eğitimi — 10 derslik program — ihaleal.com",
    description: "Okuma, video ve quiz ile ilerleyen on derslik deprem eğitim programı; tamamlayınca sertifika.",
  },
  "/modul/deprem-egitimi/ders-1": {
    title: "Ders 1: Türkiye deprem gerçeği ve fay hatları — ihaleal.com",
    description: "Deprem eğitimi programı birinci ders: Türkiye deprem gerçeği ve fay hatları.",
  },
  "/modul/deprem-egitimi/ders-2": {
    title: "Ders 2: Bina davranışı ve hasar mekanizmaları — ihaleal.com",
    description: "Deprem eğitimi programı ikinci ders: bina davranışı ve hasar mekanizmaları.",
  },
  "/modul/deprem-egitimi/ders-3": {
    title: "Ders 3: Çök-kapan-tutun ve ilk 72 saat — ihaleal.com",
    description: "Deprem eğitimi programı üçüncü ders: çök-kapan-tutun ve ilk 72 saat.",
  },
  "/modul/deprem-egitimi/ders-4": {
    title: "Ders 4: Aile acil planı ve iletişim — ihaleal.com",
    description: "Deprem eğitimi programı dördüncü ders: aile acil planı ve iletişim.",
  },
  "/modul/deprem-egitimi/ders-5": {
    title: "Ders 5: Bina güvenliği ve risk sorgusu — ihaleal.com",
    description: "Deprem eğitimi programı beşinci ders: bina güvenliği ve risk sorgusu.",
  },
  "/modul/deprem-egitimi/ders-6": {
    title: "Ders 6: Güçlendirme ve kentsel dönüşüm — ihaleal.com",
    description: "Deprem eğitimi programı altıncı ders: güçlendirme ve kentsel dönüşüm.",
  },
  "/modul/deprem-egitimi/ders-7": {
    title: "Ders 7: Sigorta, DASK ve hasar süreci — ihaleal.com",
    description: "Deprem eğitimi programı yedinci ders: sigorta, DASK ve hasar süreci.",
  },
  "/modul/deprem-egitimi/ders-8": {
    title: "Ders 8: Kurumsal hazırlık ve tatbikat — ihaleal.com",
    description: "Deprem eğitimi programı sekizinci ders: kurumsal hazırlık ve tatbikat.",
  },
  "/modul/deprem-egitimi/ders-9": {
    title: "Ders 9: Toplumsal dayanışma ve gönüllülük — ihaleal.com",
    description: "Deprem eğitimi programı dokuzuncu ders: toplumsal dayanışma ve gönüllülük.",
  },
  "/modul/deprem-egitimi/ders-10": {
    title: "Ders 10: Uzun vadeli direnç ve sürdürülebilirlik — ihaleal.com",
    description: "Deprem eğitimi programı onuncu ders: uzun vadeli direnç ve sürdürülebilirlik.",
  },
};

export function getSeoForPath(pathname: string) {
  const landing = SEO_LANDING_PAGES.find((p) => p.path === pathname);
  if (landing) {
    return { title: landing.title, description: landing.description };
  }
  const progMatch = pathname.match(/^\/(satilik|kiralik)\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (progMatch) {
    const route = resolveProgrammaticRoute(progMatch[1], progMatch[2], progMatch[3], progMatch[4]);
    if (route) {
      return { title: buildSeoTitle(route), description: buildSeoDescription(route) };
    }
  }
  const borsaCity = pathname.match(/^\/borsa\/sehir\/([^/]+)$/);
  if (borsaCity) {
    const p = findProvince(borsaCity[1]);
    if (p) {
      return {
        title: `${p.name} gayrimenkul fiyat endeksi — ihaleal.com`,
        description: `${p.name} bölgesi price_index ve güncel ilanlar.`,
      };
    }
  }
  const rehberMatch = pathname.match(/^\/rehber\/([^/]+)$/);
  if (rehberMatch) {
    const g = findGuideBySlug(rehberMatch[1]);
    if (g) {
      return { title: `${g.title} — ihaleal.com`, description: g.seoDescription };
    }
  }
  if (pathname.startsWith("/ilan/")) {
    return ROUTE_SEO["/ilan"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/proje/")) {
    return ROUTE_SEO["/proje"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/sehir/")) {
    return {
      title: "Şehir sayfası — ihaleal.com",
      description: "Seçilen şehir için ilanlar ve bölge notları (demo).",
    };
  }
  if (pathname.startsWith("/rapor/")) {
    return {
      title: "Belge detayı — ihaleal.com",
      description: "Analiz ve bilgilendirme metni (demo).",
    };
  }
  if (pathname.startsWith("/blog/")) {
    return {
      title: "Blog yazısı — ihaleal.com",
      description: "Gayrimenkul ve ihale ekosistemine dair yazı (demo).",
    };
  }
  if (pathname === "/emlakci/panel") {
    return ROUTE_SEO["/emlakci/panel"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/emlakci/")) {
    return {
      title: "Emlakçı profili — ihaleal.com",
      description: "Ofis özeti ve demo performans göstergeleri.",
    };
  }
  if (pathname.startsWith("/panel/")) {
    return ROUTE_SEO["/panel"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/borsa/varlik/")) {
    return {
      title: "Varlık detayı — İhaleal Borsa — ihaleal.com",
      description: "Seçilen varlık için fiyat, hacim ve endeks detayları (demo veri).",
    };
  }
  if (pathname.startsWith("/muteahhit/proje/")) {
    return ROUTE_SEO["/muteahhit/panel"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/modul/")) {
    return (
      ROUTE_SEO[pathname] ?? {
        title: "Analiz modülü — ihaleal.com",
        description: "Gayrimenkul analiz ve bilgi modülü.",
      }
    );
  }
  return ROUTE_SEO[pathname] ?? DEFAULT_SEO;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const OG_IMAGE_ALT = "ihaleal.com — gayrimenkul ihale ve analiz platformu ön izleme görseli";

/**
 * Per-route OG image override. Default /og-image.png; rotaya özel
 * varlığı public/'te varsa burada eşlenir. Sosyal paylaşımda her sayfanın
 * kendi bağlamı görünür (LinkedIn/Twitter/WhatsApp önizleme kalitesi).
 *
 * Gelecek: /ilan/:id ve /proje/:id için Edge function ile dinamik
 * OG generator (mülk fotoğrafı + fiyat + lokasyon overlay).
 */
type OgImageConfig = { path: string; width: number; height: number; alt?: string };

const ROUTE_OG_IMAGE: Record<string, OgImageConfig> = {
  "/borsa": {
    path: "/social/share-card-1200.png",
    width: 1200,
    height: 630,
    alt: "İhaleal Borsa — canlı gayrimenkul piyasa terminali",
  },
};

function getOgImageFor(pathname: string): { url: string; width: number; height: number; alt: string } {
  const override = ROUTE_OG_IMAGE[pathname];
  if (override) {
    return {
      url: `${SITE_ORIGIN}${override.path}`,
      width: override.width,
      height: override.height,
      alt: override.alt ?? OG_IMAGE_ALT,
    };
  }
  return {
    url: `${SITE_ORIGIN}${OG_IMAGE.path}`,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    alt: OG_IMAGE_ALT,
  };
}

// SEO-temizleyici: prod'da meta/title'dan "demo" ibarelerini çıkarır.
// Geliştirme/dev ortamında olduğu gibi bırakır (test sırasında uyari ihtiyacı).
function sanitizeForProd(text: string): string {
  if (!import.meta.env.PROD) return text;
  return text
    .replace(/\s*\(demo[^)]*\)\s*/gi, " ")
    .replace(/\s*[—-]\s*demo[^—\n]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Iç doküman sayfaları — kullanıcı linklerinden çıkarıldı + SEO noindex.
// Route hala çalışır (URL bilen iç ekip erişebilir) ama Google ve preview
// crawler'larına "indekslenmesin" sinyali gider.
const NOINDEX_PATHS = new Set<string>([
  "/nihai-anayasa",
  "/platform-cerceve",
  "/anayasa",
  "/anayasa-400",
  "/yasal/dolandiricilik-savunmasi",
  "/yasal/supabase-uyum",
  // Giriş / kayıt — oturum akışları, aratılacak içerik yok.
  "/giris",
  "/kayit",
  "/emlakci-giris",
  "/sifremi-unuttum",
  "/auth/edevis-mock",
  "/onboarding/akis",
  // Panel / dashboard — kullanıcıya özel, oturum gerektiren alanlar.
  "/admin",
  "/muteahhit/panel",
  "/muteahhit/onay-bekleniyor",
  "/muteahhit/yeni-proje",
  "/emlakci/panel",
  "/kurumsal/dashboard",
  "/profil",
  "/favoriler",
  "/mesajlar",
  "/belgeler",
  "/ayarlar",
  "/bildirimler",
  "/aramalarim",
  "/ihale-ac",
  // Ödeme / KYC / abonelik işlemleri — transactional, indekse değersiz.
  "/kyc",
  "/komisyon",
  "/abone/onay",
  "/abone/iptal",
]);

// Prefix bazlı noindex — dinamik segment taşıyan (":id" vb.) veya alt rotaları
// olan panel/dashboard/ödeme/üyelik aileleri için tek tek path eklemek yerine
// önek eşleşmesi kullanılır.
const NOINDEX_PREFIXES = [
  "/panel",
  "/dashboard",
  "/odeme/",
  "/uyelik",
  "/muteahhit/proje/",
];

function isNoindexPath(pathname: string): boolean {
  if (NOINDEX_PATHS.has(pathname)) return true;
  return NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function applySeoToDocument(pathname: string, search: string) {
  const raw = getSeoForPath(pathname);
  const title = sanitizeForProd(raw.title);
  const description = sanitizeForProd(raw.description);
  document.title = title;
  setMeta("name", "description", description);
  const shareUrl = getShareUrlForPath(pathname, search);
  const og = getOgImageFor(pathname);
  const canonicalRoot = getCanonicalHref(pathname);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", shareUrl);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:image", og.url);
  setMeta("property", "og:image:width", String(og.width));
  setMeta("property", "og:image:height", String(og.height));
  setMeta("property", "og:image:alt", og.alt);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:url", shareUrl);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", og.url);
  setMeta("name", "twitter:image:alt", og.alt);
  // robots meta — panel/dashboard/ödeme/kyc/giriş/kayıt ve iç doküman
  // rotalarinda noindex/nofollow (bkz. NOINDEX_PATHS / NOINDEX_PREFIXES).
  if (isNoindexPath(pathname)) {
    setMeta("name", "robots", "noindex, nofollow");
  } else {
    setMeta("name", "robots", "index, follow");
  }
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonicalRoot;

  // hreflang — site tek dilde yayınlanır (URL bazında ayrı dil rotası yok;
  // arayüz dili istemci tarafında localStorage ile seçilir). Bu yüzden
  // ayrı dil URL'leri için sahte hreflang üretmek yerine yalnızca tr +
  // x-default kendine referans verilir (Search Console "alternate URL
  // içeriği eşleşmiyor" uyarısını önler).
  document.querySelectorAll('link[rel="alternate"][data-ihaleal-hreflang]').forEach((el) => el.remove());
  for (const hreflang of ["tr", "x-default"]) {
    const alt = document.createElement("link");
    alt.rel = "alternate";
    alt.setAttribute("hreflang", hreflang);
    alt.setAttribute("data-ihaleal-hreflang", "1");
    alt.href = canonicalRoot;
    document.head.appendChild(alt);
  }
}

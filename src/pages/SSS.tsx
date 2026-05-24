import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Search,
  UserCircle,
} from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

type CategoryId = "genel" | "uye" | "ihale" | "odeme" | "kurumsal";

type Soru = { soru: string; cevap: string; kategori: CategoryId };

const KATEGORILER: { id: CategoryId; baslik: string; icon: typeof HelpCircle }[] = [
  { id: "genel", baslik: "Genel ve platform", icon: HelpCircle },
  { id: "uye", baslik: "Üyelik ve hesap", icon: UserCircle },
  { id: "ihale", baslik: "İhale ve teklif", icon: Search },
  { id: "odeme", baslik: "Ödeme ve güvenlik", icon: CreditCard },
  { id: "kurumsal", baslik: "Kurumsal ve ortaklık", icon: Briefcase },
];

const SORULAR: Soru[] = [
  {
    kategori: "genel",
    soru: "ihaleal.com nedir ve kimi hedefler?",
    cevap:
      "Açık artırma, kapalı teklif ve ilan analitiğini tek akışta birleştiren bir proptech platformudur.",
  },
  {
    kategori: "genel",
    soru: "Demo modu ile canlı ortam arasındaki fark nedir?",
    cevap:
      "Demo modunda ödeme alınmaz ve sonuçlar simüledir. Canlıda KYC, sözleşme ve ödeme entegrasyonu zorunludur.",
  },
  {
    kategori: "genel",
    soru: "Hangi il türlerinde ilan görebilirim?",
    cevap:
      "Konut, arsa, ticari ve karma kullanım örnekleri hedeflenir; kategori listesi pazara göre genişletilir. Detay sayfasındaki etiketler ve şartname metni esastır.",
  },
  {
    kategori: "genel",
    soru: "Mobil uygulama var mı?",
    cevap:
      "Resmi mağaza uygulaması yayın takvimindedir; web arayüzü mobil uyumludur ve ana ekrana ekleyerek hızlı erişim sağlayabilirsiniz.",
  },
  {
    kategori: "genel",
    soru: "Yapay zekâ raporları hukuki tavsiye midir?",
    cevap:
      "Hayır. AI özetleri ve piyasa karşılaştırmaları karar destek içindir; hukuki sonuç doğurmaz. Kesin değerlendirme için uzman görüşü ve resmi kayıtlar gerekir.",
  },
  {
    kategori: "genel",
    soru: "Platform dili ve destek kanalları nelerdir?",
    cevap:
      "Arayüz öncelikle Türkçe olarak tasarlanır. Destek için iletişim formu, e-posta ve yardım sayfaları kullanılabilir.",
  },
  {
    kategori: "uye",
    soru: "Nasıl üye olurum?",
    cevap:
      "Kayıt Ol ile hesabı açın, profilinizi tamamlayın. Yüksek riskli işlemlerde ek kimlik doğrulama istenebilir.",
  },
  {
    kategori: "uye",
    soru: "Şifremi unuttum, ne yapmalıyım?",
    cevap:
      "Giriş ekranındaki Şifremi Unuttum bağlantısından e-postanızı girin. Gelen bağlantıyı kullanarak yeni şifre belirleyin; spam klasörünü kontrol edin.",
  },
  {
    kategori: "uye",
    soru: "Hesabımı nasıl dondurur veya silerim?",
    cevap:
      "Silme veya veri talepleri için destek@ihaleal.com adresine kimlik teyidi ile yazın. İşlem KVKK ve saklama yükümlülükleri çerçevesinde yürütülür.",
  },
  {
    kategori: "uye",
    soru: "Bildirimleri kapatabilir miyim?",
    cevap:
      "Evet. Hesap ayarlarından e-posta veya uygulama içi bildirim tercihlerini kısmen veya tamamen kapatabilirsiniz; kritik güvenlik uyarıları hariç tutulabilir.",
  },
  {
    kategori: "uye",
    soru: "İki aşamalı doğrulama planlanıyor mu?",
    cevap:
      "Kurumsal ve yüksek limitli işlemler için MFA yol haritasında yer alır. Etkinleştirildiğinde hesap güvenliği ekranından yönetilir.",
  },
  {
    kategori: "ihale",
    soru: "Teklif vermek için hangi adımlar gerekir?",
    cevap:
      "Şartnameyi onaylayın, min. artış ve bitişi kontrol edin, teminat/limit uygunsa teklif gönderin.",
  },
  {
    kategori: "ihale",
    soru: "Son dakika teklifinde süre uzar mı?",
    cevap:
      "Anti-sniping kuralları ilan şartnamesinde belirtilir; tipik senaryoda belirli saniye içinde gelen teklif bitişi bir miktar uzatabilir. Kesin kural her ilan için ayrı yazılır.",
  },
  {
    kategori: "ihale",
    soru: "Beraberlikte öncelik nasıl çözülür?",
    cevap:
      "Platform önceliği şartnamede tanımlanır: örneğin ilk ulaşan teklif veya satıcı onayı. Demo ekranlarında gösterilen mantık örnektir.",
  },
  {
    kategori: "ihale",
    soru: "Kapalı teklif ile açık artırma farkı nedir?",
    cevap:
      "Açık artırmada teklifler anlık sıralamayla görünür; kapalı teklifte rakiplerin tutarları kapanışa kadar gizli kalabilir. Satıcı moduna göre biri veya ikisi seçilir.",
  },
  {
    kategori: "ihale",
    soru: "Hemen Al nasıl çalışır?",
    cevap:
      "Satıcı anında satın alma fiyatı belirlerse, bu tutarı ödemeyi taahhüt eden kullanıcı ihale süresi dolmadan süreci kazanabilir; koşullar ilan metnindedir.",
  },
  {
    kategori: "ihale",
    soru: "Teklifimi geri çekebilir miyim?",
    cevap:
      "İlan şartnamesine göre değişir. Genelde kapanışa kadar iptal politikası sıkıdır; kurumsal ihalelerde satıcı onayı veya kesin teminat şartları uygulanır.",
  },
  {
    kategori: "odeme",
    soru: "Ödeme ve teminat emanet hesabında mı tutulur?",
    cevap:
      "Canlıda emanet/bloke akışları ödeme kuruluşu ile yönetilir. Demo ortamında gerçek tahsilat yoktur.",
  },
  {
    kategori: "odeme",
    soru: "Teminat oranı neden %5 olarak gösteriliyor?",
    cevap:
      "Teminat oranı, gerçek teklif niyetini doğrulamak ve sahte teklif riskini azaltmak için hedeflenen başlangıç eşiğidir. Nihai oran, ilan bazlı sözleşmede ve hukuk onayında kesinleşir.",
  },
  {
    kategori: "odeme",
    soru: "Komisyon neden %2 olarak belirtiliyor?",
    cevap:
      "Platform genelinde şeffaflık için %2 (+KDV) hedef komisyon oranı referans verilir. Üretimde nihai oran, satıcı/alıcı sözleşmesine ve hizmet paketine göre değişebilir.",
  },
  {
    kategori: "odeme",
    soru: "Komisyon ve ücretler nasıl hesaplanır?",
    cevap:
      "Oranlar ürün ve sözleşme paketine göre tanımlanır. Fiyatlandırma sayfası referans planlar sunar; nihai ücret tablosu sözleşmede yer alır.",
  },
  {
    kategori: "odeme",
    soru: "KVKK ve veri saklama politikası nerede?",
    cevap:
      "Aydınlatma metni ve çerez politikası yasal bölümde yayınlanır. Kişisel veriler, amaçla sınırlı ve mevzuata uygun işlenir.",
  },
  {
    kategori: "odeme",
    soru: "Dolandırıcılığa karşı ne yapılmalı?",
    cevap:
      "Platform dışı ön ödemeye itibar etmeyin; resmi dekont ve sözleşme hattını kullanın. Şüpheli mesajları destek hattına bildirin.",
  },
  {
    kategori: "odeme",
    soru: "KYC doğrulaması neden istenir?",
    cevap:
      "Yüksek tutarlı teklifler ve kurumsal işlemler için kimlik ve yetki teyidi gerekir; kara para ve dolandırıcılık riskini azaltır.",
  },
  {
    kategori: "kurumsal",
    soru: "Emlak ofisi olarak nasıl ortak olurum?",
    cevap:
      "Kurumsal formdan pilot başvuru yapın; entegrasyon ve ekip yetkileri birlikte planlanır.",
  },
  {
    kategori: "kurumsal",
    soru: "API ve webhook desteği var mı?",
    cevap:
      "Kurumsal planda entegrasyon hedeflenir; uç noktalar ve güvenlik modeli teknik dokümanda paylaşılır. Demo sürümünde canlı API kısıtlı olabilir.",
  },
  {
    kategori: "kurumsal",
    soru: "Müteahhit ve GYO için özel panel var mı?",
    cevap:
      "Çoklu ilan, raporlama ve onay akışları kurumsal panellerde toplanır. Özellik seti sözleşme paketine göre açılır.",
  },
  {
    kategori: "kurumsal",
    soru: "Eğitim ve müşteri başarısı sunuyor musunuz?",
    cevap:
      "Pilot müşterilere süreç eğitimi ve şablon şartname desteği sağlanır; büyük roll-out'larda sahaya yakın destek planı yapılır.",
  },
  {
    kategori: "kurumsal",
    soru: "Kampanyalar tüm kullanıcılara aynı mı uygulanır?",
    cevap:
      "Hayır. Kampanya kapsamı segment, bölge ve işlem tipine göre değişebilir; detaylar kampanya kartlarında belirtilir.",
  },
  {
    kategori: "ihale",
    soru: "İhalenin adil yürütüldüğünü nasıl anlarım?",
    cevap:
      "Teklif zamanları, kural seti ve kapanış kayıtları denetlenebilir tutulur. Nihai kural ilan şartnamesidir.",
  },
  {
    kategori: "odeme",
    soru: "İade süresi neye göre belirlenir?",
    cevap:
      "İade penceresi ilan tipi ve sözleşmeye göre değişir; referans süreler ücret/koşul sayfalarında yayınlanır.",
  },
];

function normalizeTr(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export default function SSS() {
  const [acik, setAcik] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [kat, setKat] = useState<CategoryId | "hepsi">("hepsi");

  const filtered = useMemo(() => {
    const nq = normalizeTr(q.trim());
    return SORULAR.filter((item) => {
      if (kat !== "hepsi" && item.kategori !== kat) return false;
      if (!nq) return true;
      const haystack = normalizeTr(`${item.soru} ${item.cevap}`);
      return haystack.includes(nq);
    });
  }, [q, kat]);

  return (
    <PageShell
      badge="Yardım"
      title="Sıkça sorulan sorular"
      subtitle="Kategori seç, sorunu ara, cevabı hızlıca gör. Nihai hukuki çerçeve için ilan şartnamesi ve sözleşmeyi esas al."
      cta={{ label: "İletişime geç", to: "/iletisim" }}
    >
      <section className="grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Üyelik", desc: "Kayıt, giriş, güvenlik" },
          { title: "İhale", desc: "Teklif, kapanış, kurallar" },
          { title: "Ödeme", desc: "Teminat, komisyon, iade" },
          { title: "Kurumsal", desc: "Ofis, entegrasyon, ortaklık" },
        ].map((card) => (
          <article key={card.title} className="card-warm !p-4">
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{card.title}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>{card.desc}</p>
          </article>
        ))}
      </section>

      <section className="py-8 flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 card-warm flex items-center gap-3 px-4 py-3">
          <Search className="w-5 h-5 shrink-0" style={{ color: "var(--color-primary)" }} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Örn. teklif, KYC, komisyon..."
            className="w-full bg-transparent border-none outline-none text-sm py-2"
            style={{ color: "var(--color-text)" }}
            aria-label="SSS araması"
          />
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => setKat("hepsi")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ring-offset-[var(--color-bg)] ${
              kat === "hepsi" ? "ring-2 ring-[var(--color-primary)] ring-offset-1" : ""
            }`}
            style={{
              borderColor: "var(--color-border)",
              color: kat === "hepsi" ? "var(--color-primary)" : "var(--color-text-muted)",
              background: kat === "hepsi" ? "var(--color-bg-soft)" : "transparent",
            }}
          >
            Tümü
          </button>
          {KATEGORILER.map((k) => {
            const Icon = k.icon;
            const active = kat === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKat(k.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ring-offset-[var(--color-bg)] ${
                  active ? "ring-2 ring-[var(--color-primary)] ring-offset-1" : ""
                }`}
                style={{
                  borderColor: "var(--color-border)",
                  color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                  background: active ? "var(--color-bg-soft)" : "transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {k.baslik}
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-6 space-y-3 pb-16">
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Sonuç bulunamadı. Farklı anahtar kelimeler deneyin veya filtreyi sıfırlayın.
          </p>
        ) : (
          filtered.map((item) => {
            const globalIdx = SORULAR.indexOf(item);
            const open = acik === globalIdx;
            return (
              <div key={`${item.soru}-${globalIdx}`} className="card-warm overflow-hidden !p-0">
                <button
                  type="button"
                  onClick={() => setAcik(open ? null : globalIdx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors hover:brightness-110"
                  style={{ color: "var(--color-text)" }}
                >
                  <span className="font-medium pr-2">{item.soru}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </button>
                {open ? (
                  <div
                    className="px-5 pb-4 pt-0 text-sm leading-relaxed border-t"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                  >
                    {item.cevap}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </section>

      <section
        className="py-12 text-center rounded-2xl border mb-8"
        style={{
          borderColor: "var(--color-border)",
          background: "linear-gradient(135deg, rgba(37,99,235,0.12), transparent)",
        }}
      >
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          Cevabını bulamadınız mı?
        </h2>
        <p className="text-sm max-w-lg mx-auto mb-6" style={{ color: "var(--color-text-muted)" }}>
          Ekibimize mesaj bırakın; iş günleri içinde yanıt vermeyi hedefliyoruz.
        </p>
        <Link to="/iletisim" className="btn-primary inline-flex gap-2 items-center">
          İletişim formu
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </PageShell>
  );
}

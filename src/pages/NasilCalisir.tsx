import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  Gavel,
  Handshake,
  Home,
  LineChart,
  MapPin,
  PlayCircle,
  Shield,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/marketing/PageShell";
import { FEES, formatBidBondPercent } from "@/lib/fees";

type JourneySlug = "alici" | "satici" | "danisman" | "kurumsal" | "operasyon";

const YOLCULUKLAR: {
  slug: JourneySlug;
  baslik: string;
  ozet: string;
  icon: typeof Home;
  adımlar: { baslik: string; metin: string; icon: typeof Home }[];
}[] = [
  {
    slug: "alici",
    baslik: "Alıcı ve yatırımcı",
    ozet: "İlan keşfinden teklif netleşmesine kadar uçtan uca güvenli rota.",
    icon: Home,
    adımlar: [
      { baslik: "Keşif ve filtreleme", metin: "Konum, bütçe ve ilan türüne göre arayın; AI özetleri karar destek içindir.", icon: MapPin },
      { baslik: "Detay ve analiz", metin: "Şartname, görseller ve piyasa kıyasını okuyun; risk işaretleri ilan kartında vurgulanır.", icon: LineChart },
      { baslik: "Teminat ve teklif", metin: "Ön yetki ve teklif adımlarında kutuları tek tek onaylayın; minimum artışa uyun.", icon: Gavel },
      { baslik: "Kapanış ve tapu hazırlığı", metin: "Kazanan netleşince sözleşme ve ödeme hattına yönlendirilirsiniz (üretim planı).", icon: ClipboardCheck },
    ],
  },
  {
    slug: "satici",
    baslik: "Satıcı ve malik",
    ozet: "İlan yayınından en iyi teklifi seçmeye kadar kontrollü süreç.",
    icon: UserCheck,
    adımlar: [
      { baslik: "Portföy bilgisi", metin: "Tapu, imar ve varsa kiracı durumunu eksiksiz girin; yanlış beyan riskini azaltır.", icon: FileText },
      { baslik: "İlan modeli seçimi", metin: "Açık artırma, kapalı teklif veya hibrit; süre ile Hemen Al eşiğini belirleyin.", icon: PlayCircle },
      { baslik: "Teklif izleme", metin: "Panoda teklif yoğunluğu ve katılımcı sayısını takip edin; gerekirse soru-cevap turu açın.", icon: LineChart },
      { baslik: "Kazanan ile sözleşme", metin: "Müzakerede anlaşılan rakam sözleşmeye işlenir; tapu için vekalet ve evrak listesi üretilir.", icon: Handshake },
    ],
  },
  {
    slug: "danisman",
    baslik: "Emlak danışmanı",
    ozet: "Müşteri portföyünü profesyonel araçlarla yönetme.",
    icon: Building2,
    adımlar: [
      { baslik: "Yetki ve vekalet", metin: "Satıcıdan yetki alın; platforma yüklenen belgeler denetim izi ile saklanır.", icon: FileText },
      { baslik: "Çoklu ilan yönetimi", metin: "Kota dahilinde ilan açın; şablonlarla süre ve tavan fiyatını hızlı ayarlayın.", icon: Building2 },
      { baslik: "Müşteri ile paylaşım", metin: "Özel bağlantı ve rapor çıktılarıyla alıcıyı bilgilendirin; şeffaf iletişim.", icon: UserCheck },
      { baslik: "Kapanış desteği", metin: "Komisyon ve fatura adımları üretimde netleşir; operasyon ekibiyle senkron kalın.", icon: ClipboardCheck },
    ],
  },
  {
    slug: "kurumsal",
    baslik: "Müteahhit ve GYO",
    ozet: "Proje çıkışlarında ölçek ve raporlama.",
    icon: Building2,
    adımlar: [
      { baslik: "Lot ve faz planı", metin: "Çok ünite ve fazlı satış için gruplu ilanlar oluşturun; stok gerçek zamanlı güncellenir.", icon: MapPin },
      { baslik: "Rol ve onay", metin: "Finans ve hukuk onay hatları ile teklif kapanışları çift kontrollü yapılabilir.", icon: Shield },
      { baslik: "Kurumsal rapor", metin: "Pazarlık seviyesi, süre ve dönüşüm oranları yönetim özetine aktarılır.", icon: LineChart },
      { baslik: "Entegrasyon", metin: "CRM ve ERP ile webhook; kurumsal planda API kotası genişletilir.", icon: Handshake },
    ],
  },
  {
    slug: "operasyon",
    baslik: "Platform operasyonu",
    ozet: "İç ekip ve uyum için referans katmanlar.",
    icon: Shield,
    adımlar: [
      { baslik: "Kural motoru", metin: "Minimum artış, uzatma, ücret matrisi ve ülke ayarları merkezi yapılandırmadan okunur.", icon: Gavel },
      { baslik: "KYC ve risk", metin: "Kimlik ve kara liste taramaları yüksek tutarlı işlemler için devreye alınır (yol haritası).", icon: UserCheck },
      { baslik: "Bildirim ve kanıt", metin: "E-posta ve uygulama içi olaylar kayıt altına alınır; süre tutanakları üretilir.", icon: FileText },
      { baslik: "Destek ve SLA", metin: "Öncelik kuyrukları plana göre ayrılır; kritik arızalarda nöbet hattı hedeflenir.", icon: ClipboardCheck },
    ],
  },
];

const MINI_SSS = [
  {
    soru: "Teklifim geçerli sayılması için AI raporunu onaylamak zorunlu mu?",
    cevap:
      "Demo akışında güvenlik ve uyum simülasyonu için sıkça istenir. Canlı üretimde ilan şartnamesi ve regülasyon hangi onayların zorunlu olduğunu belirler.",
  },
  {
    soru: "Teminat yüzdesi nereden geliyor?",
    cevap: `Referans bid bond yüzdesi şu anda ${formatBidBondPercent()} olarak yapılandırmada tutulur; yasal metinler onaylandığında güncellenir.`,
  },
  {
    soru: "Bakiye iade penceresi ne kadar?",
    cevap: `Taslak refund penceresi ${FEES.refundWindowDays} gün olarak referans alınır; teklif koşullarında farklı yazılabilir.`,
  },
  {
    soru: "Kapalı teklifte kimler fiyat görür?",
    cevap: "Kapanışa kadar yalnızca satıcı ve yetkili operasyon rolleri tüm teklifleri görebilir; katılımcılar kendi tekliflerini görür.",
  },
  {
    soru: "Yurtdışından katılabilir miyim?",
    cevap: "Ülke ve ödeme kurallarına göre değişir; bazı ihaleler yalnızca yerel kimlikle sınırlanabilir. İlan etiketlerini okuyun.",
  },
  {
    soru: "Video oynatılamıyorsa ne yapmalıyım?",
    cevap: "Dosya yolunun /videos/ihaleal-tanitim.mp4 olarak erişilebilir olduğundan emin olun; ağ kısıtı veya tarayıcı otomatik oynatma engelleri devre dışı bırakılabilir.",
  },
];

function isJourneySlug(v: string | null): v is JourneySlug {
  return v === "alici" || v === "satici" || v === "danisman" || v === "kurumsal" || v === "operasyon";
}

export default function NasilCalisir() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const yParam = searchParams.get("yol");
  const aktifYol: JourneySlug = isJourneySlug(yParam) ? yParam : "alici";

  const setYol = (slug: JourneySlug) => {
    setSearchParams({ yol: slug }, { replace: true });
  };

  return (
    <PageShell
      badge="Rehber"
      title="Nasıl çalışır?"
      subtitle="Tanıtım videosu ve beş tipik yolculuk: her biri dört adımda özetlenir. Süreler ve ücretler yapılandırılabilir; hukuki kesinlik ilan şartnamesi ve sözleşmededir."
      cta={{ label: "Canlı ihaleler", to: "/ihaleler" }}
    >
      <div className="pb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-4 -ml-2" style={{ color: "var(--color-text-muted)" }}>
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Button>
      </div>

      <section className="py-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <PlayCircle className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl font-bold text-center" style={{ color: "var(--color-text)" }}>
            Tanıtım videosu
          </h2>
        </div>
        <p className="text-sm text-center max-w-2xl mx-auto mb-6" style={{ color: "var(--color-text-muted)" }}>
          ihaleal ürün vizyonunu iki dakikada özetleyen görsel anlatım. Dosya{" "}
          <code className="text-xs px-1 rounded" style={{ background: "var(--color-bg-soft)" }}>
            public/videos/ihaleal-tanitim.mp4
          </code>{" "}
          altından servis edilir.
        </p>
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: "var(--color-border)" }}>
          <video className="w-full aspect-video bg-black" controls playsInline preload="metadata">
            <source src="/videos/ihaleal-tanitim.mp4" type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        </div>
      </section>

      <section className="py-8 rounded-2xl border px-4 md:px-6 mb-10" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-soft)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          <Shield className="w-4 h-4 inline-block mr-1 align-text-bottom" style={{ color: "var(--color-primary)" }} />
          <strong style={{ color: "var(--color-text)" }}>Referans teminat: </strong>
          Kazanan taraf için bid bond referansı {formatBidBondPercent()}; bakiye tamamlama penceresi {FEES.refundWindowDays} gün — detay{" "}
          <code className="text-xs">fees.ts</code>.
        </p>
      </section>

      <section className="pb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center" style={{ color: "var(--color-text)" }}>
          Beş yolculuk, her biri dört adım
        </h2>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {YOLCULUKLAR.map((y) => {
            const Icon = y.icon;
            const active = aktifYol === y.slug;
            return (
              <button
                key={y.slug}
                type="button"
                onClick={() => setYol(y.slug)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-transform"
                style={{
                  borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  background: active ? "rgba(37,99,235,0.12)" : "var(--color-bg-card)",
                  color: "var(--color-text)",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                {y.baslik}
              </button>
            );
          })}
        </div>

        {YOLCULUKLAR.filter((y) => y.slug === aktifYol).map((y) => {
          const HeroIcon = y.icon;
          return (
            <div key={y.slug} className="card-warm mb-10">
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
                >
                  <HeroIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                    {y.baslik}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {y.ozet}
                  </p>
                </div>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {y.adımlar.map((adim, i) => {
                  const StepIcon = adim.icon;
                  return (
                    <li key={adim.baslik} className="flex gap-4 rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm text-white"
                        style={{ background: "var(--color-primary)" }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StepIcon className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                          <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                            {adim.baslik}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                          {adim.metin}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </section>

      <section className="py-10 mb-8">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--color-text)" }}>
          Mini SSS
        </h2>
        <div className="max-w-3xl mx-auto space-y-2">
          {MINI_SSS.map((row) => (
            <details key={row.soru} className="group card-warm overflow-hidden">
              <summary
                className="cursor-pointer px-5 py-4 text-sm font-medium list-none flex justify-between gap-4 items-center"
                style={{ color: "var(--color-text)" }}
              >
                {row.soru}
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" style={{ color: "var(--color-text-muted)" }} />
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed border-t" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                {row.cevap}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="py-12 flex flex-wrap gap-4 justify-center border-t" style={{ borderColor: "var(--color-border)" }}>
        <Link to="/ihaleler" className="btn-primary inline-flex gap-2">
          İhale listesi
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/sss"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border font-semibold"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Tüm SSS
        </Link>
        <Link to="/iletisim" className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--color-primary)" }}>
          Kurumsal görüşme
        </Link>
      </section>
    </PageShell>
  );
}

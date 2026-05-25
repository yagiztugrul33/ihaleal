import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Crown,
  HelpCircle,
  Layers,
  Mail,
  Rocket,
  Send,
  User,
  X,
} from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMMISSION_RATE, MEMBERSHIP_FEES, VAT_RATE, feeBadgeLabel } from "@/lib/fees";
import { z } from "zod";

const PLANS = [
  {
    name: "Free",
    price: "Ücretsiz",
    desc: "Bireysel danışmanlar için başlangıç paketi",
    features: ["5 ilan / ay", "Temel analitik paneli", "E-posta destek sırası"],
    highlight: false,
    ctaTo: "/giris",
    ctaLabel: "Ücretsiz başla",
  },
  {
    name: "Agency",
    price: "₺2.490 / ay",
    desc: "1-10 kişilik ofisler için operasyon paketi",
    features: ["100 ilan / ay", "5 kullanıcı koltuğu", "Kapalı teklif modülü", "Öncelikli destek hattı"],
    highlight: true,
    ctaTo: "/emlakci-ortaklik",
    ctaLabel: "Agency'ye geç",
  },
  {
    name: "GYO",
    price: "₺7.490 / ay",
    desc: "Yüksek hacimli kurumsal portföy yönetimi",
    features: ["Sınırsız ilan", "25 kullanıcı koltuğu", "API + webhook erişimi", "Özel hesap yöneticisi"],
    highlight: false,
    ctaTo: "/kurumsal/iletisim",
    ctaLabel: "GYO demo iste",
  },
  {
    name: "Enterprise",
    price: "Özel teklif",
    desc: "50+ kullanıcı, çoklu şirket ve SLA ihtiyacı",
    features: ["Sınırsız kullanıcı/ofis", "SSO-SAML", "White-label opsiyonu", "SLA sözleşmesi"],
    highlight: false,
    ctaTo: "/kurumsal/iletisim",
    ctaLabel: "Kurumsal görüşme planla",
  },
] as const;

const COMPARE_ROWS: { feature: string; free: string; agency: string; gyo: string; enterprise: string }[] = [
  { feature: "Aylık ilan kotası", free: "5", agency: "100", gyo: "Sınırsız", enterprise: "Sınırsız" },
  { feature: "Kullanıcı koltuğu", free: "1", agency: "5", gyo: "25", enterprise: "Özel" },
  { feature: "Kapalı teklif odaları", free: "✗", agency: "✓", gyo: "✓", enterprise: "✓" },
  { feature: "AI fiyat bandı", free: "Temel", agency: "Gelişmiş", gyo: "Kurumsal", enterprise: "Özel model" },
  { feature: "Bölge trend raporu", free: "✗", agency: "✓", gyo: "✓", enterprise: "✓" },
  { feature: "REST API erişimi", free: "✗", agency: "✗", gyo: "✓", enterprise: "✓" },
  { feature: "Webhook olayları", free: "✗", agency: "✗", gyo: "✓", enterprise: "✓" },
  { feature: "SSO / SAML", free: "✗", agency: "✗", gyo: "✗", enterprise: "✓" },
  { feature: "SLA ve hesap yöneticisi", free: "✗", agency: "✗", gyo: "✓", enterprise: "✓" },
  { feature: "White-label opsiyonu", free: "✗", agency: "✗", gyo: "✗", enterprise: "✓" },
  { feature: "Ücret modeli", free: "Üyeliksiz", agency: "Aylık + komisyon", gyo: "Aylık + komisyon", enterprise: "Sözleşmeli" },
];

const FiyatSSS = [
  {
    q: "Satış komisyonu nasıl hesaplanıyor?",
    a: `Model satıcı %${(COMMISSION_RATE * 100).toFixed(0)} + alıcı %${(COMMISSION_RATE * 100).toFixed(
      0,
    )} ve komisyon üzerinden KDV %${(VAT_RATE * 100).toFixed(0)} mantığıyla ilerler.`,
  },
  {
    q: "Kiralık işlemlerde model nedir?",
    a: "Kiralıkta referans model 1 kira bedeli + KDV şeklindedir; detay sözleşme ve mevzuatla netleşir.",
  },
  {
    q: "Yıllık üyelik ücretleri ne kadar?",
    a: `Satıcı yıllık üyelik ${MEMBERSHIP_FEES.seller_yearly.toLocaleString(
      "tr-TR",
    )} TL, alıcı yıllık üyelik ${MEMBERSHIP_FEES.buyer_yearly.toLocaleString("tr-TR")} TL olarak uygulanır.`,
  },
  {
    q: "Agency planı kime uygun?",
    a: "Düzenli ilan yayınlayan ve ekip içi görev paylaşımı yapan 1-10 kişilik ofisler için önerilir.",
  },
  {
    q: "GYO ve Enterprise farkı nedir?",
    a: "GYO sabit kurumsal ihtiyaçları kapsar, Enterprise ise SSO, SLA ve özel entegrasyon gibi ileri özelleştirmeler içerir.",
  },
  {
    q: "Planlar arası geçiş yapılabiliyor mu?",
    a: "Evet, işlem yoğunluğuna göre plan yükseltme/düşürme yapılır; geçiş tarihi mevcut dönem sonunda uygulanır.",
  },
];

const demoSchema = z.object({
  firma: z.string().min(2),
  email: z.string().email(),
  not: z.string().optional(),
});

type WizardRole = "free" | "agency" | "gyo" | "enterprise" | null;
type WizardVolume = "dusuk" | "orta" | "yuksek" | null;

function wizardPlan(role: WizardRole, volume: WizardVolume): string {
  if (!role || !volume) return "Seçimlerinizi tamamlayın.";
  if (role === "free") return "Free plan uygun: platformu düşük hacimde maliyetsiz test edebilirsiniz.";
  if (role === "agency" && (volume === "dusuk" || volume === "orta")) return "Agency plan önerilir: ekip ve teklif operasyonu için dengeli kapsama sağlar.";
  if (role === "agency" && volume === "yuksek") return "Yüksek hacim için Agency üstü GYO planına geçiş düşünülmeli.";
  if (role === "gyo") return "GYO planı uygun: API, çoklu ekip ve raporlama ile kurumsal operasyonu yönetir.";
  if (role === "enterprise") return "Enterprise planı uygun: SSO, SLA ve özel entegrasyon gerektiren yapılara yöneliktir.";
  return "Satış ekibiyle görüşün.";
}

function renderCompareCell(value: string) {
  if (value === "✓") return <Check className="mx-auto h-4 w-4 text-emerald-300" />;
  if (value === "✗") return <X className="mx-auto h-4 w-4 text-slate-500" />;
  return value;
}

export default function FiyatlandirmaPage() {
  const [wn1, setWn1] = useState<WizardRole>(null);
  const [wn2, setWn2] = useState<WizardVolume>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [demo, setDemo] = useState({ firma: "", email: "", not: "" });
  const [demoErr, setDemoErr] = useState<Record<string, string>>({});
  const [demoSending, setDemoSending] = useState(false);

  const toast = (message: string) => {
    window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message, type: "success" } }));
  };

  const onDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoErr({});
    const r = demoSchema.safeParse(demo);
    if (!r.success) {
      const fe: Record<string, string> = {};
      r.error.issues.forEach((i) => {
        if (i.path[0]) fe[i.path[0] as string] = i.message;
      });
      setDemoErr(fe);
      return;
    }
    setDemoSending(true);
    window.setTimeout(() => {
      setDemoSending(false);
      setDemo({ firma: "", email: "", not: "" });
      toast("Demo talebiniz alındı. Satış ekibi 1–2 iş günü içinde dönüş yapacaktır.");
    }, 700);
  };

  return (
    <PageShell
      badge="Fiyatlandırma"
      title="İhtiyacınıza uygun plan"
      subtitle="Free, Agency, GYO ve Enterprise planlarını net kapsamlarla kıyaslayın; üyelik ve komisyon modelini tek sayfada görün."
    >
      <section className="rounded-2xl border border-blue-500/25 bg-blue-950/30 px-5 py-4 text-sm text-slate-200">
        <p className="font-semibold text-blue-100">Komisyon mantığı (özet)</p>
        <p className="mt-1">
          Satış modeli: satıcı %{(COMMISSION_RATE * 100).toFixed(0)} + alıcı %{(COMMISSION_RATE * 100).toFixed(0)} +
          KDV %{(VAT_RATE * 100).toFixed(0)}. Kiralık model: 1 kira bedeli + KDV.
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Yıllık üyelik: satıcı {MEMBERSHIP_FEES.seller_yearly.toLocaleString("tr-TR")} TL, alıcı{" "}
          {MEMBERSHIP_FEES.buyer_yearly.toLocaleString("tr-TR")} TL.
        </p>
        <p className="mt-1 text-xs text-slate-400">Satış etiket özeti: {feeBadgeLabel()}</p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="card-warm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-300">Maliyet Çerçevesi</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan bedeli + komisyon + KDV birlikte okunur. Operasyon hacmi arttıkça sabit ücretten çok süreç verimi kritik hale gelir.
          </p>
        </article>
        <article className="card-warm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">Geçiş Disiplini</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan yükseltme/düşürme aylık ritimde yönetilir; ekip koltuğu, API ve destek SLA’sı sözleşmede netleşir.
          </p>
        </article>
        <article className="card-warm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">Hızlı Aksiyon</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Önce <Link to="/komisyon-hesaplayici" className="text-primary hover:text-foreground">komisyon simülasyonu</Link>, sonra demo talebi.
            Böylece plan seçimi veriyle yapılır.
          </p>
        </article>
      </section>

      <section className="py-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className="card-warm relative"
            style={{
              borderColor: p.highlight ? "var(--color-primary)" : undefined,
              background: p.highlight ? "rgba(37,99,235,0.1)" : undefined,
            }}
          >
            {p.highlight ? (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full text-white"
                style={{ background: "var(--color-accent)" }}
              >
                Popüler
              </span>
            ) : null}
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              {p.name}
            </h2>
            <p className="text-3xl font-bold my-2" style={{ color: "var(--color-primary)" }}>
              {p.price}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-blue-300">{p.desc}</p>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              {p.name === "Free"
                ? "Bireysel başlangıç ve düşük hacimli denemeler için."
                : p.name === "Agency"
                  ? "Ofis operasyonu ve ekip yönetimi odaklı orta hacim."
                  : p.name === "GYO"
                    ? "Kurumsal portföy, entegrasyon ve çoklu ekip ihtiyacı."
                    : "SLA, SSO ve özel entegrasyon gerektiren büyük yapılar."}
            </p>
            <ul className="space-y-2 text-sm mb-6">
              {p.features.map((f) => (
                <li key={f} style={{ color: "var(--color-text-muted)" }}>
                  + {f}
                </li>
              ))}
            </ul>
            <Link to={p.ctaTo} className="btn-primary block text-center text-sm">
              {p.ctaLabel}
            </Link>
            <div className="mt-2 flex items-center justify-center gap-3 text-[11px]">
              <Link to="/komisyon-modeli" className="text-slate-400 hover:text-blue-300">
                Komisyon modeli
              </Link>
              <Link to="/hizmet-bedelleri" className="text-slate-400 hover:text-blue-300">
                Hizmet bedelleri
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="py-10 grid gap-8 lg:grid-cols-2">
        <div className="card-warm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
              Plan sihirbazı (mini)
            </h2>
          </div>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            İki soruda hangi planın daha mantıklı olduğuna dair iç öneri; nihai teyit satış ve sözleşme ile yapılır.
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                1. Rolünüz
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "free" as const, label: "Bireysel başlangıç (Free)", icon: User },
                  { id: "agency" as const, label: "Ajans/Ofis (Agency)", icon: Building2 },
                  { id: "gyo" as const, label: "GYO/Kurumsal", icon: Rocket },
                  { id: "enterprise" as const, label: "Enterprise ağ", icon: Layers },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = wn1 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWn1(opt.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{
                        borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                        background: active ? "var(--color-bg-soft)" : "transparent",
                        color: "var(--color-text)",
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                2. Aylık ilan hacmi (tahmini)
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "dusuk" as const, label: "1 — 10" },
                  { id: "orta" as const, label: "11 — 40" },
                  { id: "yuksek" as const, label: "40+" },
                ].map((opt) => {
                  const active = wn2 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWn2(opt.id)}
                      className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{
                        borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                        background: active ? "var(--color-bg-soft)" : "transparent",
                        color: "var(--color-text)",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div
              className="rounded-xl p-4 border text-sm leading-relaxed"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-soft)" }}
            >
              <strong style={{ color: "var(--color-text)" }}>Öneri: </strong>
              <span style={{ color: "var(--color-text-muted)" }}>{wizardPlan(wn1, wn2)}</span>
            </div>
            <Link to="/kurumsal/iletisim" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              Teklif iste
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <form onSubmit={onDemo} className="card-warm space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
              Canlı demo talebi
            </h2>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Kurumsal ekip için 30 dakikalık ürün turu. Takvim davetiyesi e-posta ile paylaşılır.
          </p>
          <div>
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: "var(--color-text-muted)" }}>
              Firma / ekip adı
            </label>
            <Input
              value={demo.firma}
              onChange={(e) => setDemo({ ...demo, firma: e.target.value })}
              className="bg-[var(--color-bg-card)] border border-border text-[var(--color-text)]"
            />
            {demoErr.firma ? <p className="text-xs text-red-400 mt-1">{demoErr.firma}</p> : null}
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: "var(--color-text-muted)" }}>
              İş e-postası
            </label>
            <Input
              type="email"
              value={demo.email}
              onChange={(e) => setDemo({ ...demo, email: e.target.value })}
              className="bg-[var(--color-bg-card)] border border-border text-[var(--color-text)]"
            />
            {demoErr.email ? <p className="text-xs text-red-400 mt-1">{demoErr.email}</p> : null}
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: "var(--color-text-muted)" }}>
              Not (isteğe bağlı)
            </label>
            <Input
              value={demo.not ?? ""}
              onChange={(e) => setDemo({ ...demo, not: e.target.value })}
              className="bg-[var(--color-bg-card)] border border-border text-[var(--color-text)]"
              placeholder="Örn. il sayısı, entegrasyon ihtiyacı"
            />
          </div>
          <Button type="submit" disabled={demoSending} className="w-full btn-primary gap-2 !flex !justify-center">
            <Send className="w-4 h-4" />
            {demoSending ? "Gönderiliyor..." : "Demo talep et"}
          </Button>
        </form>
      </section>

      <section className="py-12 overflow-x-auto">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--color-text)" }}>
          Özellik karşılaştırması (Free / Agency / GYO / Enterprise)
        </h2>
        <table className="w-full min-w-[760px] text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
              <th className="text-left py-3 px-2" style={{ color: "var(--color-text-muted)" }}>
                Özellik
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Free
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Agency
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                GYO
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.feature} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td className="py-3 px-2 font-medium" style={{ color: "var(--color-text)" }}>
                  {row.feature}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {renderCompareCell(row.free)}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {renderCompareCell(row.agency)}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {renderCompareCell(row.gyo)}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {renderCompareCell(row.enterprise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="py-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-amber-300" />
          <h2 className="text-xl font-bold text-center" style={{ color: "var(--color-text)" }}>
            Hangi plan bana uygun?
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Yeni başlayan bireysel danışman", "Free", "Düşük hacimde maliyetsiz başlamak isteyenler."],
            ["Düzenli işlem yapan ofis", "Agency", "Ekip yönetimi ve kapalı teklif akışı gerekir."],
            ["GYO / kurumsal portföy", "GYO", "Yüksek hacim, API ve detaylı raporlama beklentisi."],
            ["Büyük ağ / holding yapısı", "Enterprise", "SSO, SLA ve özel entegrasyon ihtiyacı."],
          ].map(([title, plan, desc]) => (
            <div key={title} className="card-warm">
              <p className="text-xs uppercase tracking-wide text-blue-300">{plan}</p>
              <h3 className="mt-1 font-semibold" style={{ color: "var(--color-text)" }}>
                {title}
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 pb-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <HelpCircle className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl font-bold text-center" style={{ color: "var(--color-text)" }}>
            Plan & fiyatlandırma SSS
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {FiyatSSS.map((item, idx) => {
            const open = faqOpen === idx;
            return (
              <div key={item.q} className="card-warm !p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFaqOpen(open ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                  style={{ color: "var(--color-text)" }}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </button>
                {open ? (
                  <div
                    className="px-5 pb-4 text-sm leading-relaxed border-t"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                  >
                    {item.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

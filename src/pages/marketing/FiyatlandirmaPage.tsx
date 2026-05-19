import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  HelpCircle,
  Layers,
  Mail,
  Rocket,
  Send,
  User,
} from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const PLANS = [
  {
    name: "Bireysel",
    price: "Ücretsiz",
    desc: "İlk adım: keşif ve sınırlı ilan deneyimi",
    features: ["5 ilan / ay (referans kotası)", "Temel analitik paneli", "E-posta destek sırası"],
    highlight: false,
  },
  {
    name: "Profesyonel",
    price: "₺1.490 / ay",
    desc: "Yoğun emlak danışmanları ve broker ajansları",
    features: ["50 ilan / ay (yükseltilebilir)", "Kapalı teklif modülü", "Öncelikli destek hattı", "Gelişmiş fiyat içgörüleri"],
    highlight: true,
  },
  {
    name: "Kurumsal",
    price: "Özel fiyat",
    desc: "GYO, müteahhit ve portföy yöneticileri",
    features: ["Sınırsız ilan (adil kullanım)", "API ve webhook erişimi", "SLA ve hesap yöneticisi", "Özel raporlama ve etiketler"],
    highlight: false,
  },
] as const;

const COMPARE_ROWS: { feature: string; bireysel: string; pro: string; kurumsal: string }[] = [
  { feature: "Aylık ilan kotası", bireysel: "5", pro: "50", kurumsal: "Sınırsız" },
  { feature: "Kullanıcı koltuğu", bireysel: "1", pro: "5 dahil", kurumsal: "Özel" },
  { feature: "Kapalı teklif odaları", bireysel: "—", pro: "10 eşzamanlı", kurumsal: "Sınırsız" },
  { feature: "AI fiyat bandı", bireysel: "Temel", pro: "Gelişmiş", kurumsal: "Kurumsal model" },
  { feature: "Bölge kıyas raporu", bireysel: "Aylık 3", pro: "Sınırsız", kurumsal: "Özel veri seti" },
  { feature: "Harita ve komşu yoğunluk", bireysel: "Standart", pro: "Gelişmiş", kurumsal: "API ile çekilebilir" },
  { feature: "Çoklu ofis / şube", bireysel: "—", pro: "2 ofis", kurumsal: "Sınırsız" },
  { feature: "Marka beyaz etiket", bireysel: "—", pro: "—", kurumsal: "Teklif" },
  { feature: "Özel alan adı (CNAME)", bireysel: "—", pro: "—", kurumsal: "Evet" },
  { feature: "REST API erişimi", bireysel: "—", pro: "Okuma (beta)", kurumsal: "Tam" },
  { feature: "Webhook olayları", bireysel: "—", pro: "5 olay türü", kurumsal: "Tümü" },
  { feature: "SSO / SAML", bireysel: "—", pro: "—", kurumsal: "Yol haritası" },
  { feature: "Rol ve yetki matrisi", bireysel: "Temel", pro: "Gelişmiş", kurumsal: "Özelleştirilebilir" },
  { feature: "Denetim günlüğü saklama", bireysel: "30 gün", pro: "1 yıl", kurumsal: "7 yıl (KVKK planı)" },
  { feature: "Veri dışa aktarma", bireysel: "CSV aylık 1", pro: "CSV / XLS", kurumsal: "Veri ambarı aktarımı" },
  { feature: "Destek kanalı", bireysel: "E-posta", pro: "Öncelikli", kurumsal: "Telefon + Slack" },
  { feature: "Yanıt süresi hedefi", bireysel: "48 saat", pro: "8 iş saati", kurumsal: "SLA sözleşmesi" },
  { feature: "Eğitim oturumu", bireysel: "Kayıtlı webinar", pro: "2 saat / çeyrek", kurumsal: "Saha + özel" },
  { feature: "Entegrasyon danışmanlığı", bireysel: "—", pro: "Ek ücretli", kurumsal: "Dahil (kapsama göre)" },
  { feature: "Ücretlendirme modeli", bireysel: "Sabit ücretsiz", pro: "Aylık sabit", kurumsal: "Hacim + sabit" },
];

const FiyatSSS = [
  {
    q: "Fiyatlar neden şimdiden kesin değil?",
    a: "Resmi fiyat listesi hukuk ve muhasebe onayıyla yayınlanır. Bu sayfa referans planları ve ürün yönünü gösterir.",
  },
  {
    q: "Profesyonel planda kotayı aşarsam ne olur?",
    a: "Sistem sizi uyarır; geçici yükseltme veya kurumsal görüşme önerilir. Ani kesinti yerine yumuşak sınır hedeflenir.",
  },
  {
    q: "Kurumsal planda API limitleri var mı?",
    a: "Evet, adil kullanım ve güvenlik için dakika başına istek tavanı tanımlanır; yoğun müşterilerde özel limit müzakere edilir.",
  },
  {
    q: "Ödeme yöntemleri neler olacak?",
    a: "Kredi kartı, havale ve kurumsal fatura seçenekleri planlanır. Vergi ve fatura unvanı sözleşme aşamasında teyit edilir.",
  },
  {
    q: "Yıllık taahhüt indirimi var mı?",
    a: "Profesyonel ve kurumsal paketlerde yıllık faturalamada hedeflenen indirim oranları satış ekibiyle netleşir.",
  },
  {
    q: "Deneme süresi sunulacak mı?",
    a: "Pilot müşterilere sınırlı süreli erişim müzakere edilebilir; genel self-servis deneme takvimi duyurulur.",
  },
  {
    q: "Yurtdışı faturalama mümkün mü?",
    a: "Kurumsal sözleşmelerde döviz ve yurt dışı kurum faturası için ayrı süreç tanımlanır.",
  },
  {
    q: "Destek saatleri dışında kritik arıza?",
    a: "Kurumsal SLA paketinde nöbet hattı hedeflenir; diğer planlar mesai içi önceliklidir.",
  },
  {
    q: "İlan başına kullanım ücreti düşünülüyor mu?",
    a: "Hibrit model (sabit + işlem başı) büyük portföyler için değerlendirilebilir; tabloya yansıtılır.",
  },
  {
    q: "Öğrenci veya STK indirimi var mı?",
    a: "Toplumsal projeler için başvuru bazlı indirim değerlendirilir; iletişim formundan talep iletin.",
  },
];

const demoSchema = z.object({
  firma: z.string().min(2),
  email: z.string().email(),
  not: z.string().optional(),
});

type WizardRole = "bireysel" | "profesyonel" | "kurumsal" | null;
type WizardVolume = "dusuk" | "orta" | "yuksek" | null;

function wizardPlan(role: WizardRole, volume: WizardVolume): string {
  if (!role || !volume) return "Seçimlerinizi tamamlayın.";
  if (role === "bireysel") return "Bireysel plan uygun. İhale kotası düşük hacim için tasarlandı.";
  if (role === "profesyonel" && (volume === "dusuk" || volume === "orta")) return "Profesyonel plan önerilir: kapalı teklif ve öncelikli destek kritik.";
  if (role === "profesyonel" && volume === "yuksek") return "Yüksek hacimde Profesyonel üst katman veya Kurumsal geçiş konuşulmalı.";
  if (role === "kurumsal") return "Kurumsal plan ve özel SLA: API, çoklu ofis ve raporlama ile ölçekleyin.";
  return "Satış ekibiyle görüşün.";
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
      subtitle="Bireysel kullanımdan kurumsal entegrasyona kadar esnek seçenekler; rakamlar bilgilendirme amaçlıdır ve sözleşmeyle kesinleşir."
    >
      <section className="py-10 grid gap-6 md:grid-cols-3">
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
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              {p.desc}
            </p>
            <ul className="space-y-2 text-sm mb-6">
              {p.features.map((f) => (
                <li key={f} style={{ color: "var(--color-text-muted)" }}>
                  + {f}
                </li>
              ))}
            </ul>
            <Link to="/iletisim" className="btn-primary block text-center text-sm">
              Başvur
            </Link>
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
                  { id: "bireysel" as const, label: "Bireysel yatırımcı", icon: User },
                  { id: "profesyonel" as const, label: "Profesyonel danışman", icon: Building2 },
                  { id: "kurumsal" as const, label: "Kurumsal portföy", icon: Rocket },
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
            <Link to="/iletisim" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
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
              className="bg-[var(--color-bg-card)] border border-slate-200 text-[var(--color-text)]"
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
              className="bg-[var(--color-bg-card)] border border-slate-200 text-[var(--color-text)]"
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
              className="bg-[var(--color-bg-card)] border border-slate-200 text-[var(--color-text)]"
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
          Plan karşılaştırması (20 özellik)
        </h2>
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
              <th className="text-left py-3 px-2" style={{ color: "var(--color-text-muted)" }}>
                Özellik
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Bireysel
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Profesyonel
              </th>
              <th className="py-3 px-2" style={{ color: "var(--color-text)" }}>
                Kurumsal
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
                  {row.bireysel}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {row.pro}
                </td>
                <td className="py-3 px-2 text-center" style={{ color: "var(--color-text-muted)" }}>
                  {row.kurumsal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="py-10 pb-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <HelpCircle className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl font-bold text-center" style={{ color: "var(--color-text)" }}>
            Fiyatlandırma hakkında 10 soru
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

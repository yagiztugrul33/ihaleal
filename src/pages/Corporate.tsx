import { Link } from "react-router-dom";
import {
  Building2,
  Lock,
  UploadCloud,
  Sparkles,
  BarChart3,
  Plug,
  HandCoins,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Multi-Tenant Portföy",
    desc: "Tüm ofislerinizi tek panelden yönetin. Her ofis kendi ilanlarını, ekibini ve performansını görür.",
    icon: Building2,
  },
  {
    title: "Rol Bazlı Yetki",
    desc: "Owner, Admin, Manager, Agent, Viewer rolleri. Her kullanıcı sadece görmesi gerekeni görür.",
    icon: Lock,
  },
  {
    title: "Toplu İlan Yükleme",
    desc: "CSV veya Excel ile yüzlerce ilanı saniyede yükleyin. AI sanity check ve duplicate kontrolü dahil.",
    icon: UploadCloud,
  },
  {
    title: "AI Destekli Fiyat",
    desc: "Türkiye gayrimenkul verisi üzerinde eğitilmiş model. Piyasa karşılaştırması, güven aralığı.",
    icon: Sparkles,
  },
  {
    title: "Detaylı Analytics",
    desc: "İlan başına görüntülenme, lead, dönüşüm. Ofis bazlı performans, ajan bazlı leaderboard.",
    icon: BarChart3,
  },
  {
    title: "Webhook & REST API",
    desc: "Mevcut CRM'inize entegre edin. Yeni ilan, yeni teklif, KYC durumu — anlık webhook bildirimi.",
    icon: Plug,
  },
  {
    title: "Komisyon Paylaşımı",
    desc: "Çok ofisli yapılarda otomatik komisyon split. Şeffaf, denetlenebilir, denkleştirilebilir.",
    icon: HandCoins,
  },
  {
    title: "KYC ve Doğrulama",
    desc: "Mernis, Findeks, tapu doğrulama. Doğrulanmış ilanlar daha hızlı satılır.",
    icon: ShieldCheck,
  },
];

const plans = [
  {
    name: "Free",
    price: "₺0",
    suited: "Bireysel emlakçılar",
    features: ["5 ilan/ay", "Temel AI fiyat", "Email destek"],
    highlighted: false,
  },
  {
    name: "Agency",
    price: "₺2.490",
    suited: "Boutique ofisler (1-10 kişi)",
    features: ["100 ilan/ay", "5 ekip üyesi", "Bulk upload", "Öncelikli destek", "AI quota 500/ay"],
    highlighted: false,
  },
  {
    name: "GYO",
    price: "₺7.490",
    suited: "GYO'lar ve gruplar (10-50 kişi)",
    features: ["Sınırsız ilan", "25 ekip üyesi", "API erişimi", "Webhook", "AI quota 2000/ay", "Özel hesap yöneticisi"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Özel",
    suited: "Büyük emlak grupları (50+)",
    features: ["Sınırsız her şey", "Sınırsız ekip", "Özel SLA", "White-label opsiyonu", "Kurumsal sözleşme"],
    highlighted: false,
  },
];

export default function Corporate() {
  return (
    <div className="min-h-screen kurumsal-page">
      <section className="hero-warm py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="badge-corp">İhaleal Kurumsal</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Emlak ofisleri için
            <br />
            <span style={{ color: "var(--color-text)" }}>modern operasyon altyapısı.</span>
          </h1>

          <p
            className="mt-6 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Portföy yönetimi, AI destekli fiyatlama, çok kullanıcılı erişim ve şeffaf ihale modülü.
            GYO ve büyük emlak grupları için tasarlandı; bireysel emlakçılar için ücretsiz.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/kurumsal/iletisim" className="btn-primary">
              Demo Talep Et
            </Link>
            <a href="#planlar" className="btn-ghost">
              Planları İncele
            </a>
          </div>

        </div>
      </section>

      <section className="py-20 md:py-24" style={{ background: "var(--zemin-yumusak)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <span className="badge-corp">Özellikler</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
              Kurumsal Özellikler
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: "var(--color-text-muted)" }}>
              Sadece bir ilan sitesi değil. Emlak operasyonunuzun çekirdek altyapısı.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card-warm">
                <div
                  className="w-10 h-10 rounded-[3px] flex items-center justify-center mb-4"
                  style={{ background: "var(--color-bg-soft)" }}
                >
                  <f.icon className="h-5 w-5" style={{ color: "var(--metin-ikincil)" }} aria-hidden />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planlar" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <span className="badge-corp">Fiyatlandırma</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4" style={{ color: "var(--color-text)" }}>
              Size Uygun Plan
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: "var(--color-text-muted)" }}>
              Ekibinizin büyüklüğüne uygun esnek planlar. Her zaman değiştirebilirsiniz.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`card-warm relative${p.highlighted ? " vurgu-yuzey" : ""}`}
              >
                {p.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[3px] px-3 py-1 text-[11px] font-normal uppercase tracking-wide"
                    style={{ background: "#1d1a18", color: "#eeeeee" }}
                  >
                    En Popüler
                  </div>
                )}
                <div
                  className="text-xs uppercase tracking-widest mb-2"
                  style={{ color: "var(--uzerine-ikincil)" }}
                >
                  {p.name}
                </div>
                <div className="text-4xl font-bold mb-1">
                  {p.price}
                  <span
                    className="text-base font-normal ms-1"
                    style={{ color: "var(--uzerine-ikincil)" }}
                  >
                    /ay
                  </span>
                </div>
                <div
                  className="text-sm mb-6"
                  style={{ color: "var(--uzerine-ikincil)" }}
                >
                  {p.suited}
                </div>
                <ul className="space-y-3 mb-6">
                  {p.features.map((ft) => (
                    <li key={ft} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--uzerine-ikincil)" }} aria-hidden />
                      {ft}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/kurumsal/iletisim"
                  className="btn-primary block text-center"
                  style={p.highlighted ? { background: "#101010", borderColor: "#101010", color: "#eeeeee" } : {}}
                >
                  {p.name === "Enterprise" ? "İletişime Geç" : "Başla"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Card className="mx-auto max-w-[480px] text-center">
            <CardContent className="p-6">
              <p
                className="mb-3 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--sinyal-turuncu)" }}
                  aria-hidden
                />
                Demo
              </p>
              <h2 className="text-3xl md:text-4xl font-normal mb-4 text-card-foreground">
                Demo görüşmesi planlayalım.
              </h2>
              <p className="mb-8 text-base text-muted-foreground">
                GYO veya büyük emlak grubu yöneticisiyseniz, ekibimiz size özel
                bir demo hazırlasın. 30 dakikalık görüşme, ihtiyaçlarınıza özel çözüm.
              </p>
              <Button asChild>
                <Link to="/kurumsal/iletisim">Görüşme Talep Et →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

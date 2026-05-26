import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Compass,
  Landmark,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";

const VALUES = [
  {
    icon: Compass,
    title: "Şeffaflık ve izlenebilirlik",
    text: "Fiyat oluşumu, teklif sırası ve kapanış adımları görünür olur; kullanıcı neye neden karar verdiğini net görür.",
  },
  {
    icon: UserCheck,
    title: "Güven ve uyum",
    text: "Escrow, KYC ve sözleşme kontrolleri aynı güven hattında ilerler; kritik adımlar kayıt altına alınır.",
  },
  {
    icon: TrendingUp,
    title: "Gerçek değer odağı",
    text: "Hedefimiz fiyatı şişirmek değil, piyasa rekabetiyle doğru fiyatı daha hızlı ve daha adil ortaya çıkarmaktır.",
  },
  {
    icon: Sparkles,
    title: "Sürekli iyileştirme",
    text: "Platform, kullanıcı geri bildirimleri ve saha verileriyle iteratif geliştirilir; her faz bir öncekinin üstüne eklenir.",
  },
] as const;

const ROADMAP = [
  {
    phase: "Faz A — Web (aktif)",
    detail:
      "Web terminali; ilan, ihale, değerleme, deprem riski ve konum zekası modülleriyle uçtan uca görünür süreç.",
  },
  {
    phase: "Faz B — Mobil (plan)",
    detail:
      "Konum bazlı radar push akışları, hızlı teklif ekranları ve saha ekipleri için görev odaklı mobil deneyim.",
  },
] as const;

export default function About() {
  return (
    <PageShell
      badge="Kurumsal"
      title="ihaleal hakkında"
      subtitle="Gayrimenkulü daha şeffaf, daha güvenli ve gerçek değerinde el değiştirebilir hale getirmek için çalışıyoruz. Bu sayfadaki metrikler ve örnekler demo/ön analiz kapsamındadır."
      cta={{ label: "Bize yazın", to: "/iletisim" }}
    >
      <section className="py-10 grid gap-5 lg:grid-cols-2">
        <div className="card-warm">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: "var(--color-text-muted)" }}>
            <Target className="h-4 w-4" />
            Misyon
          </div>
          <p className="text-2xl font-bold leading-snug md:text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            Gayrimenkulü şeffaf, güvenli ve gerçek değerinden el değiştiren bir pazara dönüştürmek.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Alıcı, satıcı, danışman ve kurumsal ekipler için aynı operasyon dilini kurarız: açık kural, net sorumluluk,
            izlenebilir karar.
          </p>
        </div>
        <div className="card-warm">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: "var(--color-text-muted)" }}>
            <CircleDashed className="h-4 w-4" />
            Problem
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Geleneksel akışta fiyat belirsizliği, yavaş karar döngüsü, güvensiz ödeme kaygısı ve düşük likidite aynı anda
            yaşanır. Bu da hem alıcıyı hem satıcıyı yorar.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Biz bu sorunu "borsa modeli" ile çözeriz: rekabetçi teklif, görünür kurallar, adım adım kapanış ve güven
            katmanı.
          </p>
        </div>
      </section>

      <section className="py-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="card-warm">
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
              Çözümümüz: Gayrimenkul borsası modeli
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              "Değerle → borsaya koy → teklifleri izle → en yüksek geçerli teklif → güvenli devir" zincirini tek platformda
              görünür kılıyoruz.
            </p>
          </article>
          <article className="card-warm">
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
              Farkımız
            </h2>
            <ul className="mt-2 grid gap-1.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <li>• Borsa modeli + deprem zekası + konum zekası aynı kararda buluşur.</li>
              <li>• Platform AI rehberi, çoklu modda (alıcı/satıcı/kurumsal) aksiyon önerir.</li>
              <li>• Türkçe odaklı, sahaya yakın ve denetlenebilir deneyim sunar.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="py-10">
        <h2 className="mb-4 text-xl font-bold md:text-2xl" style={{ color: "var(--color-text)" }}>
          Değerlerimiz
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="card-warm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--color-bg-soft)" }}>
                  <Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-10">
        <h2 className="mb-4 text-xl font-bold md:text-2xl" style={{ color: "var(--color-text)" }}>
          Yol haritası
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ROADMAP.map((row) => (
            <article key={row.phase} className="card-warm">
              <h3 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
                {row.phase}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {row.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-10">
        <div className="card-warm">
          <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--color-text)" }}>
            Güven katmanı
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
              <Landmark className="mb-2 h-5 w-5" style={{ color: "var(--color-primary)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                Escrow
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Ödeme, devir koşulları tamamlanmadan serbest bırakılmaz.
              </p>
            </article>
            <article className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
              <ShieldCheck className="mb-2 h-5 w-5" style={{ color: "var(--color-primary)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                KYC
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Kimlik doğrulama adımları, teklif ve ödeme sürecinde risk azaltır.
              </p>
            </article>
            <article className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
              <CheckCircle2 className="mb-2 h-5 w-5" style={{ color: "var(--color-primary)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                SPK uyum hedefi
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Kurumsal finansal süreçlerde düzenleyici uyum kontrolleri canlıya geçiş öncesi doğrulanır.
              </p>
            </article>
          </div>
          <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Dürüst not: Bu sayfadaki oranlar ve ifadeler demo/ön analiz kapsamındadır; canlı metrikler sözleşme ve resmi
            denetim çıktılarıyla kesinleşir.
          </p>
        </div>
      </section>

      <section className="py-12 flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center border-t" style={{ borderColor: "var(--color-border)" }}>
        <Link to="/ihaleler" className="btn-primary gap-2 inline-flex">
          İhalelere göz at
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/nasil-calisir"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          Nasıl çalışır?
        </Link>
        <Link to="/sss" className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--color-primary)" }}>
          Sık sorulan sorular
        </Link>
      </section>
    </PageShell>
  );
}

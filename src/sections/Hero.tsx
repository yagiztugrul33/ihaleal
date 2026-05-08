import { useNavigate } from "react-router-dom";
import { Play, BrainCircuit, Building2, Factory, ShieldCheck, Scale, Percent, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KkaRevenueHubStrip } from "@/components/KkaRevenueHubStrip";
import { heroRevenueStripLine } from "@/lib/masterFinancialEngine";
import { cn } from "@/lib/utils";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";

const HERO_ACTION_MIN = "min-h-12 h-12";
const HERO_ACTION_TEXT = "text-sm font-semibold sm:text-[0.9375rem]";
const HERO_ACTION_ICON = "h-5 w-5 shrink-0";
const heroActionShell = (extra: string) =>
  cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 transition-colors duration-200 sm:px-5",
    HERO_ACTION_MIN,
    HERO_ACTION_TEXT,
    extra
  );

const TRUST_POINTS: {
  Icon: typeof ShieldCheck;
  title: string;
  desc: string;
  to: string;
  cta: string;
}[] = [
  {
    Icon: ShieldCheck,
    title: "Güven ve uyum",
    desc: "Kimlik doğrulama ve kayıtlı süreç çizgisi; kritik adımlar izlenebilir (hedef mimari).",
    to: "/guvenlik",
    cta: "Güvenlik çerçevesini aç",
  },
  {
    Icon: Scale,
    title: "Kurallı ihale",
    desc: "Atomik teklif akışı ve sunucu zamanı ile şeffaf yarışma alanı (üretim hedefi).",
    to: "/ihale-kosullari",
    cta: "İhale kurallarını gör",
  },
  {
    Icon: Percent,
    title: "Öngörülebilir ücret",
    desc: "Oranlar tek kaynakla uyumlu; KKA ve komisyon gösterimi taslak MASTER_RULES ile hizalı (demo).",
    to: "/komisyon-modeli",
    cta: "Ücret modelini incele",
  },
];

export function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative flex min-h-[min(100dvh,920px)] items-center justify-center overflow-hidden pt-20 pb-16 sm:pb-20"
    >
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,_rgba(56,189,248,0.1),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,_rgba(251,191,36,0.07),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,_rgba(255,255,255,0.035),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.055] mix-blend-soft-light"
          style={{
            backgroundImage:
              "linear-gradient(118deg, rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(332deg, rgba(251,191,36,0.04) 1px, transparent 1px)",
            backgroundSize: "52px 52px, 40px 40px",
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-[10%] top-24 h-[380px] w-[380px] rounded-full bg-sky-500/[0.065] blur-[100px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute bottom-4 right-[-5%] h-[360px] w-[400px] rounded-full bg-amber-400/[0.055] blur-[100px] motion-reduce:animate-none" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <div
            className="pointer-events-none absolute -left-3 top-2 hidden h-[88%] w-px bg-gradient-to-b from-sky-400/45 via-sky-400/15 to-transparent sm:-left-5 sm:block lg:-left-7"
            aria-hidden
          />

          <div className="mb-5 flex flex-wrap items-center gap-2 animate-fade-in-up animate-delay-100">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Gayrimenkul
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/[0.12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" aria-hidden />
              Canlı ihale vitrini
            </span>
            <span className="rounded-full border border-white/[0.06] bg-transparent px-2.5 py-1 text-[11px] font-medium text-zinc-500">Demo veri</span>
          </div>

          <p className="animate-fade-in-up animate-delay-100 mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300/85 sm:text-xs">
            ihaleal.com
          </p>

          <h1 className="animate-fade-in-up animate-delay-200 mb-5 text-pretty text-4xl font-bold leading-[1.07] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
            <span className="block">Yatırım kararını güçlendiren</span>
            <span className="mt-2 block bg-gradient-to-r from-sky-200 via-sky-400 to-cyan-300 bg-clip-text font-semibold text-transparent">
              şeffaf ihale deneyimi
            </span>
          </h1>

          <p className="animate-fade-in-up animate-delay-300 mb-2 max-w-2xl text-pretty text-base font-normal leading-relaxed text-zinc-300 sm:text-lg sm:leading-relaxed">
            Tek vitrinde canlı ihale akışı; <strong className="font-semibold text-zinc-100">İhaleal Endeksi</strong> ile teklif
            yoğunluğu, bölge bandı ve yapay zeka sinyalleri bir arada. Yatırım skoru ve senaryolar özetlenir — gösterim{" "}
            <span className="text-zinc-500">demo veridir</span>, hukuki bağlayıcı değerleme değildir.
          </p>

          <div className="animate-fade-in-up animate-delay-300 mb-9 mt-8 grid gap-3 sm:grid-cols-3">
            {TRUST_POINTS.map(({ Icon, title, desc, to, cta }) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(to)}
                className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left backdrop-blur-sm transition-colors duration-200 hover:border-sky-400/22 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                aria-label={`${title}: ${cta}`}
              >
                <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/12 text-sky-300 ring-1 ring-sky-400/18">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 sm:text-xs">{desc}</p>
                <span className="mt-3 text-xs font-medium text-sky-300">{cta}</span>
              </button>
            ))}
          </div>

          <p className="animate-fade-in-up animate-delay-300 mb-9 text-[11px] leading-relaxed text-zinc-500 sm:text-xs">
            Siteye özel iş kuralları ve birleşik çerçeve için
            {" "}
            <button
              type="button"
              onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)}
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
            >
              platform ve KİK çerçevesini
            </button>
            {" "}
            ve
            {" "}
            <button
              type="button"
              onClick={() => navigate("/nihai-anayasa")}
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
            >
              nihai metni
            </button>
            {" "}
            inceleyebilirsiniz.
          </p>

          <p className="animate-fade-in-up animate-delay-400 mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px] sm:tracking-[0.24em]">
            Hızlı erişim
          </p>
          <div className="animate-fade-in-up animate-delay-400 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              size="lg"
              onClick={() => navigate("/analiz")}
              className={heroActionShell(
                "border border-sky-500/45 bg-sky-600 text-white shadow-md shadow-sky-950/35 hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-900/30"
              )}
            >
              <BrainCircuit className={HERO_ACTION_ICON} aria-hidden />
              İhaleal Endeksi
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/ihaleler")}
              className={heroActionShell(
                "border border-sky-400/30 bg-sky-500/[0.07] text-sky-50 shadow-sm shadow-black/15 backdrop-blur-sm hover:border-amber-300/35 hover:bg-amber-400/[0.07]"
              )}
            >
              <Play className={cn(HERO_ACTION_ICON, "fill-current opacity-90")} aria-hidden />
              İhaleleri Keşfet
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/giris?profil=emlakci")}
              className={heroActionShell(
                "border border-white/12 bg-white/[0.03] text-zinc-100 shadow-sm hover:border-sky-400/30 hover:bg-sky-500/[0.06]"
              )}
            >
              <Building2 className={HERO_ACTION_ICON} aria-hidden />
              Emlakçı Girişi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/giris?profil=muteahhit")}
              className={heroActionShell(
                "border border-white/12 bg-white/[0.03] text-zinc-100 shadow-sm hover:border-sky-400/30 hover:bg-sky-500/[0.06]"
              )}
            >
              <Factory className={HERO_ACTION_ICON} aria-hidden />
              Müteahhit Girişi
            </Button>
          </div>

          <div className="animate-fade-in-up animate-delay-500 mt-12 max-w-3xl space-y-4 border-t border-white/[0.07] pt-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]">Ücret çerçevesi</p>
              <p className="mt-2 text-left text-sm font-normal leading-relaxed text-zinc-300 sm:text-[0.9375rem]">
                {heroRevenueStripLine()}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600 sm:text-xs">
                Kesin ücret ve sözleşme metinleri yayımlandığında geçerlidir; buradaki gösterim bilgilendirme amaçlıdır.
              </p>
            </div>
            <KkaRevenueHubStrip variant="corporate" className="mt-0" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-fade-in animate-delay-700 max-sm:bottom-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500">Aşağı kaydır</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/10 bg-white/[0.04] p-1 ring-1 ring-white/[0.06] backdrop-blur-sm">
          <div className="h-2.5 w-1.5 animate-bounce rounded-full bg-sky-400/90 motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from "react-router-dom";
import {
  Play,
  BrainCircuit,
  Building2,
  Factory,
  ShieldCheck,
  Scale,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KkaRevenueHubStrip } from "@/components/KkaRevenueHubStrip";
import { heroRevenueStripLine } from "@/lib/masterFinancialEngine";
import { cn } from "@/lib/utils";

/** Birincil aksiyonlar: aynı yükseklik ve tipografi */
const HERO_ACTION_MIN = "min-h-12 h-12";
const HERO_ACTION_TEXT = "text-sm font-semibold sm:text-[0.9375rem]";
const HERO_ACTION_ICON = "h-5 w-5 shrink-0";
const HERO_ACTION_ROW = "flex w-full max-w-2xl flex-col gap-2.5 sm:flex-row sm:items-stretch sm:justify-start sm:gap-3";
const heroActionShell = (extra: string) =>
  cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 transition-colors duration-200 sm:w-auto sm:flex-1 sm:min-w-0",
    HERO_ACTION_MIN,
    HERO_ACTION_TEXT,
    extra
  );

const TRUST_POINTS: { Icon: typeof ShieldCheck; title: string; desc: string }[] = [
  {
    Icon: ShieldCheck,
    title: "Uyum ve kimlik",
    desc: "KYC, Findeks ve mesafeli satış çizgisi hedeflenir; kritik adımlar kayıt altına alınır.",
  },
  {
    Icon: Scale,
    title: "Kurallı ihale",
    desc: "Teklif atomik akış, sunucu zamanı ve teminat hattı ile şeffaf süreç (üretim hedefi).",
  },
  {
    Icon: Percent,
    title: "Net gelir modeli",
    desc: "Komisyon ve KKA oranları tek kaynaklı metinlerle uyumlu; sürpriz kalem yoktur (demo).",
  },
];

export function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,_rgba(56,189,248,0.09),_transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,_rgba(251,191,36,0.06),_transparent_48%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,_rgba(255,255,255,0.04),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-soft-light"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(335deg, rgba(251,191,36,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px, 36px 36px",
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-[12%] top-28 h-[420px] w-[420px] rounded-full bg-sky-500/[0.07] blur-[120px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute bottom-8 right-0 h-[380px] w-[440px] rounded-full bg-amber-400/[0.06] blur-[110px] motion-reduce:animate-none" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24 xl:py-28">
        <div className="relative mx-auto max-w-3xl">
          <div
            className="pointer-events-none absolute -left-4 top-0 hidden h-full w-px bg-gradient-to-b from-sky-400/50 via-sky-400/20 to-transparent sm:-left-6 sm:block lg:-left-8"
            aria-hidden
          />

          <p className="animate-fade-in-up animate-delay-100 mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300/90 sm:text-xs">
            ihaleal.com
          </p>

          <h1 className="animate-fade-in-up animate-delay-200 mb-5 text-4xl font-bold leading-[1.08] tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl xl:text-[3.35rem] xl:leading-[1.06]">
            <span className="block text-zinc-50">Gayrimenkul</span>
            <span className="mt-2 block font-semibold tracking-tight text-sky-400">Canlı İhale Vitrini</span>
          </h1>

          <p className="animate-fade-in-up animate-delay-300 mb-8 text-pretty text-base font-normal leading-relaxed text-zinc-300 sm:text-lg sm:leading-relaxed">
            Şeffaf, hızlı ve güvenli ihale deneyimi sunar.{" "}
            <strong className="font-semibold text-zinc-100">İhaleal Endeksi</strong> ile teklif yoğunluğu, bölge bandı ve
            yapay zeka sinyallerini bir arada görün; yatırım skoru ve senaryolar tek ekranda özetlenir{" "}
            <span className="text-zinc-500">(demo veri)</span>.
          </p>

          <div
            className="animate-fade-in-up animate-delay-300 mb-10 flex max-w-xl items-center gap-2.5 border-t border-sky-400/20 pt-6"
            role="note"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400 ring-2 ring-sky-400/35" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/90 sm:text-xs">
              İhaleal Endeksi — ürün çizgisi
            </span>
          </div>

          <div className="animate-fade-in-up animate-delay-400 mb-10 grid gap-3 sm:grid-cols-3">
            {TRUST_POINTS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm transition-colors duration-200 hover:border-sky-400/25 hover:bg-white/[0.045]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 sm:text-xs">{desc}</p>
              </div>
            ))}
          </div>

          <div className={cn(HERO_ACTION_ROW, "animate-fade-in-up animate-delay-400")}>
            <Button
              size="lg"
              onClick={() => navigate("/analiz")}
              className={heroActionShell(
                "border border-sky-500/50 bg-sky-600 text-white shadow-md shadow-sky-950/30 hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-900/25"
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
                "border border-sky-400/35 bg-sky-500/[0.08] text-sky-50 shadow-sm shadow-black/20 backdrop-blur-sm hover:border-amber-300/40 hover:bg-amber-400/[0.08]"
              )}
            >
              <Play className={cn(HERO_ACTION_ICON, "fill-current opacity-90")} aria-hidden />
              İhaleleri Keşfet
            </Button>
          </div>

          <div className={cn(HERO_ACTION_ROW, "mt-3 animate-fade-in-up animate-delay-400")}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/giris?profil=emlakci")}
              className={heroActionShell(
                "border border-white/10 bg-white/[0.03] text-zinc-100 shadow-sm hover:border-sky-400/35 hover:bg-sky-500/[0.06]"
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
                "border border-white/10 bg-white/[0.03] text-zinc-100 shadow-sm hover:border-sky-400/35 hover:bg-sky-500/[0.06]"
              )}
            >
              <Factory className={HERO_ACTION_ICON} aria-hidden />
              Müteahhit Girişi
            </Button>
          </div>

          <div className="animate-fade-in-up animate-delay-500 mt-10 space-y-4 border-t border-white/[0.06] pt-10">
            <p className="max-w-2xl rounded-xl border border-sky-400/12 bg-sky-950/20 px-4 py-3 text-left text-[11px] font-medium leading-relaxed text-sky-100/80 shadow-inner shadow-black/20 sm:text-xs">
              {heroRevenueStripLine()}
            </p>
            <div className="max-w-2xl">
              <KkaRevenueHubStrip variant="prominent" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-fade-in animate-delay-700">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-200/60">Kaydır</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-sky-400/30 bg-sky-500/[0.06] p-1 ring-1 ring-sky-400/12 backdrop-blur-sm">
          <div className="h-2.5 w-1.5 animate-bounce rounded-full bg-sky-400 motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}

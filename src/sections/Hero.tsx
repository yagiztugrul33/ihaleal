import { useNavigate } from "react-router-dom";
import {
  Play,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  BrainCircuit,
  Building2,
  Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KkaRevenueHubStrip } from "@/components/KkaRevenueHubStrip";
import { heroRevenueStripLine } from "@/lib/masterFinancialEngine";
import { cn } from "@/lib/utils";

/** Ana kahraman bölümü: tüm birincil düğmelerde aynı yükseklik, tipografi ve yarıçap */
const HERO_ACTION_MIN = "min-h-12 h-12";
const HERO_ACTION_TEXT = "text-sm font-semibold sm:text-[0.9375rem]";
const HERO_ACTION_ICON = "h-5 w-5 shrink-0";
const HERO_ACTION_ROW = "flex w-full max-w-xl flex-col gap-2.5 sm:flex-row sm:items-stretch sm:justify-start sm:gap-3";
const heroActionShell = (extra: string) =>
  cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 transition-colors duration-200 sm:w-auto sm:flex-1 sm:min-w-0",
    HERO_ACTION_MIN,
    HERO_ACTION_TEXT,
    extra
  );

export function Hero() {
  const navigate = useNavigate();

  const stats = [
    { icon: TrendingUp, value: "1.247", label: "Aktif İhale" },
    { icon: Users, value: "8.452", label: "Kayıtlı Kullanıcı" },
    { icon: BarChart3, value: "₺386M", label: "Toplam Hacim" },
    { icon: Shield, value: "%97", label: "Başarı Oranı" },
  ];

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,_rgba(255,255,255,0.06),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,_rgba(220,38,38,0.07),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,_rgba(255,255,255,0.04),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(335deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "48px 48px, 36px 36px",
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-[12%] top-28 h-[420px] w-[420px] rounded-full bg-white/[0.04] blur-[120px] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute bottom-8 right-0 h-[380px] w-[440px] rounded-full bg-red-900/10 blur-[110px] motion-reduce:animate-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24 xl:py-28">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-1 flex w-full max-w-xl flex-col items-start text-left sm:max-w-2xl lg:max-w-xl lg:border-r lg:border-white/[0.08] lg:pr-12 xl:pr-14">
            <h1 className="animate-fade-in-up animate-delay-200 mb-5 w-full max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[3.5rem] xl:leading-[1.06]">
              <span className="block text-white">Gayrimenkul</span>
              <span className="mt-2 block font-semibold tracking-tight text-red-500/95">
                Canlı İhale Vitrini
              </span>
            </h1>
            <p className="animate-fade-in-up animate-delay-300 mb-6 w-full max-w-xl text-pretty text-base font-normal leading-relaxed text-zinc-300 sm:text-lg">
              Şeffaf, hızlı ve güvenli ihale deneyimi. <strong className="font-semibold text-white">İhaleal Endeksi</strong> ile teklif yoğunluğu, bölge bandı ve yapay zeka sinyallerini bir arada görün; gerçekçi karar için yatırım skoru ve senaryolar tek ekranda (demo veri).
            </p>
            <div
              className="animate-fade-in-up animate-delay-300 mb-7 flex w-full max-w-xl items-center gap-2 border-t border-white/[0.08] pt-5"
              role="note"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600 ring-2 ring-red-600/30" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
                İhaleal Endeksi
              </span>
            </div>
            <div className={cn(HERO_ACTION_ROW, "animate-fade-in-up animate-delay-400")}>
              <Button
                size="lg"
                onClick={() => navigate("/analiz")}
                className={heroActionShell(
                  "border border-red-800/40 bg-red-700 text-white shadow-md shadow-black/30 hover:bg-red-600 hover:shadow-lg hover:shadow-red-950/25"
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
                  "border border-zinc-600/80 bg-white/[0.04] text-zinc-100 shadow-sm shadow-black/20 backdrop-blur-sm hover:border-zinc-500 hover:bg-white/[0.07]"
                )}
              >
                <Play className={cn(HERO_ACTION_ICON, "fill-current opacity-90")} aria-hidden />
                İhaleleri Keşfet
              </Button>
            </div>
            <div className={cn(HERO_ACTION_ROW, "mt-2.5 animate-fade-in-up animate-delay-400")}>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/giris?profil=emlakci")}
                className={heroActionShell(
                  "border border-zinc-600/70 bg-zinc-900/40 text-zinc-100 shadow-sm hover:border-zinc-500 hover:bg-zinc-800/50"
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
                  "border border-zinc-600/70 bg-zinc-900/40 text-zinc-100 shadow-sm hover:border-zinc-500 hover:bg-zinc-800/50"
                )}
              >
                <Factory className={HERO_ACTION_ICON} aria-hidden />
                Müteahhit Girişi
              </Button>
            </div>
            <p className="mt-4 w-full max-w-xl rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left text-[11px] font-medium leading-relaxed text-zinc-400 shadow-inner shadow-black/20 sm:text-xs">
              {heroRevenueStripLine()}
            </p>
            <div className="w-full max-w-xl animate-fade-in-up animate-delay-400">
              <KkaRevenueHubStrip variant="prominent" />
            </div>
          </div>

          <div className="order-2 grid w-full max-w-md grid-cols-2 justify-self-stretch gap-2.5 sm:gap-3 lg:gap-3 animate-fade-in-up animate-delay-500 lg:max-w-none lg:justify-self-end xl:max-w-lg">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="group relative flex min-h-[104px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/35 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] motion-reduce:hover:translate-y-0 sm:min-h-[112px] sm:p-3.5"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
                  <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full bg-red-600/[0.07] blur-xl opacity-60 transition-opacity duration-300 group-hover:opacity-90 sm:h-20 sm:w-20" />
                  <div className="relative mb-2 flex items-start justify-between">
                    <div className="rounded-lg bg-black/35 p-1.5 text-zinc-300 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                  </div>
                  <div className="relative mt-auto flex min-h-[2rem] items-end sm:min-h-[2.25rem]">
                    <span className="text-lg font-bold tabular-nums tracking-tight text-white drop-shadow-sm sm:text-xl">
                      {s.value}
                    </span>
                  </div>
                  <div className="relative mt-1 text-[10px] font-medium leading-snug text-zinc-400 sm:text-[11px]">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-fade-in animate-delay-700">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Kaydır</span>
        <div className="flex h-8 w-5 items-start justify-center rounded-full border border-zinc-600/70 bg-white/[0.04] p-1 ring-1 ring-white/[0.06] backdrop-blur-sm">
          <div className="h-2.5 w-1.5 animate-bounce rounded-full bg-red-600 motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}

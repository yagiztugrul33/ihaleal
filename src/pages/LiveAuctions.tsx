import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Auctions } from "@/sections/Auctions";
import {
  Flame, Hourglass, MapPin, TrendingUp, TrendingDown, Activity, Zap, Radio,
  ArrowUp, ArrowDown, Eye, BarChart3,
} from "lucide-react";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import type { Auction } from "@/types/auction";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { cn } from "@/lib/utils";
import { BorsaTerminali } from "@/components/borsa/BorsaTerminali";

function formatTRY(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M ₺`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K ₺`;
  return `${v.toLocaleString("tr-TR")} ₺`;
}

/** Tam sayfa "Canlı İhaleler" — hero + 2 yatay vitrin (bitmeye yaklaşan / yakında açılacak) + Auctions section. */
export default function LiveAuctions() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Auction[]>(() => getLocalAndStaticAuctions());

  useEffect(() => {
    let alive = true;
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (alive) setCatalog(rows);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const now = Date.now();
  const liveCount = useMemo(() => catalog.filter((a) => a.status === "live").length, [catalog]);
  const endingSoon = useMemo(
    () =>
      catalog
        .filter((a) => a.status === "live")
        .filter((a) => {
          const t = new Date(a.endDate).getTime();
          return t > now && t - now <= 24 * 3600 * 1000;
        })
        .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
        .slice(0, 4),
    [catalog, now],
  );
  const upcoming = useMemo(
    () =>
      catalog
        .filter((a) => a.status === "upcoming")
        .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
        .slice(0, 4),
    [catalog],
  );

  const Shelf = ({
    title,
    icon: Icon,
    tone,
    items,
    emptyText,
  }: {
    title: string;
    icon: typeof Flame;
    tone: "amber" | "cyan";
    items: Auction[];
    emptyText: string;
  }) => (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className={cn("text-lg font-semibold flex items-center gap-2", tone === "amber" ? "text-amber-200" : "text-cyan-200")}>
          <Icon className="w-5 h-5" />
          {title}
        </h2>
        <span className="text-xs text-slate-500">{items.length} ilan</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => navigate(`/ilan/${a.id}`)}
              className={cn(
                "group text-start rounded-2xl border bg-slate-900/40 overflow-hidden transition-all",
                tone === "amber" ? "border-amber-500/25 hover:border-amber-400/50" : "border-cyan-500/25 hover:border-cyan-400/50",
              )}
            >
              <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
                <img
                  loading="lazy"
                  src={a.images[0]}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                <div className="absolute top-2 start-2">
                  <CountdownTimer
                    endDate={a.endDate}
                    status={a.status}
                    size="sm"
                    layout="compact"
                  />
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{a.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{a.district}, {a.city}</span>
                </div>
                <div className="text-base font-bold text-blue-400">{formatTRY(a.currentBid)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--color-bg)" }}>
      {/* BLOK E — BLOOMBERG BORSA TERMİNALİ ÜSTE (above hero) — ilk göz önce bunu görür */}
      <BorsaTerminali catalog={catalog} liveCount={liveCount} />

      {/* Eski hero — kompakt, terminale göre destekleyici banner şeklinde */}
      <section className="border-t border-slate-800/50 py-8 md:py-12" style={{ background: "var(--color-bg)" }}>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-3 flex justify-center">
            <span className="badge-corp">
              {liveCount > 0 ? `${liveCount.toLocaleString("tr-TR")} canlı ihale` : "Canlı İhaleler"}
            </span>
          </div>

          <h1
            className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Gerçek piyasa, <span style={{ color: "var(--color-primary)" }}>gerçek fiyat.</span>
          </h1>

          <p
            className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--color-text-muted)" }}
          >
            İhaleal Endeks&apos;i ile teklif yoğunluğunu, bölge fiyat aralığını ve AI destekli
            yatırım sinyallerini tek ekranda görün. Şeffaf canlı artırma, doğrulanmış ilan, anti-snipe
            koruması.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href="#auctions" className="btn-primary">
              Canlı İhaleleri Gör
            </a>
            <Link to="/nasil-calisir" className="btn-ghost">
              Nasıl Çalışır?
            </Link>
          </div>

          <p
            className="mx-auto mt-5 max-w-xl text-[11px] leading-relaxed"
            style={{ color: "var(--color-text-light)" }}
          >
            * Gösterilen veriler bilgilendirme amaçlıdır. Yatırım kararları için profesyonel
            danışmanlık alınız.
          </p>
        </div>
      </section>

      {/* Dalga 2-6: hero altı yatay kart vitrinleri */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Shelf
          title="Bitmeye Yaklaşan İhaleler (24 saat)"
          icon={Flame}
          tone="amber"
          items={endingSoon}
          emptyText="Bugün 24 saat içinde sona eren ihale yok."
        />
        <Shelf
          title="Yakında Açılacak İhaleler"
          icon={Hourglass}
          tone="cyan"
          items={upcoming}
          emptyText="Şu an planlanmış yakın açılacak ihale yok."
        />
      </div>

      <Auctions hideIntro layout="page" />
    </div>
  );
}

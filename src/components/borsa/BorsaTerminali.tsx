/**
 * Bloomberg-style Borsa Terminali — /ihaleler sayfası üst paneli.
 *
 * CEPHE 2 v4 — MEGA ULTRA komut Master.
 *
 * Bileşenler:
 *  1. ÜST: canlı borsa şeridi (ticker — kayan)
 *  2. CANLI SAYAÇLAR (4 metrik kart)
 *  3. ORDER BOOK tablosu (top 8 aktif ihale, fiyat değişim %, bidder, geri sayım)
 *  4. BÖLGE HEAT MAP (10 şehir, yükselen yeşil/düşen kırmızı)
 *  5. TOP MOVERS (yükselenler/düşenler)
 *  6. CANLI TEKLİF AKIŞI (anonim, sealed maskeleme korunur)
 *  7. AI YATIRIM SİNYALLERİ (yüksek skor + bölge trend)
 *
 * Veri: catalog Auction[] (props) + simüle delta (deterministic).
 * Sealed teklif maskeleme: teklifçi GÖRÜNMEZ, sadece aktivite + tutar bandı.
 */

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Activity, Radio, Zap, BarChart3, MapPin,
  ArrowUp, ArrowDown, Flame, Crown, Sparkles,
} from "lucide-react";
import type { Auction } from "@/types/auction";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { useMembershipTier } from "@/hooks/useMembershipTier";

function formatTRY(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M ₺`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K ₺`;
  return `${v.toLocaleString("tr-TR")} ₺`;
}

function det(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Props {
  catalog: Auction[];
  liveCount: number;
}

export function BorsaTerminali({ catalog, liveCount }: Props) {
  const now = Date.now();
  const navigate = useNavigate();
  const { isPremium, tier } = useMembershipTier();

  // Her ilan için %değişim (deterministic — id seed ile)
  const enriched = useMemo(() => {
    return catalog.map((a) => {
      const seed = hashId(a.id);
      const pct = (det(seed) - 0.5) * 30; // -%15 to +%15
      return {
        ...a,
        deltaPct: Math.round(pct * 10) / 10,
        endsAt: new Date(a.endDate).getTime(),
      };
    });
  }, [catalog]);

  const live = enriched.filter((a) => a.status === "live");
  const todayClosed = enriched.filter(
    (a) => a.status === "ended" && a.endsAt > now - 86_400_000,
  );

  const totalVolume = useMemo(
    () => live.reduce((s, a) => s + (a.currentBid || 0), 0),
    [live],
  );

  // Top movers
  const gainers = useMemo(
    () => [...live].sort((a, b) => b.deltaPct - a.deltaPct).slice(0, 4),
    [live],
  );
  const losers = useMemo(
    () => [...live].sort((a, b) => a.deltaPct - b.deltaPct).slice(0, 4),
    [live],
  );

  // Order book (top 8 aktif)
  const orderBook = useMemo(
    () =>
      [...live]
        .sort((a, b) => (a.endsAt - now) - (b.endsAt - now))
        .slice(0, 8),
    [live, now],
  );

  // Bölge heat map (şehir bazında ortalama delta)
  const regionHeat = useMemo(() => {
    const map = new Map<string, { city: string; count: number; delta: number; volume: number }>();
    for (const a of live) {
      const k = a.city || "—";
      const cur = map.get(k) ?? { city: k, count: 0, delta: 0, volume: 0 };
      cur.count++;
      cur.delta += a.deltaPct;
      cur.volume += a.currentBid || 0;
      map.set(k, cur);
    }
    return [...map.values()]
      .map((r) => ({ ...r, avgDelta: r.delta / r.count }))
      .sort((a, b) => b.avgDelta - a.avgDelta);
  }, [live]);

  // Canlı teklif akışı (sealed — anonim, son 6)
  const feedItems = useMemo(() => {
    return live.slice(0, 6).map((a) => {
      const minutes = 1 + Math.floor(det(hashId(a.id) + 7) * 15);
      const direction = a.deltaPct >= 0 ? "yükseldi" : "düştü";
      return {
        id: a.id,
        when: `${minutes} dk önce`,
        text: `${a.title.slice(0, 40)} — ${formatTRY(a.currentBid)} (${direction})`,
        district: a.district,
        delta: a.deltaPct,
      };
    });
  }, [live]);

  // AI sinyalleri (top skor + pozitif delta)
  const aiSignals = useMemo(() => {
    return [...live]
      .filter((a) => (a.investmentScore ?? 0) >= 80 && a.deltaPct > 0)
      .sort((a, b) => (b.investmentScore ?? 0) - (a.investmentScore ?? 0))
      .slice(0, 3);
  }, [live]);

  // Bitmeye yakın (1 saat altı)
  const endingHot = useMemo(
    () =>
      live
        .filter((a) => a.endsAt - now < 3600_000 && a.endsAt - now > 0)
        .sort((a, b) => a.endsAt - b.endsAt)
        .slice(0, 3),
    [live, now],
  );

  return (
    <section className="bg-slate-950/60 border-y border-cyan-500/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Premium status banner */}
        {!isPremium ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <Crown className="h-5 w-5 text-amber-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-100">
                Borsa terminal özet görünüyor — TAM erişim için Premium
              </p>
              <p className="text-[11px] text-slate-300">
                Yatırımcı paketi ile sınırsız rapor + gerçek kapanış + AI fırsat bildirim — ₺399/ay
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/fiyatlandirma?onerilen=yatirimci")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" /> Paketleri Gör
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 flex items-center gap-2 text-xs">
            <Crown className="h-4 w-4 text-emerald-300" />
            <span className="text-emerald-200 font-semibold">{tier.name}</span>
            <span className="text-slate-400">— Borsa terminal TAM erişim aktif</span>
          </div>
        )}

        {/* 1. TICKER (kayan) */}
        <div className="overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-900/80 py-2">
          <div className="flex gap-8 animate-marquee whitespace-nowrap text-sm">
            {[...enriched.slice(0, 15), ...enriched.slice(0, 15)].map((a, i) => (
              <span key={`${a.id}-${i}`} className="inline-flex items-center gap-2 px-3">
                <span className="font-mono text-cyan-300">{a.id.slice(0, 4).toUpperCase()}</span>
                <span className="text-slate-300">{a.title.slice(0, 25)}</span>
                <span className="font-bold text-white">{formatTRY(a.currentBid)}</span>
                <span
                  className={cn(
                    "font-semibold",
                    a.deltaPct >= 0 ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  {a.deltaPct >= 0 ? "▲" : "▼"}%{Math.abs(a.deltaPct)}
                </span>
                <span className="text-slate-600">|</span>
              </span>
            ))}
          </div>
        </div>

        {/* 2. CANLI SAYAÇLAR — Factory Metric Tile: zeminsiz, hairline ayraçlı tek satır
            (eskiden 4 ayrı renkli kart yüzeyi — cyan/violet/amber/emerald — B2.2/D-8) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-[var(--cizgi)] rounded-[10px] border border-[var(--cizgi)] sm:divide-y-0">
          <MetricCard icon={Radio} label="Canlı İhale" value={liveCount.toLocaleString("tr-TR")} sub="anlık aktif" />
          <MetricCard icon={BarChart3} label="Toplam Hacim" value={formatTRY(totalVolume)} sub="canlı pozisyon" />
          <MetricCard icon={Flame} label="Bugün Kapanan" value={todayClosed.length.toString()} sub="son 24 saat" />
          <MetricCard icon={Zap} label="AI Sinyali" value={aiSignals.length.toString()} sub="skor 80+ pozitif" />
        </div>

        {/* 3. ORDER BOOK */}
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-cyan-200 flex items-center gap-2">
              <Activity className="h-4 w-4" /> ORDER BOOK
            </h2>
            <span className="text-xs text-slate-500">Bitmeye yakın · top 8</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-slate-500 uppercase">
                <tr className="border-b border-slate-800">
                  <th className="text-start py-2">İlan</th>
                  <th className="text-start py-2">Bölge</th>
                  <th className="text-end py-2">Mevcut</th>
                  <th className="text-end py-2">Δ%</th>
                  <th className="text-end py-2">Teklif</th>
                  <th className="text-end py-2">Geri Sayım</th>
                </tr>
              </thead>
              <tbody>
                {orderBook.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
                  >
                    <td className="py-2 max-w-[200px]">
                      <Link
                        to={`/ilan/${a.id}`}
                        className="text-cyan-300 hover:underline truncate block"
                      >
                        {a.title.slice(0, 30)}
                      </Link>
                    </td>
                    <td className="py-2 text-slate-400 truncate max-w-[100px]">
                      {a.district || a.city}
                    </td>
                    <td className="py-2 text-end text-white font-semibold">
                      {formatTRY(a.currentBid)}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-end font-bold",
                        a.deltaPct >= 0 ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {a.deltaPct >= 0 ? "+" : ""}
                      {a.deltaPct}
                    </td>
                    <td className="py-2 text-end text-slate-300">{a.bidderCount || 0}</td>
                    <td className="py-2 text-end">
                      <CountdownTimer endDate={a.endDate} layout="compact" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 + 5: HEAT MAP + TOP MOVERS yan yana */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* HEAT MAP */}
          <div className="rounded-xl border border-violet-500/20 bg-slate-900/40 p-4">
            <h2 className="text-sm font-bold text-violet-200 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> BÖLGE HEAT MAP
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {regionHeat.slice(0, 9).map((r) => {
                const bg =
                  r.avgDelta > 5
                    ? "bg-emerald-500/30 border-emerald-400/50"
                    : r.avgDelta > 0
                      ? "bg-emerald-500/15 border-emerald-400/30"
                      : r.avgDelta > -5
                        ? "bg-rose-500/15 border-rose-400/30"
                        : "bg-rose-500/30 border-rose-400/50";
                return (
                  <div
                    key={r.city}
                    className={cn("rounded-lg border p-2", bg)}
                  >
                    <p className="text-xs font-semibold text-white truncate">{r.city}</p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        r.avgDelta >= 0 ? "text-emerald-300" : "text-rose-300",
                      )}
                    >
                      {r.avgDelta >= 0 ? "+" : ""}
                      {r.avgDelta.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-400">{r.count} ilan</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP MOVERS */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-900/40 p-4">
            <h2 className="text-sm font-bold text-emerald-200 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> TOP MOVERS
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" /> Yükselenler
                </p>
                <ul className="space-y-1 text-xs">
                  {gainers.map((a) => (
                    <li key={a.id}>
                      <Link
                        to={`/ilan/${a.id}`}
                        className="flex justify-between gap-2 hover:bg-slate-800/40 rounded px-1 py-0.5"
                      >
                        <span className="text-slate-300 truncate">
                          {a.title.slice(0, 20)}
                        </span>
                        <span className="text-emerald-400 font-bold whitespace-nowrap">
                          +{a.deltaPct}%
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3" /> Düşenler
                </p>
                <ul className="space-y-1 text-xs">
                  {losers.map((a) => (
                    <li key={a.id}>
                      <Link
                        to={`/ilan/${a.id}`}
                        className="flex justify-between gap-2 hover:bg-slate-800/40 rounded px-1 py-0.5"
                      >
                        <span className="text-slate-300 truncate">
                          {a.title.slice(0, 20)}
                        </span>
                        <span className="text-rose-400 font-bold whitespace-nowrap">
                          {a.deltaPct}%
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 6. CANLI TEKLİF AKIŞI + 7. AI SİNYALLER yan yana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* TEKLİF AKIŞI */}
          <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 p-4">
            <h2 className="text-sm font-bold text-cyan-200 mb-3 flex items-center gap-2">
              <Radio className="h-4 w-4 animate-pulse" /> CANLI TEKLİF AKIŞI
              <span className="ms-auto text-[10px] text-slate-500">sealed · anonim</span>
            </h2>
            <ul className="space-y-2 text-xs">
              {feedItems.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start gap-2 rounded-lg bg-slate-950/40 p-2 border border-slate-800/50"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse",
                      f.delta >= 0 ? "bg-emerald-400" : "bg-rose-400",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 truncate">{f.text}</p>
                    <p className="text-[10px] text-slate-500">
                      {f.district} · {f.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* AI SİNYALLER + bitmeye yakın */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-900/40 p-4">
            <h2 className="text-sm font-bold text-emerald-200 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" /> AI YATIRIM SİNYALLERİ
            </h2>
            <ul className="space-y-2 text-xs">
              {aiSignals.length === 0 ? (
                <li className="text-slate-500 italic">
                  Şu an pozitif sinyal yok (skor 80+ + Δ&gt;0 gerekli)
                </li>
              ) : (
                aiSignals.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/40 p-2 border border-emerald-500/20"
                  >
                    <Link
                      to={`/ilan/${a.id}`}
                      className="flex-1 min-w-0 hover:underline"
                    >
                      <p className="text-slate-200 truncate font-semibold">
                        {a.title.slice(0, 30)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {a.district} · {formatTRY(a.currentBid)}
                      </p>
                    </Link>
                    <div className="text-end">
                      <p className="text-emerald-400 font-bold">
                        {a.investmentScore}/100
                      </p>
                      <p className="text-[10px] text-emerald-300">+{a.deltaPct}%</p>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {/* Bitmeye yakın HOT */}
            {endingHot.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Bitmeye Yakın (anti-snipe aktif)
                </p>
                <ul className="space-y-1 text-xs">
                  {endingHot.map((a) => (
                    <li key={a.id} className="flex justify-between">
                      <Link
                        to={`/ilan/${a.id}`}
                        className="text-slate-300 hover:underline truncate"
                      >
                        {a.title.slice(0, 30)}
                      </Link>
                      <CountdownTimer endDate={a.endDate} layout="compact" size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

interface MetricCardProps {
  icon: typeof Radio;
  label: string;
  value: string;
  sub: string;
}

function MetricCard({ icon: Icon, label, value, sub }: MetricCardProps) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-xl font-normal text-white">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

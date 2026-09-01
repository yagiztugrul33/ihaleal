import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock3, PlusCircle, ShieldCheck, Siren, TrendingUp } from "lucide-react";
import { FxRef } from "@/components/FxRef";
import { useLiveMarket } from "@/borsa/useLiveMarket";
import { isOutbid } from "@/lib/borsa/auctionEngine";
import { useBorsaRegionWatchlist } from "@/hooks/useBorsaRegionWatchlist";
import { BORSA_REGIONS } from "@/lib/borsa/regions";
// `cn` 4 yerde JSX className içinde kullanılıyor (l.215, l.295, l.313, l.335);
// import eksikti → ReferenceError → ErrorBoundary → "500 Bir sorun oluştu".
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

type PriceAlert = {
  id: string;
  assetId: string;
  target: number;
  direction: "above" | "below";
  enabled: boolean;
};

type NotifyPrefs = {
  email: boolean;
  push: boolean;
  outbid: boolean;
  endingSoon: boolean;
  kvkkOptIn: boolean;
};

function formatTry(value: number): string {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

function formatRemaining(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}s ${m}dk`;
}

export default function BorsaWatchlistPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const b = t.borsa;
  const { data } = useLiveMarket();
  const { watched, toggle } = useBorsaRegionWatchlist();
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("borsa_watchlist_ids");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  });
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const raw = localStorage.getItem("borsa_price_alerts");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as PriceAlert[]) : [];
    } catch {
      return [];
    }
  });
  const [myBidsByAsset, setMyBidsByAsset] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem("borsa_my_bid_by_asset");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
    } catch {
      return {};
    }
  });
  const [prefs, setPrefs] = useState<NotifyPrefs>(() => {
    try {
      const raw = localStorage.getItem("borsa_notify_prefs");
      if (!raw) {
        return {
          email: true,
          push: true,
          outbid: true,
          endingSoon: true,
          kvkkOptIn: false,
        };
      }
      const parsed = JSON.parse(raw);
      return {
        email: Boolean(parsed?.email),
        push: Boolean(parsed?.push),
        outbid: Boolean(parsed?.outbid),
        endingSoon: Boolean(parsed?.endingSoon),
        kvkkOptIn: Boolean(parsed?.kvkkOptIn),
      };
    } catch {
      return {
        email: true,
        push: true,
        outbid: true,
        endingSoon: true,
        kvkkOptIn: false,
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("borsa_watchlist_ids", JSON.stringify(watchlistIds));
  }, [watchlistIds]);

  useEffect(() => {
    localStorage.setItem("borsa_notify_prefs", JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const sync = () => {
      try {
        const rawAlerts = localStorage.getItem("borsa_price_alerts");
        const rawBids = localStorage.getItem("borsa_my_bid_by_asset");
        if (rawAlerts) {
          const parsedAlerts = JSON.parse(rawAlerts);
          if (Array.isArray(parsedAlerts)) setPriceAlerts(parsedAlerts as PriceAlert[]);
        }
        if (rawBids) {
          const parsedBids = JSON.parse(rawBids);
          if (parsedBids && typeof parsedBids === "object") setMyBidsByAsset(parsedBids as Record<string, number>);
        }
      } catch {
        // no-op for demo local sync
      }
    };

    sync();
    const id = window.setInterval(sync, 2000);
    return () => window.clearInterval(id);
  }, []);

  const watchlistRows = data.filter((row) => watchlistIds.includes(row.id));
  const endingSoonRows = watchlistRows.filter((row) => row.remainingMin <= 45).slice(0, 4);
  const outbidRows = watchlistRows
    .map((row) => {
      const mine = myBidsByAsset[row.id];
      if (!mine) return null;
      const outbid = isOutbid(mine, row.price);
      if (!outbid) return null;
      return {
        id: row.id,
        code: row.code,
        mine,
        current: row.price,
      };
    })
    .filter((row): row is { id: string; code: string; mine: number; current: number } => Boolean(row));
  const priceAlertCards = priceAlerts
    .filter((alert) => alert.enabled)
    .map((alert) => {
      const asset = data.find((row) => row.id === alert.assetId);
      if (!asset) return null;
      const hit = alert.direction === "above" ? asset.price >= alert.target : asset.price <= alert.target;
      return {
        id: alert.id,
        code: asset.code,
        target: alert.target,
        current: asset.price,
        direction: alert.direction,
        hit,
      };
    })
    .filter(
      (item): item is { id: string; code: string; target: number; current: number; direction: "above" | "below"; hit: boolean } =>
        Boolean(item),
    );

  return (
    <main className="w-full space-y-4 px-4 py-4 text-slate-100 lg:px-8 2xl:px-12">
      <section className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4">
        <p className="text-[11px] font-normal uppercase tracking-[0.16em] text-[var(--metin-ikincil)]">{b.watchlistEyebrow}</p>
        <h1 className="mt-1 text-2xl font-normal text-white">{b.watchlistTitle}</h1>
        <p className="mt-2 text-sm text-slate-300">
          Takip ettiğiniz varlıkları canlı fiyatla izleyin, teklif geçilmesi ve kapanış alarmlarını kart bazlı yönetin.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="rounded-[10px] border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-normal uppercase tracking-[0.13em] text-slate-200">Takip Listesi</h2>
            <span className="text-xs text-slate-400">{watchlistRows.length} varlık</span>
          </div>

          {watchlistRows.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-slate-600 bg-slate-900/60 p-4 text-center">
              <p className="text-sm font-normal text-slate-200">Takip listeniz boş</p>
              <p className="mt-1 text-xs text-slate-400">Varlık ekleyerek fiyat, outbid ve bitiş alarmlarını açabilirsiniz.</p>
              <button
                type="button"
                onClick={() => navigate("/borsa/varliklar")}
                className="mt-3 inline-flex items-center gap-1 rounded-[3px] border border-[var(--cizgi)] px-3 py-1.5 text-xs font-normal text-[var(--metin)] hover:bg-[var(--zemin-yumusak)]"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Varlık Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full text-sm">
                <thead className="text-start text-[11px] uppercase tracking-[0.11em] text-slate-400">
                  <tr>
                    <th className="pb-2 pe-3">Kod</th>
                    <th className="pb-2 pe-3">Mülk</th>
                    <th className="pb-2 pe-3">Canlı ₺</th>
                    <th className="pb-2 pe-3">Değişim</th>
                    <th className="pb-2 pe-3">Süre</th>
                    <th className="pb-2">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-800/80">
                      <td className="py-2.5 pe-3 font-normal text-slate-200">{row.code}</td>
                      <td className="py-2.5 pe-3 text-slate-200">{row.property}</td>
                      <td className="py-2.5 pe-3 font-normal text-white">{formatTry(row.price)}<FxRef amountTry={row.price} variant="compact" /></td>
                      <td className="py-2.5 pe-3 font-normal" style={{ color: row.changePct >= 0 ? "var(--metrik-yesil)" : "var(--sinyal-turuncu)" }}>
                        {row.changePct >= 0 ? "+" : ""}
                        {row.changePct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 pe-3 text-slate-300">{formatRemaining(row.remainingMin)}</td>
                      <td className="py-2.5">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/borsa/varlik/${row.id}?intent=bid`)}
                            className="rounded-[3px] border border-[var(--cizgi)] px-2 py-1 text-[10px] font-normal uppercase tracking-[0.1em] text-[var(--metin)] hover:bg-[var(--zemin-yumusak)]"
                          >
                            Hızlı Teklif
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/borsa/varlik/${row.id}`)}
                            className="rounded-[3px] border border-[var(--cizgi)] px-2 py-1 text-[10px] font-normal uppercase tracking-[0.1em] text-[var(--metin)] hover:bg-[var(--zemin-yumusak)]"
                          >
                            Detay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="rounded-[10px] border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-normal uppercase tracking-[0.13em] text-slate-200">Bildirim Tercihleri</h2>
            <Bell className="h-4 w-4 text-[var(--metin-ikincil)]" />
          </div>
          <div className="space-y-2 text-xs">
            {[
              { key: "email", label: "E-posta bildirimi" },
              { key: "push", label: "Push bildirimi" },
              { key: "outbid", label: "Teklif geçildi (outbid) alarmı" },
              { key: "endingSoon", label: "Açık artırma bitiyor alarmı" },
              { key: "kvkkOptIn", label: "KVKK izinli demo bildirim onayı" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between rounded-[10px] border border-slate-700/80 bg-slate-900/65 px-2.5 py-2">
                <span className="text-slate-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={prefs[item.key as keyof NotifyPrefs]}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      [item.key]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--metin-ikincil)]"
                />
              </label>
            ))}
          </div>
          <p className="mt-3 rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-2.5 py-2 text-[11px] text-[var(--metin-ikincil)]">
            Demo ortam: bildirimler simüle edilir; canlıda açık rıza ve KVKK süreçleri zorunludur.
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-[10px] border border-border bg-card p-3">
          <h3 className="mb-3 text-sm font-normal uppercase tracking-[0.12em] text-slate-200">Fiyat Hedefi Alarmları</h3>
          <div className="space-y-2">
            {priceAlertCards.length === 0 ? (
              <p className="rounded-[10px] border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                Aktif fiyat hedefi bulunmuyor.
              </p>
            ) : (
              priceAlertCards.map((card) => (
                <div key={card.id} className="rounded-[10px] border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs">
                  <p className="font-normal text-slate-100">
                    {card.code} · {card.direction === "above" ? "Üzeri" : "Altı"} {formatTry(card.target)}
                  </p>
                  <p className={cn("mt-1", !card.hit && "text-slate-400")} style={card.hit ? { color: "var(--metrik-yesil)" } : undefined}>
                    Güncel: {formatTry(card.current)} {card.hit ? "· Tetiklendi (demo)" : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[10px] border border-border bg-card p-3">
          <h3 className="mb-3 text-sm font-normal uppercase tracking-[0.12em] text-slate-200">Bölge Endeks İzleme</h3>
          <p className="mb-3 text-[11px] text-slate-400">Endeks değişiminde uygulama içi bildirim (≥0,5 puan).</p>
          <div className="flex flex-wrap gap-2">
            {BORSA_REGIONS.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => toggle(r.code)}
                className={cn(
                  "rounded-[3px] border px-2.5 py-1 text-xs font-normal",
                  watched.includes(r.code)
                    ? "border-[var(--metin-ikincil)] bg-[var(--zemin)] text-[var(--metin)]"
                    : "border-[var(--cizgi)] text-[var(--metin-ikincil)]",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[10px] border border-border bg-card p-3">
          <h3 className="mb-3 text-sm font-normal uppercase tracking-[0.12em] text-slate-200">Teklif Geçildi (Outbid)</h3>
          <div className="space-y-2">
            {outbidRows.length === 0 ? (
              <p className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-xs" style={{ color: "var(--metrik-yesil)" }}>
                Aktif outbid alarmı yok, tekliflerin şu an güvende.
              </p>
            ) : (
              outbidRows.map((row) => (
                <div key={row.id} className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-xs" style={{ color: "var(--sinyal-turuncu)" }}>
                  <p className="font-normal">{row.code}</p>
                  <p className="mt-1">
                    Senin teklifin {formatTry(row.mine)} · güncel en yüksek {formatTry(row.current)}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/borsa/varlik/${row.id}?intent=bid`)}
                    className="mt-2 inline-flex items-center gap-1 rounded-[3px] border border-[var(--cizgi)] px-2 py-1 text-[10px] font-normal uppercase tracking-[0.1em]"
                    style={{ color: "var(--sinyal-turuncu)" }}
                  >
                    <Siren className="h-3.5 w-3.5" /> Teklifi Güncelle
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[10px] border border-border bg-card p-3">
          <h3 className="mb-3 text-sm font-normal uppercase tracking-[0.12em] text-slate-200">Açık Artırma Bitiyor</h3>
          <div className="space-y-2">
            {endingSoonRows.length === 0 ? (
              <p className="rounded-[10px] border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                45 dakikanın altında ihale yok.
              </p>
            ) : (
              endingSoonRows.map((row) => (
                <div key={row.id} className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-xs" style={{ color: "var(--sinyal-turuncu)" }}>
                  <p className="font-normal">{row.code}</p>
                  <p className="mt-1">{formatRemaining(row.remainingMin)} kaldı · {formatTry(row.price)}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/borsa/varlik/${row.id}`)}
                    className="mt-2 inline-flex items-center gap-1 rounded-[3px] border border-[var(--cizgi)] px-2 py-1 text-[10px] font-normal uppercase tracking-[0.1em]"
                    style={{ color: "var(--sinyal-turuncu)" }}
                  >
                    <Clock3 className="h-3.5 w-3.5" /> Detaya Git
                  </button>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-[11px] text-[var(--metin-ikincil)]">
        <p className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          İzleme verileri demo simülasyondur; gerçek bildirim ve bildirim saklama süreçleri canlı regülasyon onayı ile açılır.
        </p>
      </section>

      <section className="rounded-[10px] border border-slate-700/80 bg-slate-900/65 p-3">
        <h3 className="text-sm font-normal uppercase tracking-[0.12em] text-slate-200">Hızlı Ekle</h3>
        <p className="mt-1 text-xs text-slate-400">En çok yükselen varlıkları tek tıkla izleme listesine ekleyin.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...data]
            .sort((a, b) => b.changePct - a.changePct)
            .slice(0, 4)
            .map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() =>
                  setWatchlistIds((prev) => (prev.includes(row.id) ? prev : [...prev, row.id]))
                }
                className="inline-flex items-center gap-1 rounded-[3px] border border-[var(--cizgi)] px-2.5 py-1.5 text-xs font-normal hover:bg-[var(--zemin-yumusak)]"
                style={{ color: "var(--metrik-yesil)" }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {row.code}
              </button>
            ))}
        </div>
      </section>
    </main>
  );
}

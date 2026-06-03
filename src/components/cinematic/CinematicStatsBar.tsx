import { useEffect, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { useLocale } from "@/contexts/LocaleContext";
import { programmaticSeoPageCount } from "@/lib/seo/programmaticSeo";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";

/**
 * Master Dalga 1-4: Aktif ihale sayacı — anasayfa trust + aciliyet sinyali.
 * İlk render senkron lokal/static katalogtan, sonra Supabase'ten asenkron
 * tam katalog yüklenince güncellenir. Sayım `status === "live"` olanlar.
 */
function useActiveAuctionCount(): number {
  const [count, setCount] = useState<number>(() => {
    return getLocalAndStaticAuctions().filter((a) => a.status === "live").length;
  });
  useEffect(() => {
    let alive = true;
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (!alive) return;
        const live = rows.filter((a) => a.status === "live").length;
        setCount(live);
      })
      .catch(() => {
        // Sessiz fallback — initial senkron sayım korunur
      });
    return () => {
      alive = false;
    };
  }, []);
  return count;
}

/**
 * "Anasayfa boşluk doldurma" turu (2026-06-03): "—" çevrimiçi kutusu kaldırıldı
 * (pre-launch'ta dürüst sayı yok → sahte göstermek yerine 3'lü dengeli grid).
 * useOnlinePresence altyapısı korunuyor; OnlinePresenceBadge başka yerlerde
 * connected===true && count>=1 olduğunda hâlâ canlı sayıyı gösterebiliyor.
 * Etiketler 4 dile (TR/EN/RU/AR) bağlandı; sayılar AR'da `dir="ltr"`.
 */
export function CinematicStatsBar() {
  const { t } = useLocale();
  const s = t.cinematicStats;
  const seoPages = programmaticSeoPageCount();
  const liveAuctions = useActiveAuctionCount();
  const pagesAnimated = useCountUp(seoPages, 1600);
  const liveAnimated = useCountUp(liveAuctions, 1400);

  return (
    <div className="cinematic-stats-bar" data-testid="cinematic-stats">
      <div className="cinematic-stats-bar__item" data-testid="stats-active-auctions">
        <span className="cinematic-stats-bar__value" style={{ color: "#fbbf24" }} dir="ltr">
          {liveAnimated.toLocaleString("tr-TR")}
        </span>
        <span className="cinematic-stats-bar__label">{s.activeAuctions}</span>
      </div>
      <div className="cinematic-stats-bar__divider" aria-hidden />
      <div className="cinematic-stats-bar__item" data-testid="stats-seo-pages">
        <span className="cinematic-stats-bar__value" dir="ltr">
          {pagesAnimated.toLocaleString("tr-TR")}
        </span>
        <span className="cinematic-stats-bar__label">{s.seoPages}</span>
      </div>
      <div className="cinematic-stats-bar__divider" aria-hidden />
      <div className="cinematic-stats-bar__item" data-testid="stats-live-exchange">
        <span className="cinematic-stats-bar__value cinematic-stats-bar__pulse">{s.liveLabel}</span>
        <span className="cinematic-stats-bar__label">{s.exchangeTerminal}</span>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
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

export function CinematicStatsBar() {
  const seoPages = programmaticSeoPageCount();
  const { onlineCount, connected } = useOnlinePresence();
  const liveAuctions = useActiveAuctionCount();
  const pagesAnimated = useCountUp(seoPages, 1600);
  const onlineAnimated = useCountUp(connected ? onlineCount : 0, 1200, connected);
  const liveAnimated = useCountUp(liveAuctions, 1400);

  return (
    <div className="cinematic-stats-bar" data-testid="cinematic-stats">
      <div className="cinematic-stats-bar__item" data-testid="stats-active-auctions">
        <span className="cinematic-stats-bar__value" style={{ color: "#fbbf24" }}>
          {liveAnimated.toLocaleString("tr-TR")}
        </span>
        <span className="cinematic-stats-bar__label">aktif ihale</span>
      </div>
      <div className="cinematic-stats-bar__divider" aria-hidden />
      <div className="cinematic-stats-bar__item">
        <span className="cinematic-stats-bar__value">{pagesAnimated.toLocaleString("tr-TR")}</span>
        <span className="cinematic-stats-bar__label">SEO sayfa</span>
      </div>
      <div className="cinematic-stats-bar__divider" aria-hidden />
      <div className="cinematic-stats-bar__item">
        <span className="cinematic-stats-bar__value">
          {connected ? onlineAnimated.toLocaleString("tr-TR") : "—"}
        </span>
        <span className="cinematic-stats-bar__label">çevrimiçi</span>
      </div>
      <div className="cinematic-stats-bar__divider" aria-hidden />
      <div className="cinematic-stats-bar__item">
        <span className="cinematic-stats-bar__value cinematic-stats-bar__pulse">CANLI</span>
        <span className="cinematic-stats-bar__label">borsa terminali</span>
      </div>
    </div>
  );
}

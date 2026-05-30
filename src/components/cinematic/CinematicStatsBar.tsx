import { useCountUp } from "@/hooks/useCountUp";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { programmaticSeoPageCount } from "@/lib/seo/programmaticSeo";

export function CinematicStatsBar() {
  const seoPages = programmaticSeoPageCount();
  const { onlineCount, connected } = useOnlinePresence();
  const pagesAnimated = useCountUp(seoPages, 1600);
  const onlineAnimated = useCountUp(connected ? onlineCount : 0, 1200, connected);

  return (
    <div className="cinematic-stats-bar" data-testid="cinematic-stats">
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

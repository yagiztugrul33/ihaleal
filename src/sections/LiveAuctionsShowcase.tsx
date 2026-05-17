import { Link, useNavigate } from "react-router-dom";
import { Clock, MapPin, Users, ArrowRight, Shield, Sparkles, Eye, Globe2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getLocalAndStaticAuctions } from "@/lib/auctionsSource";
import { ListingCoverImage } from "@/components/ListingCoverImage";

const TRUST_FEATURES = [
  { icon: Shield, title: "Güvenlik", desc: "Banka duzeyi sifreleme.", color: "text-blue-400", bg: "bg-blue-500/15" },
  { icon: Sparkles, title: "AI Analitik", desc: "Degerleme motoru ve yatirim skoru.", color: "text-violet-400", bg: "bg-violet-500/15" },
  { icon: Eye, title: "Seffaflik", desc: "Her adim denetlenebilir.", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { icon: Globe2, title: "Kuresel Erisim", desc: "Turkiye ve global ag.", color: "text-sky-400", bg: "bg-sky-500/15" },
] as const;

function formatPrice(n: number) {
  if (n >= 1_000_000) return "\u20ba" + (n / 1_000_000).toFixed(1) + "M";
  return "\u20ba" + n.toLocaleString("tr-TR");
}

function pctIncrease(current: number, estimated: number) {
  if (!estimated) return 0;
  return Math.round(((current - estimated * 0.85) / estimated) * 100);
}

export function LiveAuctionsShowcase() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.08);
  const live = getLocalAndStaticAuctions().filter((a) => a.status === "live").slice(0, 4);

  return (
    <section id="auctions" className="ref-section py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid gap-10 xl:grid-cols-[1fr_320px] xl:gap-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="ref-section-title">Canlı İhaleler</h2>
                <p className="mt-2 text-slate-400">Güncel fırsatlar — AI degerleme dahil</p>
              </div>
              <Link to="/ilanlar" className="ref-link-arrow">
                Tüm ihaleleri gör
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {live.map((auction, idx) => {
                const pct = Math.max(5, pctIncrease(auction.currentBid, auction.estimatedValue));
                const hoursLeft = Math.max(1, Math.floor((new Date(auction.endDate).getTime() - Date.now()) / 3600000));
                return (
                  <article
                    key={auction.id}
                    className="ref-property-card group cursor-pointer"
                    style={{ transitionDelay: `${idx * 80}ms` }}
                    onClick={() => navigate(`/ilan/${auction.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/ilan/${auction.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="ref-property-image-wrap">
                      <ListingCoverImage src={auction.images[0]} alt={auction.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="ref-property-image-overlay" />
                      <span className="ref-live-pill">CANLI</span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-1 text-base font-bold text-white">{auction.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {auction.district}, {auction.city}
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-xl font-bold text-white">{formatPrice(auction.currentBid)}</p>
                          <span className="ref-pct-badge">+{pct}%</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{hoursLeft}s kaldı</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden />{auction.bidderCount} teklif</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          <aside className="ref-trust-sidebar">
            <h3 className="ref-sidebar-title">Yatırımcılar neden İhaleal&apos;e güvenir</h3>
            <ul className="mt-6 space-y-4">
              {TRUST_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                <li key={title} className="ref-trust-feature">
                  <div className={`ref-trust-feature-icon ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="ref-compliance-row mt-8">
              <span>ISO 27001</span>
              <span>SOC 2 Type II</span>
              <span>KVKK</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

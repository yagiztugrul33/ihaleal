import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Heart,
  MapPin,
  Share2,
  GitCompare,
  MessageCircle,
  Gavel,
  ShoppingCart,
  X,
} from "lucide-react";
import { getPropertyById, getRelatedProperties } from "@/lib/demo-data";
import type { PropertyRecord } from "@/types/property";
import {
  getPropertyHero,
  getPropertyLocation,
  getPropertyPrice,
  getPropertyTitle,
  isFabrika,
  isGes,
  isKonutVilla,
  isOtel,
  isTarla,
} from "@/types/property";
import { PropertyListingCard } from "@/components/ilan/PropertyListingCard";
import { IlanDetailTabs } from "@/components/ilan/IlanDetailTabs";
import { useFavorites } from "@/hooks/useFavorites";
import "@/styles/ilan-pages.css";

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function IlanDetayPage({ id }: { id: string }) {
  const property = getPropertyById(id);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!property) {
    return (
      <div className="ilan-detay" data-testid="ilan-detay">
        <section className="ilan-detay__hero" style={{ padding: "3rem 1rem" }}>
          <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 bg-white/[0.03] p-6 text-center">
            <h1 className="text-2xl font-bold text-white">İlan detayı bulunamadı</h1>
            <p className="mt-3 text-slate-400">
              Bu kayıt taşınmış veya erişim kapsamı dışında olabilir. Listeye dönüp güncel ilanları inceleyebilirsiniz.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link to="/ilanlar" className="inline-flex rounded-lg border border-cyan-400/35 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10">
                İlanlara dön
              </Link>
              <Link to="/destek" className="inline-flex rounded-lg border border-slate-200/80 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.04]">
                Destek talebi oluştur
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const hero = getPropertyHero(property) ?? "/images/auction-1.jpg";
  const images = property.images?.length ? property.images : [hero];
  const price = getPropertyPrice(property);
  const location = getPropertyLocation(property);
  const related = getRelatedProperties(property, 4);
  const isLive =
    property.marketingMode === "auction" &&
    (property.details?.auctionStatus === "live" || property.currentBidTry != null);

  return (
    <div className="ilan-detay" data-testid="ilan-detay">
      <HeroSection
        hero={hero}
        images={images}
        property={property}
        price={price}
        location={location}
        isLive={isLive}
        onOpenLightbox={setLightbox}
      />

      <IlanDetailTabs
        property={property}
        typeExtras={{
          otel: isOtel(property),
          fabrika: isFabrika(property),
          tarla: isTarla(property),
          ges: isGes(property),
          villa: isKonutVilla(property),
        }}
      />

      <section className="ilan-detay__related" aria-labelledby="ilan-related-title">
        <h2 id="ilan-related-title">Benzer ilanlar</h2>
        <div className="ilan-detay__related-grid">
          {related.map((p) => (
            <PropertyListingCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <section className="ilan-detay__qa" aria-labelledby="ilan-qa-title">
        <h2 id="ilan-qa-title">Soru & yorum</h2>
        <p className="ilan-detay__empty-hint">
          Bu ilan için demo soru-cevap alanı. Platform açıldığında satıcı ve AI asistan yanıt verecek.
        </p>
        <Link to="/destek" className="ilan-detay__cta-link">
          Soru sor
        </Link>
      </section>

      <aside className="ilan-detay__ai-panel" aria-label="AI asistan">
        <h3>Bu ilan hakkında soru sor</h3>
        <p>Demo: &quot;Bu bölgede m² fiyatı nasıl?&quot;, &quot;İhaleye katılım şartları neler?&quot;</p>
        <button type="button" className="ilan-detay__ai-btn">
          AI Asistan (demo)
        </button>
      </aside>

      {lightbox ? (
        <div
          className="ilan-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button
            type="button"
            className="ilan-lightbox__close"
            aria-label="Kapat"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img src={lightbox} alt="" loading="eager" decoding="async" width={1600} height={900} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}

function HeroSection(props: {
  hero: string;
  images: string[];
  property: PropertyRecord;
  price: number | undefined;
  location: string;
  isLive: boolean;
  onOpenLightbox: (src: string) => void;
}) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { hero, images, property, price, location, isLive, onOpenLightbox } = props;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/#/ilanlar/${property.id}` : `/ilanlar/${property.id}`;

  const pushToast = (message: string) => {
    window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message, type: "success" } }));
  };

  const handleCompare = () => {
    navigate(`/karsilastir?ids=${property.id}`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: getPropertyTitle(property), text: `${getPropertyTitle(property)} ilanını inceleyin.`, url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      pushToast("İlan bağlantısı paylaşıldı.");
    } catch {
      // user cancelled share dialog
    }
  };

  return (
    <div className="ilan-detay__hero">
      <div className="ilan-detay__gallery">
        <button
          type="button"
          className="ilan-detay__gallery-main"
          onClick={() => onOpenLightbox(hero)}
        >
          <img src={hero} alt="" loading="eager" decoding="async" width={1280} height={800} />
        </button>
        <div className="ilan-detay__gallery-thumbs">
          {images.slice(0, 4).map((src) => (
            <button
              key={src}
              type="button"
              className="ilan-detay__thumb"
              onClick={() => onOpenLightbox(src)}
            >
              <img src={src} alt="" loading="lazy" decoding="async" width={320} height={320} />
            </button>
          ))}
        </div>
      </div>
      <aside className="ilan-detay__summary">
        {isLive ? (
          <span className="ilan-detay__live">
            <i /> LIVE
          </span>
        ) : null}
        <h1>{getPropertyTitle(property)}</h1>
        <p className="ilan-detay__location">
          <MapPin className="h-4 w-4" aria-hidden />
          {location}
        </p>
        <div className="ilan-detay__price-block">
          <small>{property.dealType === "rent" ? "Kira" : "Fiyat"}</small>
          <strong>{price != null ? formatTry(price) : "—"}</strong>
          {property.aiPredictedPriceTry ? (
            <span className="ilan-detay__ai-hint">
              AI: {formatTry(property.aiPredictedPriceTry)} (%{Math.round((property.aiConfidence ?? 0.75) * 100)})
            </span>
          ) : null}
        </div>
        {isLive && property.currentBidTry != null ? (
          <AuctionStrip property={property} />
        ) : null}
        <div className="ilan-detay__actions">
          <Link to={`/teklif-al?ilan=${property.id}`} className="ilan-detay__btn ilan-detay__btn--primary">
            <Gavel className="h-4 w-4" aria-hidden />
            Teklif Ver
          </Link>
          {property.dealType !== "rent" && property.buyNowPriceTry != null ? (
            <Link to={`/ilanlar/${property.id}?mode=buy-now`} className="ilan-detay__btn ilan-detay__btn--buy-now">
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Hemen Al
            </Link>
          ) : null}
          <button
            type="button"
            className="ilan-detay__btn ilan-detay__btn--ghost"
            aria-label={isFavorite(property.id) ? "Favoriden kaldır" : "Favorilere ekle"}
            onClick={() => {
              const nextFavorited = !isFavorite(property.id);
              toggleFavorite(property.id);
              pushToast(nextFavorited ? "İlan favorilere eklendi." : "İlan favorilerden çıkarıldı.");
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite(property.id) ? "fill-current text-rose-400" : ""}`} />
          </button>
          <button type="button" className="ilan-detay__btn ilan-detay__btn--ghost" aria-label="Karşılaştır" onClick={handleCompare}>
            <GitCompare className="h-4 w-4" />
          </button>
          <button type="button" className="ilan-detay__btn ilan-detay__btn--ghost" aria-label="Paylaş" onClick={() => void handleShare()}>
            <Share2 className="h-4 w-4" />
          </button>
          <Link to="/destek" className="ilan-detay__btn ilan-detay__btn--ghost">
            <MessageCircle className="h-4 w-4" />
            Soru Sor
          </Link>
        </div>
        <dl className="ilan-detay__quick-facts">
          {property.grossSqm ? (
            <>
              <dt>Brüt m²</dt>
              <dd>{property.grossSqm}</dd>
            </>
          ) : null}
          {property.roomCount ? (
            <>
              <dt>Oda</dt>
              <dd>{property.roomCount}</dd>
            </>
          ) : null}
          {property.buildingAge ? (
            <>
              <dt>Bina yaşı</dt>
              <dd>{property.buildingAge}</dd>
            </>
          ) : null}
        </dl>
      </aside>
    </div>
  );
}

function AuctionStrip({ property }: { property: PropertyRecord }) {
  return (
    <div className="ilan-detay__auction-strip">
      <div>
        <small>Cari teklif</small>
        <strong>{formatTry(property.currentBidTry!)}</strong>
      </div>
      <div className="ilan-detay__timer">
        <Clock className="h-4 w-4" aria-hidden />
        <span>Canlı ihale — {property.bidCount ?? 0} teklif</span>
      </div>
    </div>
  );
}

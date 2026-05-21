import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import type { PropertyRecord } from "@/types/property";
import { EarthquakeScoreBadge } from "@/components/property/EarthquakeScoreBadge";
import "@/styles/afet-disaster-hub.css";
import {
  getPropertyHero,
  getPropertyLocation,
  getPropertyPrice,
  getPropertyTitle,
} from "@/types/property";
import { formatTry } from "@/lib/valuation/valuationEngine";

export interface PropertyListingCardProps {
  property: PropertyRecord;
}

function isLiveAuction(property: PropertyRecord): boolean {
  return (
    property.marketingMode === "auction" &&
    (property.details?.auctionStatus === "live" || property.currentBidTry != null)
  );
}

export function PropertyListingCard({ property }: PropertyListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const hero = getPropertyHero(property);
  const price = getPropertyPrice(property);
  const location = getPropertyLocation(property);
  const live = isLiveAuction(property);
  const currentBid = property.currentBidTry ?? property.priceTry ?? 0;
  const startingBid = property.startingBidTry ?? Math.max(Math.round(currentBid * 0.96), 1);
  const changePct = currentBid > 0 ? ((currentBid - startingBid) / Math.max(startingBid, 1)) * 100 : 0;
  const positive = changePct >= 0;
  const details = (property.details ?? {}) as Record<string, unknown>;
  const endDateRaw = typeof details.auctionEndAt === "string" ? details.auctionEndAt : null;
  const remainingText = (() => {
    if (!endDateRaw) return "Süre: Bilgi yok";
    const ms = new Date(endDateRaw).getTime() - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return "Süre: Doldu";
    const hours = Math.floor(ms / 3_600_000);
    const days = Math.floor(hours / 24);
    return days > 0 ? `Süre: ${days}g ${hours % 24}s` : `Süre: ${Math.max(hours, 0)}s`;
  })();

  return (
    <article className="ilan-card">
      <div className="ilan-card__media-wrap">
        <Link to={`/ilanlar/${property.id}`} className="ilan-card__media">
          {hero ? (
            <img src={hero} alt="" loading="lazy" />
          ) : (
            <div className="ilan-card__media-fallback" aria-hidden />
          )}
          {live ? (
            <span className="ilan-card__live">
              <i /> LIVE
            </span>
          ) : null}
        </Link>
        <div className="ilan-card__eq-badge">
          <EarthquakeScoreBadge property={property} />
        </div>
      </div>

      <div className="ilan-card__body">
        <div className="ilan-card__head">
          <Link to={`/ilanlar/${property.id}`} className="ilan-card__title">
            {getPropertyTitle(property)}
          </Link>
          <button
            type="button"
            className="ilan-card__heart"
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite((v) => !v);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-rose-400" : ""}`} />
          </button>
        </div>

        <p className="ilan-card__location">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {location || "Konum belirtilmedi"}
        </p>

        <p className="ilan-card__price">
          {price != null ? formatTry(price) : "Fiyat sorunuz"}
          {property.dealType === "rent" ? <small>/ ay</small> : null}
        </p>
        <div className="ilan-card__auction-line">
          <span>Güncel teklif: {currentBid > 0 ? formatTry(currentBid) : "—"}</span>
          <span className={positive ? "ilan-card__change is-up" : "ilan-card__change is-down"}>
            {positive ? "+" : ""}
            %{changePct.toFixed(2)}
          </span>
        </div>

        <div className="ilan-card__meta">
          {property.grossSqm ? <span>{property.grossSqm} m²</span> : null}
          {property.roomCount ? <span>{property.roomCount}</span> : null}
          <span>{remainingText}</span>
        </div>
        <div className="ilan-card__actions">
          {property.dealType !== "rent" && property.buyNowPriceTry != null ? (
            <Link to={`/ihale/${property.id}`} className="ilan-card__buy-now">
              Hemen Al
            </Link>
          ) : null}
          <Link to={`/ilanlar/${property.id}`} className="ilan-card__watch">
            İzle
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PropertyListingCard;

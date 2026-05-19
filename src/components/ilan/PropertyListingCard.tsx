import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import type { PropertyRecord } from "@/types/property";
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
  const hero = getPropertyHero(property);
  const price = getPropertyPrice(property);
  const location = getPropertyLocation(property);
  const live = isLiveAuction(property);

  return (
    <article className="ilan-card">
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

      <div className="ilan-card__body">
        <div className="ilan-card__head">
          <Link to={`/ilanlar/${property.id}`} className="ilan-card__title">
            {getPropertyTitle(property)}
          </Link>
          <button
            type="button"
            className="ilan-card__heart"
            aria-label="Favorilere ekle"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4" />
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

        <div className="ilan-card__meta">
          {property.grossSqm ? <span>{property.grossSqm} m²</span> : null}
          {property.roomCount ? <span>{property.roomCount}</span> : null}
        </div>
      </div>
    </article>
  );
}

export default PropertyListingCard;

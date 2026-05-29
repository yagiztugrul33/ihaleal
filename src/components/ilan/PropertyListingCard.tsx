import { Link } from "react-router-dom";
import { BadgeCheck, Clock3, GitCompare, Heart, MapPin, ShieldCheck } from "lucide-react";
import type { PropertyRecord } from "@/types/property";
import { EarthquakeScoreBadge } from "@/components/property/EarthquakeScoreBadge";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import "@/styles/afet-disaster-hub.css";
import {
  getPropertyHero,
  getPropertyLocation,
  getPropertyPrice,
  getPropertyTitle,
} from "@/types/property";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompareSelection } from "@/hooks/useCompareSelection";
import { buildSellerTrustProfile } from "@/lib/sellerTrust";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface PropertyListingCardProps {
  property: PropertyRecord;
}

function isLiveAuction(property: PropertyRecord): boolean {
  return (
    property.marketingMode === "auction" &&
    (property.details?.auctionStatus === "live" || property.currentBidTry != null)
  );
}

function listingModeBadge(property: PropertyRecord): { label: string; tone: "auction" | "sale" | "rent" | "sealed" } {
  if (property.marketingMode === "auction") return { label: "Borsa", tone: "auction" };
  if (property.marketingMode === "sealed_offers") return { label: "Kapalı Teklif", tone: "sealed" };
  if (property.dealType === "rent") return { label: "Kiralık", tone: "rent" };
  return { label: "Standart İlan", tone: "sale" };
}

export function PropertyListingCard({ property }: PropertyListingCardProps) {
  const { formatFromTry, usdRate } = useCurrency();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { has, toggle, isFull } = useCompareSelection();
  const hero = getPropertyHero(property);
  const price = getPropertyPrice(property);
  const location = getPropertyLocation(property);
  const live = isLiveAuction(property);
  const currentBid = property.currentBidTry ?? property.priceTry ?? 0;
  const startingBid = property.startingBidTry ?? Math.max(Math.round(currentBid * 0.96), 1);
  const changePct = currentBid > 0 ? ((currentBid - startingBid) / Math.max(startingBid, 1)) * 100 : 0;
  const positive = changePct >= 0;
  const details = (property.details ?? {}) as Record<string, unknown>;
  const modeBadge = listingModeBadge(property);
  const seller = buildSellerTrustProfile(property.id);
  const citizenshipEligible = price != null && price / usdRate >= 400_000;
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
            <ListingCoverImage src={hero} alt={getPropertyTitle(property)} className="w-full h-full object-cover" />
          ) : (
            <div className="ilan-card__media-fallback" aria-hidden />
          )}
          <div className="ilan-card__badges">
            <span className={`ilan-card__mode-badge ilan-card__mode-badge--${modeBadge.tone}`}>{modeBadge.label}</span>
            {citizenshipEligible ? (
              <span className="ilan-card__mode-badge ilan-card__mode-badge--sale">400K+ Citizen</span>
            ) : null}
            {live ? (
              <span className="ilan-card__live">
                <i /> LIVE
              </span>
            ) : null}
          </div>
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
            aria-label={isFavorite(property.id) ? "Favorilerden çıkar" : "Favorilere ekle"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite(property.id) ? "fill-current text-rose-400" : ""}`} />
          </button>
        </div>

        <p className="ilan-card__location">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {location || "Konum belirtilmedi"}
        </p>

        <p className="ilan-card__price">
          {price != null ? formatFromTry(price) : "Fiyat sorunuz"}
          {property.dealType === "rent" ? <small>/ ay</small> : null}
        </p>
        <p className="flex items-center gap-1 text-xs text-emerald-300">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          Doğrulanmış satıcı · {seller.completedDeals} işlem
        </p>
        <p className="flex items-center gap-1 text-xs text-cyan-200">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Doğrulanmış mülk · {property.marketingMode === "auction" ? "Çift taraflı teminat" : "KYC + mülk doğrulama"}
        </p>
        <div className="ilan-card__auction-line">
          <span>
            {property.marketingMode === "auction"
              ? `Güncel teklif: ${currentBid > 0 ? formatFromTry(currentBid) : "—"}`
              : `İlan fiyatı: ${price != null ? formatFromTry(price) : "—"}`}
          </span>
          {property.marketingMode === "auction" ? (
            <span className={positive ? "ilan-card__change is-up" : "ilan-card__change is-down"}>
              {positive ? "+" : ""}
              %{changePct.toFixed(2)}
            </span>
          ) : (
            <span className="ilan-card__change">Sabit fiyat</span>
          )}
        </div>

        <div className="ilan-card__meta">
          {property.grossSqm ? <span>{property.grossSqm} m²</span> : null}
          {property.roomCount ? <span>{property.roomCount}</span> : null}
          {property.marketingMode === "auction" ? (
            <span className="ilan-card__remaining">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {remainingText}
            </span>
          ) : null}
        </div>
        <div className="ilan-card__actions">
          {property.dealType !== "rent" && property.buyNowPriceTry != null ? (
            <Link to={`/ilanlar/${property.id}`} className="ilan-card__buy-now">
              Hemen Al
            </Link>
          ) : null}
          <Link to={`/ilanlar/${property.id}`} className="ilan-card__watch">
            İzle
          </Link>
          <button
            type="button"
            className="ilan-card__watch"
            aria-label={has(property.id) ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
            onClick={() => toggle(property.id)}
            disabled={!has(property.id) && isFull}
          >
            <GitCompare className="mr-1 h-3.5 w-3.5" aria-hidden />
            {has(property.id) ? "Seçildi" : "Karşılaştır"}
          </button>
          <Link to={`/emlakci/${seller.slug}`} className="ilan-card__watch" aria-label="Satıcı profilini aç">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden />
            Satıcı Profili
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PropertyListingCard;

/**
 * JSON-LD structured data — Googlebot için sayfa-bazlı schema.org enjeksiyonu.
 * SPA: sosyal botlar JS çalıştırmaz; ama Google bunu işler (Mobile-Friendly + rich results).
 *
 * Kullanim:
 *   useEffect(() => injectJsonLd("listing-123", payload), [...]);
 *   return () => removeJsonLd("listing-123");
 */

import { SITE_ORIGIN } from "@/data/siteOrigin";

const JSONLD_ATTR = "data-ihaleal-jsonld";

export function injectJsonLd(id: string, payload: Record<string, unknown>): void {
  if (typeof document === "undefined") return;
  // Aynı id varsa kaldır (idempotent)
  removeJsonLd(id);
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute(JSONLD_ATTR, id);
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
}

export function removeJsonLd(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.querySelector(`script[${JSONLD_ATTR}="${id}"]`);
  if (el) el.remove();
}

/** /ilan/:id için RealEstateListing payload üretici. */
export function buildAuctionListingJsonLd(input: {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string;
  priceTRY: number;
  image?: string;
  category?: string;
}): Record<string, unknown> {
  const url = `${SITE_ORIGIN}/ilan/${input.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    name: input.title,
    description: input.description,
    url,
    image: input.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.district,
      addressRegion: input.city,
      addressCountry: "TR",
    },
    offers: {
      "@type": "Offer",
      price: input.priceTRY,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      url,
    },
    category: input.category,
  };
}

/** /proje/:id (lansman) için Residence + Offer payload. */
export function buildProjectJsonLd(input: {
  id: string;
  projectName: string;
  description: string;
  city: string;
  district: string;
  unitCount: number;
  available: number;
}): Record<string, unknown> {
  const url = `${SITE_ORIGIN}/proje/${input.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    "@id": url,
    name: input.projectName,
    description: input.description,
    url,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.district,
      addressRegion: input.city,
      addressCountry: "TR",
    },
    numberOfRooms: input.unitCount,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Mevcut birim", value: input.available },
      { "@type": "PropertyValue", name: "Toplam birim", value: input.unitCount },
    ],
  };
}

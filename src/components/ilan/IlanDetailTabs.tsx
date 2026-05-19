import { useState } from "react";
import { Link } from "react-router-dom";
import type { PropertyRecord } from "@/types/property";
import { formatTry } from "@/lib/valuation/valuationEngine";

export interface IlanTypeExtras {
  otel: boolean;
  fabrika: boolean;
  tarla: boolean;
  ges: boolean;
  villa: boolean;
}

export interface IlanDetailTabsProps {
  property: PropertyRecord;
  typeExtras: IlanTypeExtras;
}

type TabKey =
  | "GENEL"
  | "YAPI"
  | "AFET"
  | "ALTYAPI"
  | "CEVRE"
  | "SOSYAL"
  | "MALI"
  | "HUKUKI"
  | "AI"
  | "GALERI"
  | "EKSPERTIZ"
  | "TEKLIFLER";

const TABS: TabKey[] = [
  "GENEL",
  "YAPI",
  "AFET",
  "ALTYAPI",
  "CEVRE",
  "SOSYAL",
  "MALI",
  "HUKUKI",
  "AI",
  "GALERI",
  "EKSPERTIZ",
  "TEKLIFLER",
];

type Row = { label: string; value: string };

function fmtBool(v: boolean | undefined): string | undefined {
  if (v == null) return undefined;
  return v ? "Evet" : "Hayır";
}

function fmtNum(v: number | undefined, suffix = ""): string | undefined {
  if (v == null || Number.isNaN(v)) return undefined;
  return `${v.toLocaleString("tr-TR")}${suffix}`;
}

function fmtMoney(v: number | undefined): string | undefined {
  if (v == null) return undefined;
  return formatTry(v);
}

function fmtList(v: string[] | undefined): string | undefined {
  if (!v?.length) return undefined;
  return v.join(", ");
}

function detailVal(details: Record<string, unknown>, key: string): unknown {
  return details[key];
}

function detailStr(details: Record<string, unknown>, key: string): string | undefined {
  const v = detailVal(details, key);
  if (v == null || v === "") return undefined;
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (typeof v === "number") return v.toLocaleString("tr-TR");
  return String(v);
}

function buildRows(property: PropertyRecord, tab: TabKey, typeExtras: IlanTypeExtras): Row[] {
  const d = (property.details ?? {}) as Record<string, unknown>;
  const rows: Row[] = [];

  const push = (label: string, value: string | undefined) => {
    if (value != null && value !== "") rows.push({ label, value });
  };

  switch (tab) {
    case "GENEL":
      push("İlan no", property.listingNumber);
      push("Başlık", property.title);
      push("Kısa açıklama", property.shortDescription);
      push("Açıklama", property.description);
      push("Durum", property.status);
      push("Şehir", property.city);
      push("İlçe", property.district);
      push("Mahalle", property.neighborhood);
      push("Adres", property.address);
      push("Brüt m²", fmtNum(property.grossSqm, " m²"));
      push("Net m²", fmtNum(property.netSqm, " m²"));
      push("Arsa m²", fmtNum(property.landSqm, " m²"));
      push("Oda", property.roomCount);
      push("İşlem tipi", property.dealType === "rent" ? "Kiralık" : property.dealType === "transfer" ? "Devren" : "Satılık");
      if (typeExtras.villa) {
        push("Bahçe m²", fmtNum(property.gardenSqm, " m²"));
        push("Teras m²", fmtNum(property.terraceSqm, " m²"));
        push("Havuz", fmtBool(property.pool));
      }
      if (typeExtras.otel) {
        push("Doluluk oranı", detailStr(d, "occupancyRate") ? `%${detailStr(d, "occupancyRate")}` : undefined);
        push("Oda sayısı", detailStr(d, "roomCount"));
        push("Yıldız", detailStr(d, "starRating"));
        push("Marka", detailStr(d, "brandName"));
      }
      break;

    case "YAPI":
      push("Bina tipi", property.buildingType);
      push("Yapı tipi", property.constructionType);
      push("Isıtma", property.heatingType);
      push("Soğutma", property.coolingType);
      push("Kat", property.floor);
      push("Toplam kat", fmtNum(property.totalFloors));
      push("Bina yaşı", property.buildingAge);
      push("Asansör", fmtBool(property.elevator));
      push("Otopark", fmtBool(property.parking));
      push("Otopark adedi", fmtNum(property.parkingSpots));
      push("Balkon", fmtBool(property.balcony));
      push("Eşyalı", fmtBool(property.furnished));
      push("Kullanım durumu", property.usageStatus);
      if (typeExtras.fabrika) {
        push("Üretim alanı", detailStr(d, "productionSqm") ? `${detailStr(d, "productionSqm")} m²` : undefined);
        push("Ofis alanı", detailStr(d, "officeSqm") ? `${detailStr(d, "officeSqm")} m²` : undefined);
        push("Vinç kapasitesi", detailStr(d, "craneCapacityTon") ? `${detailStr(d, "craneCapacityTon")} ton` : undefined);
        push("OSB bölgesi", detailStr(d, "osbZone"));
      }
      if (typeExtras.tarla) {
        push("Toprak sınıfı", detailStr(d, "soilClass"));
        push("Ürün tipi", detailStr(d, "cropType"));
        push("Sulama", detailStr(d, "irrigation"));
        push("Su kaynağı", detailStr(d, "waterSource"));
        push("İmar notu", detailStr(d, "imarDurumu") ?? detailStr(d, "zoningNote"));
      }
      break;

    case "AFET":
      push("Deprem risk bölgesi", property.earthquakeRiskZone);
      push("Deprem sınıfı", property.earthquakeClass);
      push("Sel riski", fmtBool(property.floodRisk));
      push("Heyelan riski", fmtBool(property.landslideRisk));
      push("Yangın bölmesi", fmtBool(property.fireCompartment));
      push("Acil çıkış", fmtBool(property.emergencyExit));
      push("Sprinkler", fmtBool(property.sprinklerSystem));
      push("Afet sigortası", fmtBool(property.disasterInsurance));
      break;

    case "ALTYAPI":
      push("Elektrik", fmtBool(property.electricity));
      push("Üç faz", fmtBool(property.threePhasePower));
      push("Güç (kVA)", fmtNum(property.powerKva, " kVA"));
      push("Doğalgaz", fmtBool(property.naturalGas));
      push("Su", fmtBool(property.water));
      push("Kanalizasyon", fmtBool(property.sewage));
      push("Fiber internet", fmtBool(property.fiberInternet));
      push("Jeneratör", fmtBool(property.generator));
      push("Güneş hazır", fmtBool(property.solarReady));
      push("Yükleme rampası", fmtBool(property.loadingDock));
      push("Tır erişimi", fmtBool(property.truckAccess));
      if (typeExtras.ges) {
        push("Kurulu güç", detailStr(d, "installedCapacityMw") ? `${detailStr(d, "installedCapacityMw")} MW` : undefined);
        push("Panel adedi", detailStr(d, "panelCount"));
        push("Yıllık üretim", detailStr(d, "annualProductionMwh") ? `${detailStr(d, "annualProductionMwh")} MWh` : undefined);
        push("Şebeke bağlantısı", detailStr(d, "gridConnection"));
        push("PPA imzalı", detailStr(d, "ppaSigned"));
        push("Feed-in tarife", detailStr(d, "feedInTariff"));
      }
      break;

    case "CEVRE":
      push("Deniz manzarası", fmtBool(property.seaView));
      push("Şehir manzarası", fmtBool(property.cityView));
      push("Orman manzarası", fmtBool(property.forestView));
      push("Yeşil alan oranı", fmtNum(property.greenAreaRatio, "%"));
      push("Gürültü seviyesi", property.noiseLevel);
      push("Hava kalitesi", fmtNum(property.airQualityIndex));
      push("LEED", property.leedLevel);
      push("BREEAM", property.breeamLevel);
      break;

    case "SOSYAL":
      push("Site adı", property.siteName);
      push("Aidat", fmtMoney(property.siteFeeTry));
      push("7/24 güvenlik", fmtBool(property.security24h));
      push("Concierge", fmtBool(property.concierge));
      push("Havuz", fmtBool(property.pool));
      push("Spor salonu", fmtBool(property.gym));
      push("Oyun alanı", fmtBool(property.playground));
      push("Sosyal tesisler", fmtList(property.socialFacilities));
      push("Yakın okullar", fmtList(property.nearbySchools));
      push("Yakın hastaneler", fmtList(property.nearbyHospitals));
      push("Ulaşım", fmtList(property.nearbyTransport));
      break;

    case "MALI":
      push("Pazarlama modu", property.marketingMode);
      push("Satış fiyatı", fmtMoney(property.priceTry));
      push("Kira", fmtMoney(property.rentTry));
      push("Depozito", fmtMoney(property.depositTry));
      push("Aidat", fmtMoney(property.duesTry));
      push("m² fiyatı", fmtMoney(property.pricePerSqmTry));
      push("Başlangıç teklifi", fmtMoney(property.startingBidTry));
      push("Cari teklif", fmtMoney(property.currentBidTry));
      push("Hemen al", fmtMoney(property.buyNowPriceTry));
      push("Pazarlık", fmtBool(property.negotiable));
      if (typeExtras.otel) {
        push("Yıllık ciro", fmtMoney(detailVal(d, "annualRevenueTry") as number | undefined));
        push("EBITDA", fmtMoney(detailVal(d, "ebitdaTry") as number | undefined));
      }
      if (typeExtras.fabrika) {
        push("Yıllık kira geliri", fmtMoney(detailVal(d, "annualRentTry") as number | undefined));
      }
      break;

    case "HUKUKI":
      push("Tapu tipi", property.titleDeedType);
      push("Tapu durumu", property.tapuDurumu);
      push("İskan", fmtBool(property.occupancyPermit));
      push("İmar durumu", property.zoningStatus);
      push("Şerh / irtifak", fmtBool(property.easement));
      push("İpotek", fmtBool(property.mortgage));
      push("Haciz", fmtBool(property.lien));
      push("Hisseli tapu", fmtBool(property.sharedOwnership));
      push("Kat irtifakı", fmtBool(property.katIrtifaki));
      push("Krediye uygun", fmtBool(property.eligibleForCredit));
      push("Ada", property.ada);
      push("Pafta", property.pafta);
      push("Parsel", property.parcelNo);
      break;

    case "AI":
      push("AI tahmini fiyat", fmtMoney(property.aiPredictedPriceTry));
      push("Güven skoru", property.aiConfidence != null ? `%${Math.round(property.aiConfidence * 100)}` : undefined);
      push("Yatırım skoru", fmtNum(property.aiInvestmentScore));
      push("AI m² fiyatı", fmtMoney(property.aiPricePerSqm));
      push("AI özet", property.aiSummary);
      push("Etiketler", fmtList(property.aiTags));
      push("Risk bayrakları", fmtList(property.aiRiskFlags));
      break;

    case "GALERI":
      push("Hero görsel", property.heroImage);
      push("Video", property.videoUrl);
      push("Sanal tur", property.virtualTourUrl);
      push("Drone video", property.droneVideoUrl);
      if (property.images?.length) {
        property.images.forEach((src, i) => push(`Görsel ${i + 1}`, src));
      }
      if (property.floorPlanUrls?.length) {
        property.floorPlanUrls.forEach((src, i) => push(`Kat planı ${i + 1}`, src));
      }
      break;

    case "EKSPERTIZ":
      push("Ekspertiz gerekli", fmtBool(property.expertiseRequired));
      push("Ekspertiz tarihi", property.expertiseDate);
      push("Ekspertiz değeri", fmtMoney(property.expertiseValueTry));
      push("Eksper", property.appraiserName);
      push("SPK lisans no", property.spkLicenseNo);
      push("Ekspertiz PDF", property.expertisePdfUrl);
      push("Piyasa raporu", property.marketReportPdfUrl);
      break;

    case "TEKLIFLER": {
      const bids = d.bids as Array<{ amountTry?: number; bidder?: string; at?: string }> | undefined;
      if (bids?.length) {
        bids.forEach((bid, i) => {
          const parts = [
            bid.amountTry != null ? formatTry(bid.amountTry) : null,
            bid.bidder,
            bid.at,
          ].filter(Boolean);
          push(`Teklif ${i + 1}`, parts.join(" · ") || "—");
        });
      }
      push("Teklif sayısı", fmtNum(property.bidCount));
      push("Kapalı teklif", d.sealedOffers ? "Mevcut" : undefined);
      push("Takas uygun", detailStr(d, "tradeEligible"));
      break;
    }
  }

  return rows;
}

function TabPanel({
  tab,
  property,
  typeExtras,
}: {
  tab: TabKey;
  property: PropertyRecord;
  typeExtras: IlanTypeExtras;
}) {
  const rows = buildRows(property, tab, typeExtras);

  if (rows.length === 0) {
    return (
      <div className="ilan-tabs__empty">
        <p>Bu ilan için bu bilgi henüz eklenmedi.</p>
        <Link to="/destek">Destek ile iletişime geçin →</Link>
      </div>
    );
  }

  if (tab === "GALERI") {
    const images = property.images?.length
      ? property.images
      : property.heroImage
        ? [property.heroImage]
        : [];

    return (
      <div className="ilan-tabs__panel">
        {images.length > 0 ? (
          <div className="ilan-tabs__gallery-grid">
            {images.map((src) => (
              <figure key={src} className="ilan-tabs__gallery-item">
                <img src={src} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
        ) : null}
        <table className="ilan-tabs__table">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="ilan-tabs__panel">
      <table className="ilan-tabs__table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IlanDetailTabs({ property, typeExtras }: IlanDetailTabsProps) {
  const [active, setActive] = useState<TabKey>("GENEL");

  return (
    <section className="ilan-tabs" aria-label="İlan detay sekmeleri">
      <div className="ilan-tabs__nav-wrap">
        <div className="ilan-tabs__nav" role="tablist" aria-label="Detay sekmeleri">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`ilan-tab-${tab}`}
              aria-selected={active === tab}
              aria-controls={`ilan-panel-${tab}`}
              className={active === tab ? "ilan-tabs__tab is-active" : "ilan-tabs__tab"}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {TABS.map((tab) => (
        <div
          key={tab}
          id={`ilan-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`ilan-tab-${tab}`}
          hidden={active !== tab}
          className="ilan-tabs__content"
        >
          {active === tab ? <TabPanel tab={tab} property={property} typeExtras={typeExtras} /> : null}
        </div>
      ))}
    </section>
  );
}

export default IlanDetailTabs;

import provincesJson from "@/data/trGeoProvinces.json";

export type DealSlug = "satilik" | "kiralik";
export type PropertyTypeSlug = "konut" | "daire" | "arsa" | "villa" | "isyeri" | "dukkan";

export type TrDistrict = { name: string; slug: string };
export type TrProvince = { name: string; slug: string; districts: TrDistrict[] };

export const TR_PROVINCES = provincesJson as TrProvince[];

export const PROPERTY_TYPE_SLUGS: PropertyTypeSlug[] = [
  "konut",
  "daire",
  "arsa",
  "villa",
  "isyeri",
  "dukkan",
];

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeSlug, string> = {
  konut: "Konut",
  daire: "Daire",
  arsa: "Arsa",
  villa: "Villa",
  isyeri: "İş yeri",
  dukkan: "Dükkan",
};

export type ProgrammaticSeoRoute = {
  path: string;
  deal: DealSlug;
  provinceSlug: string;
  provinceName: string;
  districtSlug?: string;
  districtName?: string;
  propertyType?: PropertyTypeSlug;
  segmentKind: "city" | "district" | "type" | "district-type";
};

export function slugifyTr(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findProvince(slug: string): TrProvince | undefined {
  return TR_PROVINCES.find((p) => p.slug === slug);
}

export function findDistrict(province: TrProvince, slug: string): TrDistrict | undefined {
  return province.districts.find((d) => d.slug === slug);
}

export function isPropertyTypeSlug(value: string): value is PropertyTypeSlug {
  return (PROPERTY_TYPE_SLUGS as string[]).includes(value);
}

export function buildProgrammaticSeoRoutes(): ProgrammaticSeoRoute[] {
  const routes: ProgrammaticSeoRoute[] = [];
  const deals: DealSlug[] = ["satilik", "kiralik"];

  for (const province of TR_PROVINCES) {
    for (const deal of deals) {
      routes.push({
        path: `/${deal}/${province.slug}`,
        deal,
        provinceSlug: province.slug,
        provinceName: province.name,
        segmentKind: "city",
      });

      for (const type of PROPERTY_TYPE_SLUGS) {
        routes.push({
          path: `/${deal}/${province.slug}/${type}`,
          deal,
          provinceSlug: province.slug,
          provinceName: province.name,
          propertyType: type,
          segmentKind: "type",
        });
      }

      for (const district of province.districts) {
        routes.push({
          path: `/${deal}/${province.slug}/${district.slug}`,
          deal,
          provinceSlug: province.slug,
          provinceName: province.name,
          districtSlug: district.slug,
          districtName: district.name,
          segmentKind: "district",
        });

        for (const type of PROPERTY_TYPE_SLUGS) {
          routes.push({
            path: `/${deal}/${province.slug}/${district.slug}/${type}`,
            deal,
            provinceSlug: province.slug,
            provinceName: province.name,
            districtSlug: district.slug,
            districtName: district.name,
            propertyType: type,
            segmentKind: "district-type",
          });
        }
      }
    }
  }

  return routes;
}

export function resolveProgrammaticRoute(
  deal: string,
  provinceSlug: string,
  segment?: string,
  typeSegment?: string,
): ProgrammaticSeoRoute | null {
  if (deal !== "satilik" && deal !== "kiralik") return null;
  const province = findProvince(provinceSlug);
  if (!province) return null;

  if (!segment) {
    return {
      path: `/${deal}/${province.slug}`,
      deal,
      provinceSlug: province.slug,
      provinceName: province.name,
      segmentKind: "city",
    };
  }

  if (typeSegment && isPropertyTypeSlug(typeSegment)) {
    const district = findDistrict(province, segment);
    if (!district) return null;
    return {
      path: `/${deal}/${province.slug}/${district.slug}/${typeSegment}`,
      deal,
      provinceSlug: province.slug,
      provinceName: province.name,
      districtSlug: district.slug,
      districtName: district.name,
      propertyType: typeSegment,
      segmentKind: "district-type",
    };
  }

  if (isPropertyTypeSlug(segment)) {
    return {
      path: `/${deal}/${province.slug}/${segment}`,
      deal,
      provinceSlug: province.slug,
      provinceName: province.name,
      propertyType: segment,
      segmentKind: "type",
    };
  }

  const district = findDistrict(province, segment);
  if (!district) return null;

  return {
    path: `/${deal}/${province.slug}/${district.slug}`,
    deal,
    provinceSlug: province.slug,
    provinceName: province.name,
    districtSlug: district.slug,
    districtName: district.name,
    segmentKind: "district",
  };
}

export function dealLabel(deal: DealSlug): string {
  return deal === "kiralik" ? "Kiralık" : "Satılık";
}

export function buildSeoTitle(route: ProgrammaticSeoRoute): string {
  const deal = dealLabel(route.deal);
  if (route.segmentKind === "district-type" && route.propertyType && route.districtName) {
    return `${deal} ${PROPERTY_TYPE_LABELS[route.propertyType]} — ${route.districtName}, ${route.provinceName} | ihaleal.com`;
  }
  if (route.segmentKind === "type" && route.propertyType) {
    return `${deal} ${PROPERTY_TYPE_LABELS[route.propertyType]} — ${route.provinceName} | ihaleal.com`;
  }
  if (route.segmentKind === "district" && route.districtName) {
    return `${deal} ${route.districtName}, ${route.provinceName} | ihaleal.com`;
  }
  return `${deal} ${route.provinceName} gayrimenkul ilanları | ihaleal.com`;
}

export function buildSeoDescription(route: ProgrammaticSeoRoute): string {
  const deal = dealLabel(route.deal).toLowerCase();
  const place =
    route.segmentKind === "district-type" && route.districtName && route.propertyType
      ? `${route.districtName} ${PROPERTY_TYPE_LABELS[route.propertyType].toLowerCase()}, ${route.provinceName}`
      : route.segmentKind === "district" && route.districtName
      ? `${route.districtName}, ${route.provinceName}`
      : route.segmentKind === "type" && route.propertyType
        ? `${route.provinceName} ${PROPERTY_TYPE_LABELS[route.propertyType].toLowerCase()}`
        : route.provinceName;
  return `${place} bölgesinde ${deal} gayrimenkul ilanları, borsa fiyat endeksi ve mahalle özeti — ihaleal.com.`;
}

export function buildRegionDescription(route: ProgrammaticSeoRoute): string {
  const deal = dealLabel(route.deal).toLowerCase();
  const focus =
    route.segmentKind === "district-type" && route.districtName
      ? `${route.districtName} (${route.provinceName})`
      : route.segmentKind === "district" && route.districtName
        ? `${route.districtName} (${route.provinceName})`
        : route.provinceName;
  const typePart =
    (route.segmentKind === "type" || route.segmentKind === "district-type") && route.propertyType
      ? ` ${PROPERTY_TYPE_LABELS[route.propertyType].toLowerCase()} segmentinde`
      : "";
  return `${focus}${typePart} ${deal} portföyü; platform ilanları, İhaleal Endeksi bölge sinyalleri ve filtrelenmiş arama ile güncel fırsatları keşfedin.`;
}

export const PROGRAMMATIC_SEO_ROUTES = buildProgrammaticSeoRoutes();

export function programmaticSeoPageCount(): number {
  return PROGRAMMATIC_SEO_ROUTES.length;
}

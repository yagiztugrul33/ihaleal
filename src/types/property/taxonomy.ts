/** Property taxonomy: 14 main categories. */

export const CATEGORY_KEYS = [
  "konut",
  "ticari",
  "endustri",
  "konaklama",
  "arsa",
  "komple",
  "altyapi",
  "devren",
  "yatirim",
  "surdurulebilir",
  "tarihi",
  "ihtisas",
  "su_ustu",
  "ozel",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export interface TypeMeta {
  key: string;
  labelTR: string;
  labelEN: string;
  i18nKey: string;
}

export interface SubCategoryMeta {
  key: string;
  labelTR: string;
  labelEN: string;
  i18nKey: string;
  types: TypeMeta[];
}

export interface CategoryMeta {
  key: CategoryKey;
  labelTR: string;
  labelEN: string;
  i18nKey: string;
  iconKey: string;
  subcategories: SubCategoryMeta[];
}

function sub(
  key: string,
  labelTR: string,
  labelEN: string,
  types: Array<{ key: string; labelTR: string; labelEN: string }>
): SubCategoryMeta {
  const base = `property.sub.${key}`;
  return {
    key,
    labelTR,
    labelEN,
    i18nKey: base,
    types: types.map((t) => ({
      ...t,
      i18nKey: `${base}.type.${t.key}`,
    })),
  };
}

function cat(
  key: CategoryKey,
  labelTR: string,
  labelEN: string,
  iconKey: string,
  subcategories: SubCategoryMeta[]
): CategoryMeta {
  return {
    key,
    labelTR,
    labelEN,
    i18nKey: `property.category.${key}`,
    iconKey,
    subcategories,
  };
}

export const TAXONOMY: Record<CategoryKey, CategoryMeta> = {
  konut: cat("konut", "Konut", "Residential", "home", [
    sub("daire", "Daire", "Apartment", [
      { key: "apartman", labelTR: "Apartman Dairesi", labelEN: "Apartment Unit" },
      { key: "site", labelTR: "Site İçi Daire", labelEN: "Gated Community Unit" },
    ]),
    sub("villa", "Villa", "Villa", [
      { key: "mustakil", labelTR: "Müstakil Villa", labelEN: "Detached Villa" },
      { key: "ikiz", labelTR: "İkiz Villa", labelEN: "Semi-Detached Villa" },
    ]),
  ]),

  ticari: cat("ticari", "Ticari", "Commercial", "building-2", [
    sub("ofis", "Ofis", "Office", [
      { key: "a_sinif", labelTR: "A Sınıfı Ofis", labelEN: "Class A Office" },
      { key: "plaza_ofis", labelTR: "Plaza Ofisi", labelEN: "Plaza Office" },
    ]),
    sub("magaza", "Mağaza", "Retail", [
      { key: "cadde", labelTR: "Cadde Mağazası", labelEN: "High Street Retail" },
    ]),
    sub("avm", "AVM", "Shopping Mall", [
      { key: "unite", labelTR: "AVM Ünitesi", labelEN: "Mall Unit" },
    ]),
  ]),

  endustri: cat("endustri", "Endüstri", "Industrial", "factory", [
    sub("fabrika", "Fabrika", "Factory", [
      { key: "uretim", labelTR: "Üretim Fabrikası", labelEN: "Manufacturing Plant" },
      { key: "montaj", labelTR: "Montaj Tesisi", labelEN: "Assembly Facility" },
    ]),
    sub("depo", "Depo", "Warehouse", [
      { key: "lojistik", labelTR: "Lojistik Depo", labelEN: "Logistics Warehouse" },
    ]),
    sub("atolye", "Atölye", "Workshop", [
      { key: "imalat", labelTR: "İmalat Atölyesi", labelEN: "Manufacturing Workshop" },
    ]),
  ]),

  konaklama: cat("konaklama", "Konaklama", "Hospitality", "bed-double", [
    sub("otel", "Otel", "Hotel", [
      { key: "butik", labelTR: "Butik Otel", labelEN: "Boutique Hotel" },
      { key: "resort", labelTR: "Resort Otel", labelEN: "Resort Hotel" },
    ]),
    sub("apart_otel", "Apart Otel", "Apart Hotel", [
      { key: "suit", labelTR: "Suit", labelEN: "Suite" },
    ]),
  ]),

  arsa: cat("arsa", "Arsa / Arazi", "Land / Plot", "map-pin", [
    sub("konut_imari", "Konut İmarlı", "Residential Zoned", [
      { key: "parsel", labelTR: "Konut Parseli", labelEN: "Residential Plot" },
    ]),
    sub("ticari_imari", "Ticari İmarlı", "Commercial Zoned", [
      { key: "parsel", labelTR: "Ticari Parsel", labelEN: "Commercial Plot" },
    ]),
    sub("tarla", "Tarla", "Agricultural Field", [
      { key: "sulama", labelTR: "Sulama Tarlası", labelEN: "Irrigated Field" },
      { key: "kuru", labelTR: "Kuru Tarla", labelEN: "Dry Field" },
    ]),
  ]),

  komple: cat("komple", "Komple Bina / Site", "Whole Building / Complex", "layers", [
    sub("bina", "Komple Bina", "Whole Building", [
      { key: "komple_bina", labelTR: "Komple Bina", labelEN: "Whole Building" },
    ]),
    sub("site", "Site", "Gated Community", [
      { key: "konut_sitesi", labelTR: "Konut Sitesi", labelEN: "Residential Complex" },
    ]),
    sub("plaza", "Plaza", "Plaza", [
      { key: "ticari_plaza", labelTR: "Ticari Plaza", labelEN: "Commercial Plaza" },
    ]),
  ]),

  altyapi: cat("altyapi", "Altyapı / Enerji", "Infrastructure / Energy", "zap", [
    sub("ges", "GES", "Solar PV", [
      { key: "arazi", labelTR: "Arazi GES", labelEN: "Ground-Mount Solar" },
      { key: "cati", labelTR: "Çatı GES", labelEN: "Rooftop Solar" },
    ]),
    sub("res", "RES", "Wind Power", [
      { key: "ruzgar", labelTR: "Rüzgar Santrali", labelEN: "Wind Farm" },
    ]),
  ]),

  devren: cat("devren", "Devren", "Business Transfer", "repeat", [
    sub("isletme", "İşletme", "Operating Business", [
      { key: "restoran", labelTR: "Restoran", labelEN: "Restaurant" },
      { key: "cafe", labelTR: "Kafe / Bar", labelEN: "Cafe / Bar" },
    ]),
  ]),

  yatirim: cat("yatirim", "Yatırım", "Investment", "trending-up", [
    sub("proje", "Proje", "Development Project", [
      { key: "gelistirme", labelTR: "Geliştirme Projesi", labelEN: "Development Project" },
    ]),
    sub("fon", "Fon", "Fund", [
      { key: "gayrimenkul", labelTR: "Gayrimenkul Fonu", labelEN: "Real Estate Fund" },
    ]),
    sub("tokenize", "Tokenize", "Tokenized", [
      { key: "fraksiyonel", labelTR: "Fraksiyonel Pay", labelEN: "Fractional Share" },
    ]),
  ]),

  surdurulebilir: cat("surdurulebilir", "Sürdürülebilir", "Sustainable", "leaf", [
    sub("yesil_bina", "Yeşil Bina", "Green Building", [
      { key: "leed", labelTR: "LEED Sertifikalı", labelEN: "LEED Certified" },
      { key: "breeam", labelTR: "BREEAM Sertifikalı", labelEN: "BREEAM Certified" },
    ]),
    sub("sifir_enerji", "Sıfır Enerji", "Net Zero", [
      { key: "pasif", labelTR: "Pasif Ev", labelEN: "Passive House" },
    ]),
  ]),

  tarihi: cat("tarihi", "Tarihi", "Historic", "landmark", [
    sub("konut", "Tarihi Konut", "Historic Residential", [
      { key: "osmanli", labelTR: "Osmanlı Konutu", labelEN: "Ottoman Era Home" },
    ]),
    sub("ticari", "Tarihi Ticari", "Historic Commercial", [
      { key: "han", labelTR: "Han / Çarşı", labelEN: "Caravanserai / Bazaar" },
    ]),
  ]),

  ihtisas: cat("ihtisas", "İhtisas", "Specialized", "stethoscope", [
    sub("saglik", "Sağlık", "Healthcare", [
      { key: "hastane", labelTR: "Hastane", labelEN: "Hospital" },
    ]),
    sub("egitim", "Eğitim", "Education", [
      { key: "okul", labelTR: "Okul", labelEN: "School" },
    ]),
    sub("spor", "Spor", "Sports", [
      { key: "salon", labelTR: "Spor Salonu", labelEN: "Gym / Sports Hall" },
    ]),
  ]),

  su_ustu: cat("su_ustu", "Su Üstü", "Waterfront / Marine", "anchor", [
    sub("marina", "Marina", "Marina", [
      { key: "kot", labelTR: "Kot / Bağlama", labelEN: "Berth / Mooring" },
    ]),
    sub("ada", "Ada", "Island", [
      { key: "ozel", labelTR: "Özel Ada", labelEN: "Private Island" },
    ]),
  ]),

  ozel: cat("ozel", "Özel", "Private / Exclusive", "shield", [
    sub("malikane", "Malikane", "Estate", [
      { key: "konut", labelTR: "Özel Konut", labelEN: "Private Residence" },
    ]),
    sub("koruma", "Koruma Alanı", "Protected Area", [
      { key: "sit", labelTR: "Sit Alanı", labelEN: "Protected Site" },
    ]),
  ]),
};

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value);
}

export function isSubCategoryKey(category: CategoryKey, sub: string): boolean {
  return TAXONOMY[category].subcategories.some((s) => s.key === sub);
}

export function getCategory(key: CategoryKey): CategoryMeta {
  return TAXONOMY[key];
}

/** Leaf route paths: category/sub/type (~40 entries for listing routes). */
export function listCategoryPaths(): string[] {
  const paths: string[] = [];
  for (const categoryKey of CATEGORY_KEYS) {
    const category = TAXONOMY[categoryKey];
    for (const subCat of category.subcategories) {
      for (const type of subCat.types) {
        paths.push(`${categoryKey}/${subCat.key}/${type.key}`);
      }
    }
  }
  return paths;
}

export function getTypeMeta(
  category: CategoryKey,
  sub: string,
  type: string
): TypeMeta | undefined {
  const subMeta = TAXONOMY[category].subcategories.find((s) => s.key === sub);
  return subMeta?.types.find((t) => t.key === type);
}

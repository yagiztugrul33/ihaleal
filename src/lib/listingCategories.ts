/**
 * Gayrimenkul türü UI etiketi ↔ DB category slug eşlemesi.
 * Tek kaynak: hem CreateAuction.tsx (yazma) hem remoteAuctionsMapper.ts (okuma)
 * bundan türetir — iki yerde ayrı ayrı tutulursa gerçek ilanların kategorisi
 * emsal/arama eşleşmesinde sessizce yanlış görünür.
 */
export const CATEGORY_UI_TO_DB: Record<string, string> = {
  Konut: "real_estate_residential",
  Ticari: "real_estate_commercial",
  Arsa: "real_estate_land",
  Villa: "real_estate_residential",
};

/** DB slug'ından kanonik UI etiketine (Villa/Konut ayrımı DB'de tutulmadığı için Konut'a döner). */
export const CATEGORY_DB_TO_UI: Record<string, string> = {
  real_estate_residential: "Konut",
  real_estate_commercial: "Ticari",
  real_estate_land: "Arsa",
};

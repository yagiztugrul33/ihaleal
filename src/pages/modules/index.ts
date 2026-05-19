export { ModuleShell, ModulePanel, ModuleStatGrid, ModuleDataTable, ModulePdfCta, ModuleTag } from "./ModuleShell";
export type { ModuleShellProps, StatItem, ModuleTableColumn } from "./ModuleShell";

export { default as ParselZekasiPage } from "./ParselZekasiPage";
export { default as GesAnaliziModulPage } from "./GesAnaliziModulPage";
export { default as DegerlemeModulPage } from "./DegerlemeModulPage";
export { default as AirbnbPotansiyelPage } from "./AirbnbPotansiyelPage";
export { default as RenovasyonRoiPage } from "./RenovasyonRoiPage";
export { default as AfetRiskHaritasiPage } from "./AfetRiskHaritasiPage";
export { default as DepremRiskHaritasiPage } from "./DepremRiskHaritasiPage";
export { default as BinaRiskSorguPage } from "./BinaRiskSorguPage";
export { default as CanliDepremTakipPage } from "./CanliDepremTakipPage";
export { default as AileAcilPlanPage } from "./AileAcilPlanPage";
export { default as GuclendirmeRehberiPage } from "./GuclendirmeRehberiPage";
export { default as ImarSorguPage } from "./ImarSorguPage";
export { default as YatirimOnerisiPage } from "./YatirimOnerisiPage";
export { default as PortfoyYonetimiModulPage } from "./PortfoyYonetimiModulPage";
export { default as SigortaPazaryeriPage } from "./SigortaPazaryeriPage";
export { default as KrediPazaryeriPage } from "./KrediPazaryeriPage";
export { default as KentselDonusumPage } from "./KentselDonusumPage";
export { default as AfetToplanmaAlanlariPage } from "./AfetToplanmaAlanlariPage";
export { default as DepremCantasiPage } from "./DepremCantasiPage";
export { default as DepremSigortasiPage } from "./DepremSigortasiPage";
export { default as KomsulukRiskAnaliziPage } from "./KomsulukRiskAnaliziPage";
export { default as TatbikatRehberiPage } from "./TatbikatRehberiPage";
export { default as YapayZekaHasarTahminiPage } from "./YapayZekaHasarTahminiPage";
export { default as DepremEgitimiPage } from "./DepremEgitimiPage";
export { default as YikilanBinalarArsiviPage } from "./YikilanBinalarArsiviPage";
export { default as UzmanRandevuPage } from "./UzmanRandevuPage";
export { default as Ders1 } from "./egitim/Ders1";
export { default as Ders2 } from "./egitim/Ders2";
export { default as Ders3 } from "./egitim/Ders3";
export { default as Ders4 } from "./egitim/Ders4";
export { default as Ders5 } from "./egitim/Ders5";
export { default as Ders6 } from "./egitim/Ders6";
export { default as Ders7 } from "./egitim/Ders7";
export { default as Ders8 } from "./egitim/Ders8";
export { default as Ders9 } from "./egitim/Ders9";
export { default as Ders10 } from "./egitim/Ders10";
export { ModuleRelatedStrip } from "./ModuleRelatedStrip";

export const MODULE_ROUTES = {
  PARSEL_ZEKASI: "/modul/parsel-zekasi",
  GES_ANALIZI: "/modul/ges-analizi",
  DEGERLEME: "/modul/degerleme",
  AIRBNB_POTANSIYEL: "/modul/airbnb-potansiyeli",
  RENOVASYON_ROI: "/modul/renovasyon-roi",
  AFET_RISK_HARITASI_LEGACY: "/modul/afet-risk-haritasi",
  DEPREM_RISK_HARITASI: "/modul/deprem-risk-haritasi",
  BINA_RISK_SORGU: "/modul/bina-risk-sorgu",
  CANLI_DEPREM_TAKIP: "/modul/canli-deprem-takip",
  AILE_ACIL_PLAN: "/modul/aile-acil-plan",
  GUCLENDIRME_REHBERI: "/modul/guclendirme-rehberi",
  IMAR_SORGU: "/modul/imar-sorgu",
  YATIRIM_ONERISI: "/modul/yatirim-onerisi",
  PORTFOY_YONETIMI: "/modul/portfoy-yonetimi",
  SIGORTA_PAZARYERI: "/modul/sigorta-pazaryeri",
  KREDI_PAZARYERI: "/modul/kredi-pazaryeri",
  KENTSEL_DONUSUM: "/modul/kentsel-donusum",
  AFET_TOPLANMA_ALANLARI: "/modul/afet-toplanma-alanlari",
  DEPREM_CANTASI: "/modul/deprem-cantasi",
  DEPREM_SIGORTASI: "/modul/deprem-sigortasi",
  KOMULUK_RISK_ANALIZI: "/modul/komsuluk-risk-analizi",
  TATBIKAT_REHBERI: "/modul/tatbikat-rehberi",
  YAPAY_ZEKA_HASAR_TAHMINI: "/modul/yapay-zeka-hasar-tahmini",
  DEPREM_EGITIMI: "/modul/deprem-egitimi",
  YIKILAN_BINALAR_ARSIVI: "/modul/yikilan-binalar-arsivi",
  UZMAN_RANDEVU: "/modul/uzman-randevu",
} as const;

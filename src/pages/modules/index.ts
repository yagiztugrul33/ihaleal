export { ModuleShell, ModulePanel, ModuleStatGrid, ModuleDataTable, ModulePdfCta, ModuleTag } from "./ModuleShell";
export type { ModuleShellProps, StatItem, ModuleTableColumn } from "./ModuleShell";

export { default as ParselZekasiPage } from "./ParselZekasiPage";
export { default as GesAnaliziModulPage } from "./GesAnaliziModulPage";
export { default as DegerlemeModulPage } from "./DegerlemeModulPage";
export { default as AirbnbPotansiyelPage } from "./AirbnbPotansiyelPage";
export { default as RenovasyonRoiPage } from "./RenovasyonRoiPage";
export { default as AfetRiskHaritasiPage } from "./AfetRiskHaritasiPage";
export { default as ImarSorguPage } from "./ImarSorguPage";
export { default as YatirimOnerisiPage } from "./YatirimOnerisiPage";
export { default as PortfoyYonetimiModulPage } from "./PortfoyYonetimiModulPage";
export { default as SigortaPazaryeriPage } from "./SigortaPazaryeriPage";
export { default as KrediPazaryeriPage } from "./KrediPazaryeriPage";

export const MODULE_ROUTES = {
  PARSEL_ZEKASI: "/modul/parsel-zekasi",
  GES_ANALIZI: "/modul/ges-analizi",
  DEGERLEME: "/modul/degerleme",
  AIRBNB_POTANSIYEL: "/modul/airbnb-potansiyeli",
  RENOVASYON_ROI: "/modul/renovasyon-roi",
  AFET_RISK: "/modul/afet-risk-haritasi",
  IMAR_SORGU: "/modul/imar-sorgu",
  YATIRIM_ONERISI: "/modul/yatirim-onerisi",
  PORTFOY_YONETIMI: "/modul/portfoy-yonetimi",
  SIGORTA_PAZARYERI: "/modul/sigorta-pazaryeri",
  KREDI_PAZARYERI: "/modul/kredi-pazaryeri",
} as const;

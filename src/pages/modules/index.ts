// R12.14 FAZ A-1 — modüller barrel (ortak export)
// Şu an mevcut: ModuleShell + 4 module page (R12.3 + R12.5'ten).
// Faz A-2/A-3/A-4'te ek module page'ler eklendikçe burası genişler.
export {
  ModuleShell,
  ModulePanel,
  ModuleStatGrid,
  ModuleDataTable,
  ModulePdfCta,
  ModuleTag,
} from "./ModuleShell";
export type { ModuleShellProps, StatItem, ModuleTableColumn } from "./ModuleShell";

export { default as DepremRiskHaritasiPage } from "./DepremRiskHaritasiPage";
export { default as BinaRiskSorguPage } from "./BinaRiskSorguPage";
export { default as CanliDepremTakipPage } from "./CanliDepremTakipPage";
export { default as GuclendirmeRehberiPage } from "./GuclendirmeRehberiPage";

// R12.14 Faz A-2 — Harita modülleri
export { default as AfetRiskHaritasiPage } from "./AfetRiskHaritasiPage";
export { default as ParselZekasiPage } from "./ParselZekasiPage";
export { default as KentselDonusumPage } from "./KentselDonusumPage";
export { default as AfetToplanmaAlanlariPage } from "./AfetToplanmaAlanlariPage";

export { default as KomsulukRiskCharts } from "./KomsulukRiskCharts";
export { ModuleRelatedStrip, type RelatedModuleCard } from "./ModuleRelatedStrip";

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

// R12.14 Faz A-3 — Eğitim modülleri (10 Ders + LessonView + data)
export { LessonView } from "./egitim/LessonView";
export { LESSONS, getLessonById } from "./egitim/lessons";
export type { LessonDefinition, QuizQuestion } from "./egitim/lessonTypes";
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

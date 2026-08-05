/* Grafik teması — açık & minimal tasarım sistemi (bkz. src/styles/tema.css).
   Seri renkleri tek vurgu ailesinden türetildi; lacivertin açık/koyu adımları
   ve nötr griler. Beyaz zeminde her seri en az 3:1 (grafik nesnesi eşiği). */
export const CHART_COLORS = ["#1E40AF", "#15803D", "#4C6EF5", "#5F6B64", "#9A6700", "#B42318"] as const;
export const chartTooltipStyle = {
  backgroundColor: "var(--zemin)",
  border: "1px solid var(--cizgi)",
  borderRadius: "var(--kose-kucuk)",
  color: "var(--metin)",
  fontSize: "12px",
  boxShadow: "var(--golge-buyuk)",
};
export const chartGridStroke = "var(--cizgi)";
export const chartAxisStroke = "#5F6B64";
export const chartAxisFontSize = 11;

import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CompetitorKey = "ihaleal" | "zillow" | "redfin" | "zingat" | "hepsiemlak" | "endeksa";
type FeatureStatus = "yes" | "partial" | "no";

type FeatureRow = {
  label: string;
  notes: Record<CompetitorKey, string>;
  values: Record<CompetitorKey, FeatureStatus>;
};

const FEATURES: FeatureRow[] = [
  {
    label: "Borsa / açık artırma",
    values: { ihaleal: "yes", zillow: "no", redfin: "no", zingat: "no", hepsiemlak: "no", endeksa: "no" },
    notes: {
      ihaleal: "İhale akışı ve teklif takibi modül olarak mevcut.",
      zillow: "Klasik listeleme odaklı.",
      redfin: "Klasik alım-satım akışı.",
      zingat: "İlan + endeks odaklı.",
      hepsiemlak: "İlan pazar yeri.",
      endeksa: "Analiz ve değerleme odağı.",
    },
  },
  {
    label: "Deprem zekası",
    values: { ihaleal: "yes", zillow: "partial", redfin: "partial", zingat: "no", hepsiemlak: "no", endeksa: "no" },
    notes: {
      ihaleal: "Risk katmanı ve harita akışında yorumlanır (ön analiz).",
      zillow: "Afet/risk bilgisi bölgesel içerik seviyesinde.",
      redfin: "Afet/risk bilgi katmanları sınırlı.",
      zingat: "Deprem odaklı motor görünmüyor.",
      hepsiemlak: "Deprem odaklı motor görünmüyor.",
      endeksa: "Deprem zekası ana ürün iddiası değil.",
    },
  },
  {
    label: "SHAP açıklanabilir değerleme",
    values: { ihaleal: "yes", zillow: "no", redfin: "no", zingat: "no", hepsiemlak: "no", endeksa: "no" },
    notes: {
      ihaleal: "Model katkı kırılımı (SHAP) ekranlanır.",
      zillow: "Tahmini değer var, SHAP açıklaması standart değil.",
      redfin: "Tahmini değer var, SHAP açıklaması standart değil.",
      zingat: "Fiyat bilgisi var, SHAP tabanlı açıklama görünmüyor.",
      hepsiemlak: "İlan odaklı; SHAP değerleme modülü görünmüyor.",
      endeksa: "Endeks/değer odaklı; SHAP ekranı kamuya açık değil.",
    },
  },
  {
    label: "Escrow + KYC",
    values: { ihaleal: "partial", zillow: "no", redfin: "no", zingat: "no", hepsiemlak: "no", endeksa: "no" },
    notes: {
      ihaleal: "Ürün akışında var; canlı bankacılık entegrasyonu ayrı faz.",
      zillow: "Platform içinde Türkiye benzeri escrow+KYC çifti standart değil.",
      redfin: "Platform içinde Türkiye benzeri escrow+KYC çifti standart değil.",
      zingat: "İlan tarafı ağırlıklı.",
      hepsiemlak: "İlan tarafı ağırlıklı.",
      endeksa: "Analiz tarafı ağırlıklı.",
    },
  },
  {
    label: "Konum radarı",
    values: { ihaleal: "yes", zillow: "partial", redfin: "partial", zingat: "partial", hepsiemlak: "partial", endeksa: "partial" },
    notes: {
      ihaleal: "Konum zekası + fırsat skoru birlikte sunulur.",
      zillow: "Harita/mahalle bilgisi güçlü, radar benzeri birleşik skor sınırlı.",
      redfin: "Harita/mahalle bilgisi güçlü, radar benzeri birleşik skor sınırlı.",
      zingat: "Bölgesel bilgi ve endeks içerikleri var.",
      hepsiemlak: "Bölgesel içerik var.",
      endeksa: "Bölge endeks ve değer trendleri güçlü.",
    },
  },
  {
    label: "Her şeyi bilen AI asistan",
    values: { ihaleal: "partial", zillow: "no", redfin: "no", zingat: "no", hepsiemlak: "no", endeksa: "no" },
    notes: {
      ihaleal: "Çok modüllü karar asistanı hedefi var; canlı kurumsal veri entegrasyonu fazlı.",
      zillow: "Genel AI özellikleri var, uçtan uca karar asistanı standardı yok.",
      redfin: "Genel AI özellikleri var, uçtan uca karar asistanı standardı yok.",
      zingat: "Kapsamlı karar asistanı görünmüyor.",
      hepsiemlak: "Kapsamlı karar asistanı görünmüyor.",
      endeksa: "Analitik odaklı, çok ajanlı asistan odağı değil.",
    },
  },
  {
    label: "GES / imar motorları",
    values: { ihaleal: "yes", zillow: "no", redfin: "no", zingat: "no", hepsiemlak: "no", endeksa: "no" },
    notes: {
      ihaleal: "GES uygunluk + imar olasılık modülleri aynı ürün ailesinde.",
      zillow: "GES/imar uzman motoru görünmüyor.",
      redfin: "GES/imar uzman motoru görünmüyor.",
      zingat: "GES/imar uzman motoru görünmüyor.",
      hepsiemlak: "GES/imar uzman motoru görünmüyor.",
      endeksa: "GES/imar uzman motoru görünmüyor.",
    },
  },
];

const COMPETITORS: Array<{ key: CompetitorKey; label: string }> = [
  { key: "ihaleal", label: "ihaleal" },
  { key: "zillow", label: "Zillow" },
  { key: "redfin", label: "Redfin" },
  { key: "zingat", label: "Zingat" },
  { key: "hepsiemlak", label: "Hepsiemlak" },
  { key: "endeksa", label: "Endeksa" },
];

function StatusIcon({ value }: { value: FeatureStatus }) {
  if (value === "yes") return <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />;
  if (value === "partial") return <MinusCircle className="mx-auto h-4 w-4 text-amber-300" />;
  return <XCircle className="mx-auto h-4 w-4 text-rose-400" />;
}

export default function CompetitorComparison() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="border-b border-white/10 bg-gradient-to-b from-cyan-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 gap-2 text-slate-400">
            <ArrowLeft className="h-4 w-4" /> Geri
          </Button>
          <Badge className="mb-4 border-cyan-400/30 bg-cyan-500/10 text-cyan-200">Rakip Kıyas AR-GE</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">ihaleal vs küresel + yerel oyuncular</h1>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-slate-300 md:text-lg">
            Bu tablo ürün kabiliyetini kıyaslar; pazar payı veya hukuki üstünlük iddiası değildir. Yeşil: ürün içinde var, sarı: kısmi/ayrı
            entegrasyon gerektirir, kırmızı: görünür ürün kabiliyeti yok.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl space-y-6 px-4">
        <Card className="border-white/10 bg-slate-900/50">
          <CardContent className="overflow-x-auto p-5">
            <h2 className="mb-4 text-2xl font-bold text-white">Gerçek kıyas tablosu</h2>
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-2 text-left font-semibold text-slate-300">Özellik</th>
                  {COMPETITORS.map((col) => (
                    <th key={col.key} className="px-3 py-2 text-center font-semibold text-slate-300">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row) => (
                  <tr key={row.label} className="border-b border-white/5 align-top">
                    <td className="px-3 py-3 font-medium text-white">{row.label}</td>
                    {COMPETITORS.map((col) => (
                      <td key={`${row.label}-${col.key}`} className="px-3 py-3 text-center">
                        <StatusIcon value={row.values[col.key]} />
                        <p className="mt-1 text-[11px] leading-snug text-slate-400">{row.notes[col.key]}</p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/30 bg-cyan-500/10">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-cyan-100">ihaleal farkı (rakipte aynı kombinasyon yok)</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>• Açık artırma + değerleme açıklanabilirliği + deprem/konum + GES/imar aynı ürün ailesinde toplanıyor.</li>
              <li>• Rol bazlı akış (emlakçı, müteahhit, yatırımcı) ve by-pass etmeyen işlem modeli birlikte tasarlanıyor.</li>
              <li>• Dürüst sınır: escrow/KYC ve bazı veri hatları canlı bankacılık/kurum entegrasyonu gerektirir; bu adım ayrı fazdır.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/emlakci")} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            Emlakçı akışını incele
          </Button>
          <Button onClick={() => navigate("/dashboard/yatirimci")} variant="outline">
            Yatırımcı panelini aç
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link2, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DemoDataCornerBadge } from "@/components/DemoDataCornerBadge";
import { isDemoData } from "@/lib/dataStrategy";

/** URL yolu üzerinden üçüncü taraf rapor / değerleme sayfası tahmini — harici veri çekilmez. */
function urlLooksLikeThirdPartyReport(raw: string): boolean {
  const u = raw.trim().toLowerCase();
  if (!u) return false;
  try {
    const href = u.startsWith("http") ? u : `https://${u}`;
    const parsed = new URL(href);
    const blob = `${parsed.pathname}${parsed.search}`.toLowerCase();
    return (
      /\.pdf(\?|$)/i.test(blob) ||
      /rapor|degerleme|değerleme|analiz|valuation|report|fiyat-tahmin|price-estimate|deger/.test(blob)
    );
  } catch {
    return /\.pdf|rapor|degerleme|analiz|valuation/.test(u);
  }
}

/** Harici ilan URL'si için DEMO karşılaştırma — veri çekilmez, hukuki tavsiye değildir. */
export function ListingLinkDemo() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState("");

  const insight = useMemo(() => {
    const u = active.trim();
    if (!u) return null;
    const h = [...u].reduce((a, c) => a + c.charCodeAt(0), 0);
    const segments = ["Üst segment konut", "Yatırımlık daire", "Lüks / villa segmenti", "Ticari birim"];
    const risks = ["Düşük belirsizlik", "Orta: fiyat ilanı piyasaya göre yüksek olabilir", "Dikkat: ekspertiz doğrulaması önerilir"];
    return {
      segment: segments[h % segments.length],
      risk: risks[h % risks.length],
      score: 58 + (h % 38),
      isSahibinden: /sahibinden\.com/i.test(u),
      isThirdPartyReportUrl: urlLooksLikeThirdPartyReport(u),
    };
  }, [active]);

  return (
    <Card className="bg-slate-900/50 border-slate-200/80" data-demo="true">
      <CardContent className="p-5">
        <div className="relative flex items-center gap-2 mb-3">
          {isDemoData("listingLinkDemo") ? <DemoDataCornerBadge /> : null}
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Harici ilan linki (örnek)</h3>
            <p className="text-xs text-slate-500">Sahibinden veya üçüncü taraf rapor linklerinden örnek URL yapıştırın — site veri çekmez; yalnızca demo özet üretilir.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://www.sahibinden.com/ilan/..."
            className="bg-white/[0.03] border-slate-200 text-white placeholder:text-slate-600"
          />
          <Button type="button" onClick={() => setActive(input)} className="shrink-0 bg-violet-600 hover:bg-violet-500 gap-2">
            <Sparkles className="w-4 h-4" /> Örnek rapor
          </Button>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 flex gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            Kurumsal <strong className="text-slate-200">yapay zeka destekli gayrimenkul platformu</strong> için doğru yol: kullanıcının kendi yüklediği ilan PDF’si / ekspertiz / fiyat beklentisi + platformun <strong className="text-slate-200">kendi veri modeli</strong> (lisanslı veya crowdsourced); rakibin arayüzünü veya veri tabanını “kopyalamak” hem hukuki hem teknik olarak önerilmez.
            Canlı bölge–fiyat analizi için resmi API, kullanıcı onayı veya yüklenen evrak gerekir. Rakip siteleri izinsiz taramak yasal ve teknik risk taşır.
            Canlı fiyat / dk güncelleme için sunucu ve veri lisansı şarttır.
          </p>
        </div>

        {insight && (
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              {insight.isSahibinden && <Badge className="bg-blue-500/15 text-blue-300 border-0">Sahibinden formatı (tahmin)</Badge>}
              {insight.isThirdPartyReportUrl && (
                <Badge className="bg-emerald-500/15 text-emerald-300 border-0">Üçüncü taraf rapor URL’si (tahmin)</Badge>
              )}
              <Badge variant="outline" className="border-slate-200 text-slate-300">Demo skor: {insight.score}</Badge>
            </div>
            <p className="text-slate-300"><span className="text-slate-500">Segment:</span> {insight.segment}</p>
            <p className="text-slate-300"><span className="text-slate-500">Risk notu:</span> {insight.risk}</p>
            <p className="text-xs text-slate-500">
              ihaleal.com ile kıyas: İhale + birleşik evrak + (yol haritasında) Findeks / e-Devlet entegrasyonu tek çatıda hedeflenir — bu ekran yalnızca ürün vizyonu örneğidir.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

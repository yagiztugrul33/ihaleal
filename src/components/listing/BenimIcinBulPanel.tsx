import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Auction } from "@/types/auction";

type Criteria = {
  city: string;
  maxPrice: number;
  minScore: number;
};

function scoreListing(a: Auction, c: Criteria): number {
  let score = 0;
  if (c.city !== "all" && a.city.toLocaleLowerCase("tr-TR").includes(c.city.toLocaleLowerCase("tr-TR"))) score += 3;
  if (a.currentBid <= c.maxPrice) score += 2;
  if (a.investmentScore >= c.minScore) score += 2;
  if (a.isFeatured) score += 1;
  if (a.dealType !== "rent") score += 1;
  return score;
}

type Props = {
  catalog: Auction[];
};

export function BenimIcinBulPanel({ catalog }: Props) {
  const navigate = useNavigate();
  const [city, setCity] = useState("İstanbul");
  const [maxPriceM, setMaxPriceM] = useState("15");
  const [minScore, setMinScore] = useState("70");

  const picks = useMemo(() => {
    const criteria: Criteria = {
      city: city.trim() || "all",
      maxPrice: Math.max(1, Number(maxPriceM) || 15) * 1_000_000,
      minScore: Math.max(0, Number(minScore) || 0),
    };
    return [...catalog]
      .map((a) => ({ a, score: scoreListing(a, criteria) }))
      .filter((row) => row.score > 0)
      .sort((x, y) => y.score - x.score || y.a.investmentScore - x.a.investmentScore)
      .slice(0, 5);
  }, [catalog, city, maxPriceM, minScore]);

  return (
    <Card className="border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--metin-ikincil)]" />
          <h3 className="text-sm font-normal text-white">Benim İçin Bul</h3>
        </div>
        <p className="text-xs text-slate-400">Bütçe, şehir ve yatırım skoruna göre uygun ilan önerileri.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Şehir" className="bg-slate-950 border-slate-700 text-white" />
          <Input value={maxPriceM} onChange={(e) => setMaxPriceM(e.target.value)} placeholder="Max fiyat (M ₺)" className="bg-slate-950 border-slate-700 text-white" />
          <Input value={minScore} onChange={(e) => setMinScore(e.target.value)} placeholder="Min skor" className="bg-slate-950 border-slate-700 text-white" />
        </div>
        <ul className="space-y-2 text-sm">
          {picks.length === 0 ? (
            <li className="text-slate-500">Kriterlere uygun ilan bulunamadı — filtreleri genişletin.</li>
          ) : (
            picks.map(({ a, score }) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2">
                <span className="text-slate-200 line-clamp-1">{a.title}</span>
                <Button type="button" size="sm" variant="outline" className="shrink-0 h-8 border-[var(--cizgi)]" onClick={() => navigate(`/ilan/${a.id}`)}>
                  Skor {score}
                </Button>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

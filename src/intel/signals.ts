import { computeEnvironmentScore, getRegionTag } from "@/intel/scoring";
import type { RegionIntelRaw, RegionIntelScored, RegionSignal } from "@/intel/types";

function signal(id: string, slug: string, title: string, detail: string, level: RegionSignal["level"]): RegionSignal {
  return { id, slug, title, detail, level };
}

export function buildSignals(region: RegionIntelRaw): RegionSignal[] {
  const out: RegionSignal[] = [];
  const envScore = computeEnvironmentScore(region);

  if (region.yearlyPriceTrendPct >= 7) {
    out.push(
      signal(
        `${region.slug}-trend-up`,
        region.slug,
        "Fiyat momentumu yuksek",
        `${region.label} bolgesinde yillik fiyat trendi %+${region.yearlyPriceTrendPct.toFixed(1)} seviyesinde.`,
        "opportunity",
      ),
    );
  }

  if (region.securityScore >= 80 && region.yearlyPriceTrendPct >= 5) {
    out.push(
      signal(
        `${region.slug}-strong-investment`,
        region.slug,
        "Guclu yatirim sinyali",
        "Yuksek guvenlik ve yukselen fiyat trendi birlikte pozitif profil uretiyor.",
        "opportunity",
      ),
    );
  }

  if (region.liquidityScore <= 45) {
    out.push(
      signal(
        `${region.slug}-liquidity-risk`,
        region.slug,
        "Likidite riski",
        "Islem hizi dusuk. Cikis suresi uzayabilir; fiyat indirim baskisi olusabilir.",
        "risk",
      ),
    );
  } else if (region.liquidityScore >= 70) {
    out.push(
      signal(
        `${region.slug}-liquidity-good`,
        region.slug,
        "Likidite guclu",
        "Islem sikligi yuksek. Alim-satim dongusu daha hizli olabilir.",
        "info",
      ),
    );
  }

  if (region.earthquakeRiskScore >= 62) {
    out.push(
      signal(
        `${region.slug}-earthquake-watch`,
        region.slug,
        "Deprem riski izlenmeli",
        "Sismik risk skoru yuksek. Sigorta, zemin raporu ve maliyet primleri kontrol edilmeli.",
        "watch",
      ),
    );
  }

  if (region.transportScore >= 80 && region.incomeScore >= 70) {
    out.push(
      signal(
        `${region.slug}-premium-demand`,
        region.slug,
        "Premium talep profili",
        "Ulasim ve gelir kombinasyonu, kiralama ve yeniden satis talebini destekliyor.",
        "info",
      ),
    );
  }

  if (out.length === 0) {
    out.push(
      signal(
        `${region.slug}-balanced`,
        region.slug,
        "Dengeli gorunum",
        "Bolge karmasik bir sinyal vermiyor; daha uzun pencere ve benzer bolge karsilastirmasi onerilir.",
        "watch",
      ),
    );
  }

  return out.slice(0, 4);
}

export function scoreRegion(region: RegionIntelRaw): RegionIntelScored {
  const environmentScore = computeEnvironmentScore(region);
  return {
    ...region,
    environmentScore,
    tag: getRegionTag(environmentScore),
    breakdown: {
      security: region.securityScore,
      income: region.incomeScore,
      transport: region.transportScore,
      education: region.educationScore,
      health: region.healthScore,
      earthquakeResilience: 100 - region.earthquakeRiskScore,
      priceTrend: Math.min(100, Math.max(0, Math.round(55 + region.yearlyPriceTrendPct * 3.1))),
      liquidity: region.liquidityScore,
    },
    signals: buildSignals(region),
  };
}

const fs = require("fs");

function patch(path, pairs) {
  let c = fs.readFileSync(path, "utf8");
  for (const [a, b] of pairs) {
    if (!c.includes(a)) throw new Error("missing: " + a.slice(0, 40));
    c = c.replace(a, b);
  }
  fs.writeFileSync(path, c, "utf8");
}

patch("src/lib/engineering/safeCalc.ts", [
  [
    "    paybackYears: sanitizeFinite(result.paybackYears),",
    "    paybackYear: result.paybackYear == null || !Number.isFinite(result.paybackYear) ? null : sanitizeFinite(result.paybackYear),",
  ],
  [
    `      paybackYears: 0,
      confidence: "LOW",`,
    `      paybackYear: null,
      bankable: false,
      usableAreaM2: 0,
      panelCount: 0,
      dcCapacityKwp: 0,
      monthlyProductionKwh: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      capacityFactor: 0,
      degradationPctPerYear: 0,
      yearlyCashFlow: [],
      simpleRoiPct: 0,
      confidence: "low",`,
  ],
]);

patch("src/pages/intelligence/GesAnalysisPage.tsx", [
  [
    "  calculateGesFeasibility,",
    "  safeCalculateGesFeasibility,",
  ],
  [
    'import { fmtNum, fmtPct } from "@/lib/engineering/formatDisplay";',
    'import { fmtNum, fmtPct, fmtScore } from "@/lib/engineering/formatDisplay";\nimport { PreFeasibilityBanner } from "@/components/compliance/PreFeasibilityBanner";',
  ],
  [
    "  const [result, setResult] = useState<GesFeasibilityResult | null>(null);",
    "  const [result, setResult] = useState<GesFeasibilityResult | null>(null);\n  const [calcError, setCalcError] = useState(\"\");",
  ],
  [
    "      calculateGesFeasibility({",
    "      safeCalculateGesFeasibility({",
  ],
  [
    "  const run = () => {\n    setResult(",
    "  const run = () => {\n    setCalcError(\"\");\n    try {\n    setResult(",
  ],
  [
    "      }),\n    );\n  };",
    "      }),\n    );\n    } catch {\n      setCalcError(\"Hesaplama tamamlanamadi.\");\n      setResult(null);\n    }\n  };",
  ],
  [
    `        <motion.div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <strong>On fizibilite:</strong> Bu sayfa yatirim tavsiyesi degildir. Resmi EIA / baglanti / ruhsat yerine gecmez.
          {result?.dataSource === "ghi_annual_fallback" ? (
            <span className="block mt-1 text-amber-200/90">
              PVGIS aylik veri yok — GHI uzerinden mevsimsel profil kullanildi.
            </span>
          ) : null}
          {pvgisNote && !result ? <span className="block mt-1 text-amber-200/80">{pvgisNote}</span> : null}
        </motion.div>`,
    `        <PreFeasibilityBanner className="mb-6 text-amber-100" />
        {calcError ? <p className="mb-4 text-sm text-red-300">{calcError}</p> : null}
        {result?.dataSource === "ghi_annual_fallback" ? (
          <p className="mb-4 text-xs text-amber-200/90">PVGIS aylik veri yok — GHI uzerinden mevsimsel profil kullanildi.</p>
        ) : null}
        {pvgisNote && !result ? <p className="mb-4 text-xs text-amber-200/80">{pvgisNote}</p> : null}`,
  ],
  [
    '<p className="text-2xl font-bold text-cyan-300">{v}</p>',
    '<p className="text-2xl font-bold text-cyan-300">{fmtScore(v)}</p>',
  ],
]);

console.log("patched");
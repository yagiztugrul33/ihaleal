import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, MapPin, Search, Users } from "lucide-react";
import { getAllProperties } from "@/lib/demo-data";
import { calculateEarthquakeScore } from "@/lib/scoring/earthquakeEngine";
import type { PropertyRecord } from "@/types/property";
import { ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { ModuleRelatedStrip } from "./ModuleRelatedStrip";
import type { RelatedModuleCard } from "./ModuleRelatedStrip";
import { ShieldCheck, Building2, Activity } from "lucide-react";

const Charts = lazy(() => import("./KomsulukRiskCharts"));

const RELATED: RelatedModuleCard[] = [
  { title: "Bina Risk Sorgusu", description: "Yapı bazlı özet skor.", href: "/modul/bina-risk-sorgu", icon: ShieldCheck },
  { title: "Deprem Risk Haritası", description: "GIS katmanları.", href: "/modul/deprem-risk-haritasi", icon: Activity },
  { title: "Kentsel Dönüşüm", description: "Riskli alan haritası.", href: "/modul/kentsel-donusum", icon: Building2 },
];

function neighborhoodLabel(p: PropertyRecord): string {
  return p.neighborhood?.trim() || p.district?.trim() || "Mahalle";
}

function buildAdvice(property: PropertyRecord, neighbors: PropertyRecord[]): [string, string, string] {
  const score = property.earthquakeScore ?? calculateEarthquakeScore(property);
  const mahalle = neighborhoodLabel(property);
  const avgNeighbor =
    neighbors.length > 0
      ? neighbors.reduce((a, n) => a + (n.earthquakeScore?.totalScore ?? calculateEarthquakeScore(n).totalScore), 0) / neighbors.length
      : score.totalScore;
  const delta = score.totalScore - avgNeighbor;
  const p1 = `${mahalle} (${property.city ?? "—"}) için seçilen referans ilanın birleşik deprem dayanıklılık endeksi ${Math.round(score.totalScore)}/100 ve band ${score.band} olarak özetlenmiştir. Mahalle ölçeğinde komşu ${neighbors.length} ilan ile kıyaslandığında profiliniz ${delta >= 0 ? "ortalamanın üzerinde" : "ortalamanın altında"} konumlanır; bu fark yapı yaşı, zemin sınıfı ve belge uyumu bileşenlerinden kaynaklanır.`;
  const p2 = `Komşuluk riski yalnızca bina gövdesiyle sınırlı değildir: bitişik parsellerdeki yumuşak kat, çıkma dengesizliği ve ortak istinat duvarları hasar yayılımını etkiler. ${property.disaster?.fault.nearestFaultNameTr ?? "Bölgesel fay"} bağlamında mesafe ve PGA göstergeleri konumsal stresi belirler; DASK ve tamamlayıcı poliçe güncelliği finansal toparlanma kapasitesini destekler.`;
  const p3 = `Öneri: Mahalledeki benzer ilanları karşılaştırarak güçlendirme veya dönüşüm gündemini netleştirin; resmi zemin etüdü ve performans analizi için uzman randevusu planlayın. Aşağıdaki grafikler komşu skor dağılımını gösterir; detaylı ilan listesi için mahalle filtresine geçebilirsiniz.`;
  return [p1, p2, p3];
}

export default function KomsulukRiskAnaliziPage() {
  const all = useMemo(() => getAllProperties(), []);
  const [mode, setMode] = useState<"address" | "listing">("listing");
  const [address, setAddress] = useState("");
  const [listingId, setListingId] = useState(all[0]?.id ?? "");
  const [submitted, setSubmitted] = useState(true);

  const property = useMemo(() => {
    if (mode === "listing") return all.find((p) => p.id === listingId) ?? all[0];
    const q = address.trim().toLowerCase();
    return (
      all.find(
        (p) =>
          p.address?.toLowerCase().includes(q) ||
          p.neighborhood?.toLowerCase().includes(q) ||
          `${p.district} ${p.city}`.toLowerCase().includes(q),
      ) ?? all[0]
    );
  }, [mode, listingId, address, all]);

  const neighbors = useMemo(() => {
    if (!property) return [];
    const mah = neighborhoodLabel(property).toLowerCase();
    return all
      .filter(
        (p) =>
          p.id !== property.id &&
          p.city === property.city &&
          (p.neighborhood?.toLowerCase() === mah || p.district === property.district),
      )
      .slice(0, 12);
  }, [property, all]);

  const advice = useMemo(() => (property ? buildAdvice(property, neighbors) : null), [property, neighbors]);

  const stats = useMemo(() => {
    if (!property) return [];
    const score = property.earthquakeScore ?? calculateEarthquakeScore(property);
    return [
      { label: "Referans skor", value: `${Math.round(score.totalScore)}/100`, hint: score.band },
      { label: "Komşu ilan", value: String(neighbors.length), hint: "Aynı mahalle" },
      { label: "Mahalle", value: neighborhoodLabel(property), hint: property.city ?? "—" },
      { label: "Fay mesafesi", value: property.disaster?.fault.distanceToFaultKm != null ? `${property.disaster.fault.distanceToFaultKm} km` : "—", hint: "Demo" },
    ];
  }, [property, neighbors]);

  const mahalleQuery = property ? encodeURIComponent(neighborhoodLabel(property)) : "";

  return (
    <ModuleShell
      title="Komşuluk Risk Analizi"
      subtitle="Adres veya ilan seçimi ile mahalle ölçeğinde deprem skoru dağılımı, grafikler ve üç paragraflık yapay zeka özeti."
      icon={Users}
      iconAccent="text-violet-300"
      badge="Mahalle Intelligence"
    >
      <ModulePanel title="Konum veya ilan seçimi">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={`mod-btn-secondary ${mode === "listing" ? "ring-1 ring-sky-500/50" : ""}`}
            onClick={() => setMode("listing")}
          >
            İlandan seç
          </button>
          <button
            type="button"
            className={`mod-btn-secondary ${mode === "address" ? "ring-1 ring-sky-500/50" : ""}`}
            onClick={() => setMode("address")}
          >
            Adres yaz
          </button>
        </div>
        <form
          className="mod-form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          {mode === "listing" ? (
            <div>
              <label htmlFor="kr-listing">Demo ilan</label>
              <select id="kr-listing" value={listingId} onChange={(e) => setListingId(e.target.value)}>
                {all.slice(0, 40).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.title.slice(0, 48)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="kr-adres">Adres / mahalle</label>
              <input id="kr-adres" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kadıköy Moda, Çankaya…" />
            </div>
          )}
          <div className="mod-form-actions">
            <button type="submit" className="mod-btn-primary">
              <Search className="h-4 w-4" aria-hidden />
              Analiz et
            </button>
          </div>
        </form>
      </ModulePanel>

      {submitted && property ? (
        <>
          <ModuleStatGrid stats={stats} />
          <ModulePanel title="Yapay zeka mahalle özeti">
            <div className="space-y-3 text-sm leading-relaxed text-slate-300">
              {advice?.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            <p className="mt-4">
              <ModuleTag tone="warn">Demo metin — resmi ekspertiz değildir</ModuleTag>
            </p>
          </ModulePanel>

          <ModulePanel title="Skor dağılımı">
            <Suspense fallback={<div className="mod-chart flex items-center justify-center text-sm text-slate-500">Grafikler yükleniyor…</div>}>
              <Charts property={property} neighbors={neighbors} />
            </Suspense>
          </ModulePanel>

          <div className="mod-cta-row">
            <Link to={`/ilanlar?mahalle=${mahalleQuery}`} className="mod-btn-primary">
              <MapPin className="h-4 w-4" aria-hidden />
              Mahalle ilanlarını gör
            </Link>
            <Link to={`/ilan/${property.id}`} className="mod-btn-secondary">
              <BarChart3 className="h-4 w-4" aria-hidden />
              Seçili ilan detayı
            </Link>
          </div>
        </>
      ) : (
        <div className="mod-empty">Adres veya ilan seçip analiz başlatın.</div>
      )}

      <ModuleRelatedStrip modules={RELATED} />
    </ModuleShell>
  );
}

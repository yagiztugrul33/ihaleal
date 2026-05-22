import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import {
  Building2,
  Car,
  Download,
  Droplets,
  ArrowUpDown,
  FileText,
  Gavel,
  Image as ImageIcon,
  Shield,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { PropertyRecord } from "@/types/property";
import { getPropertyUiExtras } from "@/lib/property/uiExtras";
import type { IlanTypeExtras } from "./types";
import {
  BadgeRow,
  DataTable,
  EmptyExpertise,
  HighlightList,
  MiniMap,
  PersonaIcon,
  ScoreRing,
  SectionTitle,
  StatCard,
  formatTry,
} from "./shared";
import { buildYapiRows, dealLabel, istanbulCoords, priceOf } from "./tabHelpers";
import { AfetDisasterHub } from "@/components/property/AfetDisasterHub";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { normalizeAuctionImages } from "@/lib/listingImage";
import "leaflet/dist/leaflet.css";

export type RichTabKey =
  | "GENEL"
  | "YAPI"
  | "AFET"
  | "ALTYAPI"
  | "CEVRE"
  | "SOSYAL"
  | "MALI"
  | "HUKUKI"
  | "AI"
  | "GALERI"
  | "EKSPERTIZ"
  | "TEKLIFLER";

export interface RichTabPanelProps {
  tab: RichTabKey;
  property: PropertyRecord;
  typeExtras: IlanTypeExtras;
  onGoTab: (tab: RichTabKey) => void;
}

const CRIME_DATA = [
  { name: "Hırsızlık", value: 42 },
  { name: "Vandalizm", value: 18 },
  { name: "Dolandırıcılık", value: 12 },
  { name: "Diğer", value: 28 },
];

const DEMO_PIE = [
  { name: "18-35", value: 38 },
  { name: "36-55", value: 44 },
  { name: "55+", value: 18 },
];

const PIE_COLORS = ["#0d9488", "#6366f1", "#f59e0b"];

function GenelPanel({ property, onGoTab }: { property: PropertyRecord; onGoTab: (tab: RichTabKey) => void }) {
  const extras = getPropertyUiExtras(property);
  const price = priceOf(property);
  return (
    <section className="idr-panel idr-panel--genel">
      <div className="idr-banner">
        <StatCard title="Fiyat" value={price ? formatTry(price) : "—"} tone="primary" icon={<TrendingUp size={18} />} />
        <StatCard title="Brüt m²" value={property.grossSqm ? `${property.grossSqm} m²` : "—"} />
        <StatCard title="Oda" value={property.roomCount ?? "—"} />
        <StatCard title="Risk skoru" value={<ScoreRing score={100 - extras.riskScore} size={72} />} />
        <StatCard title="Likidite" value={`${extras.liquidityMonths} ay`} hint="Tahmini satış süresi" />
      </div>
      <div className="idr-split">
        <article className="idr-card">
          <SectionTitle title="Alıcı profili" subtitle="AI eşleşme etiketleri" />
          <BadgeRow items={extras.personas} variant="good" />
          <div className="idr-persona-tags">
            {extras.personaTags.map((t) => (
              <span key={t.label} className="idr-persona-chip">
                <PersonaIcon icon={t.icon} />
                {t.label}
              </span>
            ))}
          </div>
        </article>
        <article className="idr-card">
          <SectionTitle title="Konum özeti" />
          <p className="idr-muted">{extras.neighborhoodSummary}</p>
          <MiniMap district={`${property.district}, ${property.city}`} onGoTab={onGoTab} />
        </article>
      </div>
      <div className="idr-split">
        <article className="idr-card">
          <SectionTitle title="Öne çıkanlar" />
          <HighlightList items={extras.highlights} variant="good" />
        </article>
        <article className="idr-card">
          <SectionTitle title="Dikkat edilmesi gerekenler" />
          <HighlightList items={extras.concerns} variant="warn" />
        </article>
      </div>
    </section>
  );
}

function YapiPanel({ property }: { property: PropertyRecord }) {
  const rows = buildYapiRows(property);
  const shelter = property.emergencyExit || property.fireCompartment;
  return (
    <section className="idr-panel idr-panel--yapi">
      <div className="idr-yapi-grid">
        <article className="idr-card idr-card--table">
          <SectionTitle title="Yapı özellikleri" subtitle={`${rows.length} alan`} />
          <DataTable rows={rows} />
        </article>
        <div className="idr-yapi-cards">
          <article className="idr-feature-card">
            <ArrowUpDown size={22} aria-hidden />
            <h4>Asansör</h4>
            <p>{property.elevator ? "Mevcut" : "Yok"}</p>
          </article>
          <article className="idr-feature-card">
            <Car size={22} aria-hidden />
            <h4>Otopark</h4>
            <p>{property.parking ? `${property.parkingSpots ?? 1} kapasite` : "Yok"}</p>
          </article>
          <article className="idr-feature-card">
            <Shield size={22} aria-hidden />
            <h4>Sığınak / güvenlik</h4>
            <p>{shelter ? "Acil çıkış ve yangın bölmeli" : "Standart"}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function AltyapiPanel({ property }: { property: PropertyRecord }) {
  const items = [
    { icon: Zap, label: "Elektrik", ok: property.electricity, extra: property.powerKva ? `${property.powerKva} kVA` : undefined },
    { icon: Droplets, label: "Su", ok: property.water },
    { icon: Building2, label: "Doğalgaz", ok: property.naturalGas },
    { icon: Zap, label: "Üç faz", ok: property.threePhasePower },
    { icon: Zap, label: "Fiber", ok: property.fiberInternet },
    { icon: Car, label: "Yükleme rampası", ok: property.loadingDock },
    { icon: Car, label: "Tır erişimi", ok: property.truckAccess },
    { icon: Zap, label: "Jeneratör", ok: property.generator },
    { icon: Zap, label: "Güneş hazır", ok: property.solarReady },
  ];
  return (
    <section className="idr-panel idr-panel--altyapi">
      <div className="idr-infra-grid">
        {items.map((item) => (
          <article key={item.label} className={item.ok ? "idr-infra-card is-on" : "idr-infra-card"}>
            <item.icon size={20} aria-hidden />
            <h4>{item.label}</h4>
            <p>{item.ok ? item.extra ?? "Aktif" : "Yok / belirsiz"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CevrePanel({ property }: { property: PropertyRecord }) {
  const extras = getPropertyUiExtras(property);
  const [lat, lng] = istanbulCoords(property);
  return (
    <section className="idr-panel idr-panel--cevre">
      <div className="idr-map-wrap">
        <MapContainer center={[lat, lng]} zoom={14} className="idr-leaflet" scrollWheelZoom>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker center={[lat, lng]} radius={12}>
            <Popup>{property.title}</Popup>
          </CircleMarker>
        </MapContainer>
      </div>
      <SectionTitle title="Yakın POI" subtitle="Yürüme mesafesi tahmini" />
      <ul className="idr-poi-list">
        {extras.nearbyPois.map((poi) => (
          <li key={poi.name}>
            <span className="idr-poi-type">{poi.type}</span>
            <span>{poi.name}</span>
            <span>{poi.distanceM} m</span>
            {poi.walkMin > 0 ? <span>{poi.walkMin} dk</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SosyalPanel({ property }: { property: PropertyRecord }) {
  const n = property.neighborhood;
  const nearestSchool = n?.education?.yakinOkullar?.[0];
  const nearestHospital = n?.health?.yakinHastaneler?.[0];
  const walkability = n?.transportation?.yurunebilir;
  const socio = n
    ? [
        { name: "Egitim", value: nearestSchool?.lgsScore ?? 70 },
        { name: "Saglik", value: nearestHospital?.emergencyQuality ?? 75 },
        { name: "Ulasim", value: walkability ?? 60 },
        { name: "Is imkani", value: n.jobOpportunityIndex },
      ]
    : [
        { name: "Eğitim", value: 78 },
        { name: "Sağlık", value: 72 },
        { name: "Ulaşım", value: 85 },
        { name: "Yeşil alan", value: property.greenAreaRatio ?? 55 },
      ];
  const demoPie = n?.demographics?.yasDagilimi ?? DEMO_PIE;
  const walk = walkability ?? 60;
  return (
    <section className="idr-panel idr-panel--sosyal">
      {n ? <p className="idr-muted">{n.aiMahalleOzeti}</p> : null}
      <div className="idr-walk-badge">
        <strong>{walk}</strong>
        <span>Yurunebilirlik</span>
      </div>
      <div className="idr-charts-row">
        <article className="idr-card">
          <SectionTitle title="Suç orani (TR ort. kiyas)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CRIME_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="idr-card">
          <SectionTitle title={`Sosyoekonomik duzey: ${n?.socioEconomicLevel ?? 3}/5`} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={socio} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="idr-card">
          <SectionTitle title="Demografi" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={demoPie}
                dataKey={n ? "pct" : "value"}
                nameKey={n ? "band" : "name"}
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {demoPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>
      <div className="idr-stats-row">
        <StatCard label="Yasam maliyeti" value={String(n?.livingCostIndex ?? "—")} />
        <StatCard label="Egitim LGS" value={String(nearestSchool?.lgsScore ?? "—")} />
      </div>
      {n?.nearbyPoints?.length ? (
        <>
          <SectionTitle title="Yakin 10 nokta" />
          <ul className="idr-nearby-list">
            {n.nearbyPoints.slice(0, 10).map((pt) => (
              <li key={pt.name}>
                <span>{pt.name}</span>
                <span>
                  {pt.distanceKm.toFixed(1)} km · {pt.walkMin} dk
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <SectionTitle title="Sosyal tesisler" />
      <BadgeRow items={property.socialFacilities ?? ["Güvenlik", "Otopark", "Asansör"]} />
    </section>
  );
}

function MaliPanel({ property }: { property: PropertyRecord }) {
  const extras = getPropertyUiExtras(property);
  const [expense, setExpense] = useState(extras.monthlyExpenseTry);
  const price = priceOf(property) || 1;
  const yieldPct = extras.grossYieldPct;
  return (
    <section className="idr-panel idr-panel--mali">
      <div className="idr-split">
        <article className="idr-card">
          <SectionTitle title="Aylık gider hesaplayıcı" />
          <label className="idr-range-label">
            Aidat + işletme: <strong>{formatTry(expense)}</strong>
          </label>
          <input
            type="range"
            min={500}
            max={25000}
            step={100}
            value={expense}
            onChange={(e) => setExpense(Number(e.target.value))}
            className="idr-range"
          />
          <p className="idr-muted">Kira tahmini: {formatTry(extras.rentEstimateTry)} / ay</p>
        </article>
        <article className="idr-card idr-card--center">
          <ScoreRing score={Math.min(100, Math.round(yieldPct * 8))} label="Brüt kira getirisi" size={120} />
          <p className="idr-yield">%{yieldPct} yıllık brüt</p>
        </article>
      </div>
      <article className="idr-card">
        <SectionTitle title="5 yıllık değer projeksiyonu" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={extras.projection5y}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatTry(v)} />
            <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}

function HukukiPanel({ property }: { property: PropertyRecord }) {
  const badges = [
    property.titleDeedType,
    property.tapuDurumu,
    property.zoningStatus,
    property.katIrtifaki ? "Kat irtifakı" : undefined,
    property.eligibleForCredit ? "Krediye uygun" : undefined,
  ].filter((x): x is string => Boolean(x));
  const docs = [
    { label: "Tapu örneği", href: "#tapu-pdf" },
    { label: "İmar durumu", href: "#imar-pdf" },
    { label: "Yapı ruhsatı", href: "#ruhsat-pdf" },
  ];
  return (
    <section className="idr-panel idr-panel--hukuki">
      <BadgeRow items={badges} variant="good" />
      <div className="idr-deed-flags">
        <span className={property.mortgage ? "idr-flag is-warn" : "idr-flag"}>İpotek: {property.mortgage ? "Var" : "Yok"}</span>
        <span className={property.lien ? "idr-flag is-warn" : "idr-flag"}>Haciz: {property.lien ? "Var" : "Yok"}</span>
        <span className={property.easement ? "idr-flag is-warn" : "idr-flag"}>Şerh: {property.easement ? "Var" : "Yok"}</span>
      </div>
      <SectionTitle title="Belgeler" />
      <ul className="idr-doc-links">
        {docs.map((d) => (
          <li key={d.href}>
            <a href={d.href} className="idr-doc-link">
              <Download size={16} aria-hidden />
              {d.label}
            </a>
          </li>
        ))}
      </ul>
      <DataTable
        rows={[
          { label: "Ada", value: property.ada ?? "—" },
          { label: "Pafta", value: property.pafta ?? "—" },
          { label: "Parsel", value: property.parcelNo ?? "—" },
          { label: "İskan", value: property.occupancyPermit ? "Var" : "Yok" },
        ]}
      />
    </section>
  );
}

function AiPanel({ property }: { property: PropertyRecord }) {
  const extras = getPropertyUiExtras(property);
  const fair = property.aiPredictedPriceTry ?? priceOf(property);
  const conf = property.aiConfidence != null ? Math.round(property.aiConfidence * 100) : 72;
  return (
    <section className="idr-panel idr-panel--ai">
      <div className="idr-ai-top">
        <article className="idr-card idr-fair-value">
          <h4>Adil değer tahmini</h4>
          <p className="idr-fair-value__price">{fair ? formatTry(fair) : "—"}</p>
          <p className="idr-muted">Güven: %{conf}</p>
        </article>
        <article className="idr-card idr-flex-1">
          <SectionTitle title="5 yıllık fiyat eğrisi" />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={extras.projection5y}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatTry(v)} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>
      <SectionTitle title="Emsal ilanlar" />
      <div className="idr-comparables">
        {extras.comparables.map((c) => (
          <Link key={c.id} to={`/ilan/${c.id}`} className="idr-comp-card">
            <span className="idr-comp-title">{c.title}</span>
            <span>{formatTry(c.priceTry)}</span>
            <span className="idr-muted">{c.sqm} m²</span>
          </Link>
        ))}
      </div>
      <BadgeRow items={extras.personaTags.map((t) => t.label)} variant="neutral" />
    </section>
  );
}

function GaleriPanel({ property }: { property: PropertyRecord }) {
  const images = useMemo(() => {
    const base = normalizeAuctionImages(property.images?.length ? property.images : property.heroImage ? [property.heroImage] : []);
    const out = [...base];
    while (out.length < 8) {
      out.push(base[out.length % Math.max(base.length, 1)] ?? "/images/listing-placeholder.svg");
    }
    return out.slice(0, 8);
  }, [property.heroImage, property.images]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <section className="idr-panel idr-panel--galeri">
      <div className="idr-gallery-grid">
        {images.map((src, i) => (
          <button key={`${src}-${i}`} type="button" className="idr-gallery-item" onClick={() => setLightbox(src)}>
            <ListingCoverImage src={src} alt={`${property.title} galeri ${i + 1}`} className="h-full w-full" />
          </button>
        ))}
      </div>
      <div className="idr-media-rows">
        <article className="idr-card">
          <ImageIcon size={18} aria-hidden />
          <h4>Video tur</h4>
          <p>{property.videoUrl ? <a href={property.videoUrl}>İzle</a> : "Henüz eklenmedi"}</p>
        </article>
        <article className="idr-card">
          <h4>Drone</h4>
          <p>{property.droneVideoUrl ? <a href={property.droneVideoUrl}>İzle</a> : "Henüz eklenmedi"}</p>
        </article>
        <article className="idr-card">
          <h4>360° sanal tur</h4>
          <p>{property.virtualTourUrl ? <a href={property.virtualTourUrl}>Aç</a> : "Henüz eklenmedi"}</p>
        </article>
      </div>
      {lightbox ? (
        <div className="idr-lightbox" role="dialog" aria-modal onClick={() => setLightbox(null)}>
          <ListingCoverImage src={lightbox} alt={property.title} loading="eager" className="max-h-[90vh] max-w-[min(1100px,100%)] rounded-xl" />
        </div>
      ) : null}
    </section>
  );
}

function EkspertizPanel({ property }: { property: PropertyRecord }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const reports = [
    { title: "SPK ekspertiz raporu", url: property.expertisePdfUrl ?? "#ekspertiz" },
    { title: "Piyasa analizi", url: property.marketReportPdfUrl ?? "#piyasa" },
  ];
  if (!property.expertiseValueTry && !property.expertisePdfUrl) {
    return (
      <section className="idr-panel">
        <EmptyExpertise onRequest={() => setOpen(true)} />
        {open ? (
          <form className="idr-modal" onSubmit={(e) => { e.preventDefault(); setOpen(false); }}>
            <h4>Ekspertiz talebi</h4>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad soyad" required />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" required />
            <button type="submit" className="idr-btn idr-btn--primary">Gönder</button>
          </form>
        ) : null}
      </section>
    );
  }
  return (
    <section className="idr-panel idr-panel--ekspertiz">
      <div className="idr-report-cards">
        {reports.map((r) => (
          <article key={r.title} className="idr-card">
            <FileText size={24} aria-hidden />
            <h4>{r.title}</h4>
            <a href={r.url} className="idr-btn idr-btn--ghost">
              <Download size={14} aria-hidden /> İndir
            </a>
          </article>
        ))}
      </div>
      <StatCard title="Ekspertiz değeri" value={property.expertiseValueTry ? formatTry(property.expertiseValueTry) : "—"} />
      <button type="button" className="idr-btn idr-btn--primary" onClick={() => setOpen(true)}>
        Yeni ekspertiz talep et
      </button>
      {open ? (
        <form className="idr-modal" onSubmit={(e) => { e.preventDefault(); setOpen(false); }}>
          <h4>Ekspertiz talebi</h4>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad soyad" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" required />
          <button type="submit" className="idr-btn idr-btn--primary">Gönder</button>
        </form>
      ) : null}
    </section>
  );
}

function TekliflerPanel({ property }: { property: PropertyRecord }) {
  const extras = getPropertyUiExtras(property);
  const d = (property.details ?? {}) as Record<string, unknown>;
  const bids = (d.bids as Array<{ amountTry?: number; bidder?: string; at?: string }>) ?? [];
  const [seconds, setSeconds] = useState(3600 + (property.bidCount ?? 0) * 120);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const rows = bids.length
    ? bids.map((b, i) => ({
        label: b.bidder ?? `Teklif ${i + 1}`,
        value: (
          <span>
            {b.amountTry != null ? formatTry(b.amountTry) : "—"} · Dürüstlük %{extras.fakeBidHonesty[i % extras.fakeBidHonesty.length]}
          </span>
        ),
      }))
    : [{ label: "Teklif", value: "Henüz teklif yok" }];
  return (
    <section className="idr-panel idr-panel--teklifler">
      <article className="idr-card idr-timer">
        <Timer size={22} aria-hidden />
        <span>
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </span>
        <p className="idr-muted">Kapanışa kalan süre (demo)</p>
      </article>
      <DataTable rows={rows} caption="Teklif listesi" />
      <div className="idr-cta-row">
        <Link to="/teklif-al" className="idr-btn idr-btn--primary">
          <Gavel size={16} aria-hidden /> Teklif ver
        </Link>
        <Link to="/kapali-teklif" className="idr-btn idr-btn--ghost">
          Kapalı teklif
        </Link>
      </div>
    </section>
  );
}

export function RichTabPanel({ tab, property, typeExtras: _typeExtras, onGoTab }: RichTabPanelProps) {
  switch (tab) {
    case "GENEL":
      return <GenelPanel property={property} onGoTab={onGoTab} />;
    case "YAPI":
      return <YapiPanel property={property} />;
    case "AFET":
      return <AfetDisasterHub property={property} />;
    case "ALTYAPI":
      return <AltyapiPanel property={property} />;
    case "CEVRE":
      return <CevrePanel property={property} />;
    case "SOSYAL":
      return <SosyalPanel property={property} />;
    case "MALI":
      return <MaliPanel property={property} />;
    case "HUKUKI":
      return <HukukiPanel property={property} />;
    case "AI":
      return <AiPanel property={property} />;
    case "GALERI":
      return <GaleriPanel property={property} />;
    case "EKSPERTIZ":
      return <EkspertizPanel property={property} />;
    case "TEKLIFLER":
      return <TekliflerPanel property={property} />;
    default:
      return null;
  }
}

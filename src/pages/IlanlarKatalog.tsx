import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LayoutGrid, List, Map as MapIcon, Search } from "lucide-react";
import { TAXONOMY, isCategoryKey } from "@/types/property";
import { getAllProperties } from "@/lib/demo-data";
import { PropertyListingCard } from "@/components/ilan/PropertyListingCard";
import {
  EarthquakeFilters,
  propertyMatchesEarthquakeUrlParams,
} from "@/components/search/EarthquakeFilters";
import { getEarthquakeScore } from "@/lib/scoring/getEarthquakeScore";
import { getPropertyPrice } from "@/types/property";
import "@/styles/ilan-pages.css";

const IlanlarMapInner = lazy(() => import("@/pages/ilan/IlanlarMapInner"));

const PAGE_SIZE = 12;

type ViewMode = "list" | "grid" | "map";
type SortKey = "yeni" | "fiyat" | "fiyat-desc" | "m2" | "m2-asc" | "deprem";

function buildTaxonomyPath(cat?: string, sub?: string, type?: string): string {
  if (!cat) return "/ilanlar";
  if (!sub) return `/ilanlar/${cat}`;
  if (!type) return `/ilanlar/${cat}/${sub}`;
  return `/ilanlar/${cat}/${sub}/${type}`;
}

export default function IlanlarKatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>(
    (searchParams.get("gorunum") as ViewMode) || "grid"
  );
  const [loadingList, setLoadingList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("kategori") ?? "";
  const sub = searchParams.get("alt") ?? "";
  const type = searchParams.get("tip") ?? "";
  const minPrice = searchParams.get("minFiyat");
  const maxPrice = searchParams.get("maxFiyat");
  const minSqm = searchParams.get("minM2");
  const maxSqm = searchParams.get("maxM2");
  const city = searchParams.get("sehir");
  const district = searchParams.get("ilce");
  const modality = searchParams.get("modalite");
  const sort = (searchParams.get("siralama") as SortKey) || "yeni";
  const page = Math.max(1, Number(searchParams.get("sayfa") || "1") || 1);

  const hasEarthquakeFilters = useMemo(() => {
    const keys = ["dpMin", "dpMax", "dpFay", "dpZemin", "dpBand"];
    return keys.some((k) => searchParams.get(k));
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "sayfa") next.delete("sayfa");
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = getAllProperties();
    const ql = q.trim().toLocaleLowerCase("tr-TR");
    if (ql) {
      list = list.filter(
        (p) =>
          p.title?.toLocaleLowerCase("tr-TR").includes(ql) ||
          p.city?.toLocaleLowerCase("tr-TR").includes(ql) ||
          p.district?.toLocaleLowerCase("tr-TR").includes(ql) ||
          p.id.includes(ql)
      );
    }
    if (category && isCategoryKey(category)) {
      list = list.filter((p) => p.taxonomy.category === category);
    }
    if (sub) list = list.filter((p) => p.taxonomy.sub === sub);
    if (type) list = list.filter((p) => p.taxonomy.type === type);
    if (modality) list = list.filter((p) => p.marketingMode === modality);
    if (minPrice) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) list = list.filter((p) => (getPropertyPrice(p) ?? 0) >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) list = list.filter((p) => (getPropertyPrice(p) ?? Infinity) <= max);
    }
    if (minSqm) {
      const min = Number(minSqm);
      if (!Number.isNaN(min)) list = list.filter((p) => (p.grossSqm ?? p.landSqm ?? 0) >= min);
    }
    if (maxSqm) {
      const max = Number(maxSqm);
      if (!Number.isNaN(max)) list = list.filter((p) => (p.grossSqm ?? p.landSqm ?? 0) <= max);
    }
    if (city) {
      list = list.filter((p) => p.city?.toLocaleLowerCase("tr-TR").includes(city.toLocaleLowerCase("tr-TR")));
    }
    if (district) {
      list = list.filter((p) =>
        p.district?.toLocaleLowerCase("tr-TR").includes(district.toLocaleLowerCase("tr-TR"))
      );
    }
    if (hasEarthquakeFilters) {
      list = list.filter((p) => propertyMatchesEarthquakeUrlParams(p, searchParams));
    }

    const sorted = [...list];
    if (sort === "fiyat") sorted.sort((a, b) => (getPropertyPrice(a) ?? 0) - (getPropertyPrice(b) ?? 0));
    else if (sort === "fiyat-desc") sorted.sort((a, b) => (getPropertyPrice(b) ?? 0) - (getPropertyPrice(a) ?? 0));
    else if (sort === "m2") sorted.sort((a, b) => (b.grossSqm ?? 0) - (a.grossSqm ?? 0));
    else if (sort === "m2-asc") sorted.sort((a, b) => (a.grossSqm ?? 0) - (b.grossSqm ?? 0));
    else if (sort === "deprem") {
      sorted.sort((a, b) => getEarthquakeScore(b).totalScore - getEarthquakeScore(a).totalScore);
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    }
    return sorted;
  }, [
    q,
    category,
    sub,
    type,
    modality,
    minPrice,
    maxPrice,
    minSqm,
    maxSqm,
    city,
    district,
    sort,
    hasEarthquakeFilters,
    searchParams,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const catMeta = category && isCategoryKey(category) ? TAXONOMY[category] : null;
  const subOptions = catMeta?.subcategories ?? [];
  const typeOptions = subOptions.find((s) => s.key === sub)?.types ?? [];

  const setViewMode = (v: ViewMode) => {
    setView(v);
    updateParam("gorunum", v);
  };

  const activeFilters = useMemo(
    () =>
      [
        category ? { key: "kategori", label: "Kategori", value: category } : null,
        sub ? { key: "alt", label: "Alt kategori", value: sub } : null,
        type ? { key: "tip", label: "Tip", value: type } : null,
        modality ? { key: "modalite", label: "Modalite", value: modality } : null,
        minPrice ? { key: "minFiyat", label: "Min fiyat", value: `₺${Number(minPrice).toLocaleString("tr-TR")}` } : null,
        maxPrice ? { key: "maxFiyat", label: "Max fiyat", value: `₺${Number(maxPrice).toLocaleString("tr-TR")}` } : null,
        minSqm ? { key: "minM2", label: "Min m²", value: minSqm } : null,
        maxSqm ? { key: "maxM2", label: "Max m²", value: maxSqm } : null,
        city ? { key: "sehir", label: "Şehir", value: city } : null,
        district ? { key: "ilce", label: "İlçe", value: district } : null,
      ].filter((item): item is { key: string; label: string; value: string } => Boolean(item)),
    [category, sub, type, modality, minPrice, maxPrice, minSqm, maxSqm, city, district]
  );

  useEffect(() => {
    setLoadingList(true);
    const timer = window.setTimeout(() => setLoadingList(false), 220);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="ilan-landing ilan-katalog" data-testid="ilan-katalog">
      <header className="ilan-landing__hero">
        <nav className="ilan-landing__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Ana sayfa</Link>
          <span>/</span>
          <span>İlan katalogu</span>
        </nav>
        <h1>Gayrimenkul ilan katalogu</h1>
        <p className="ilan-landing__hero-sub">
          {filtered.length} demo ilan · Deprem skoru ve mahalle verisi entegre
        </p>
        <label className="ilan-katalog__search">
          <Search className="h-5 w-5" aria-hidden />
          <input
            type="search"
            placeholder="Adres, başlık, il, ilan no..."
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
            style={{ fontSize: "16px" }}
          />
        </label>
      </header>

      <div className="ilan-katalog__toolbar">
        <div className="ilan-katalog__view-toggle" role="group" aria-label="Görünüm">
          <button type="button" aria-pressed={view === "list"} className={view === "list" ? "is-active" : ""} onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" aria-hidden /> Liste
          </button>
          <button type="button" aria-pressed={view === "grid"} className={view === "grid" ? "is-active" : ""} onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" aria-hidden /> Grid
          </button>
          <button type="button" aria-pressed={view === "map"} className={view === "map" ? "is-active" : ""} onClick={() => setViewMode("map")}>
            <MapIcon className="h-4 w-4" aria-hidden /> Harita
          </button>
        </div>
        <button type="button" className="ilan-katalog__filters-toggle" onClick={() => setShowFilters((prev) => !prev)}>
          {showFilters ? "Filtreleri gizle" : "Filtreleri göster"}
        </button>
        <label>
          <span className="sr-only">Sıralama</span>
          <select value={sort} onChange={(e) => updateParam("siralama", e.target.value)}>
            <option value="yeni">En yeni</option>
            <option value="fiyat">Fiyat (artan)</option>
            <option value="fiyat-desc">Fiyat (azalan)</option>
            <option value="m2">m² (büyükten)</option>
            <option value="m2-asc">m² (küçükten)</option>
            <option value="deprem">Deprem güvenliği</option>
          </select>
        </label>
      </div>
      <div className="ilan-katalog__result-meta" aria-live="polite">
        <span>{filtered.length} sonuç bulundu</span>
      </div>
      {activeFilters.length > 0 ? (
        <div className="ilan-katalog__active-filters" aria-label="Aktif filtreler">
          {activeFilters.map((filter) => (
            <button key={filter.key} type="button" onClick={() => updateParam(filter.key, "")}>
              {filter.label}: {filter.value} ×
            </button>
          ))}
          <button type="button" className="ilan-katalog__clear-all" onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}>
            Tümünü temizle
          </button>
        </div>
      ) : null}

      <div className="ilan-landing__layout">
        <aside className={`ilan-landing__filters ${showFilters ? "is-open" : ""}`} aria-label="Filtreler">
          <h2>Filtreler</h2>
          <label>
            <span>Kategori</span>
            <select value={category} onChange={(e) => updateParam("kategori", e.target.value)}>
              <option value="">Tümü</option>
              {Object.values(TAXONOMY).map((c) => (
                <option key={c.key} value={c.key}>
                  {c.labelTR}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Alt kategori</span>
            <select value={sub} disabled={!category} onChange={(e) => updateParam("alt", e.target.value)}>
              <option value="">Tümü</option>
              {subOptions.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.labelTR}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Tip</span>
            <select value={type} disabled={!sub} onChange={(e) => updateParam("tip", e.target.value)}>
              <option value="">Tümü</option>
              {typeOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.labelTR}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Modalite</span>
            <select value={modality ?? ""} onChange={(e) => updateParam("modalite", e.target.value)}>
              <option value="">Tümü</option>
              <option value="listing_only">Satılık / kiralık</option>
              <option value="auction">İhale</option>
              <option value="sealed_offers">Kapalı teklif</option>
            </select>
          </label>
          <label>
            <span>Min fiyat</span>
            <input type="number" value={minPrice ?? ""} onChange={(e) => updateParam("minFiyat", e.target.value)} />
          </label>
          <label>
            <span>Max fiyat</span>
            <input type="number" value={maxPrice ?? ""} onChange={(e) => updateParam("maxFiyat", e.target.value)} />
          </label>
          <label>
            <span>Min m²</span>
            <input type="number" value={minSqm ?? ""} onChange={(e) => updateParam("minM2", e.target.value)} />
          </label>
          <label>
            <span>Max m²</span>
            <input type="number" value={maxSqm ?? ""} onChange={(e) => updateParam("maxM2", e.target.value)} />
          </label>
          <label>
            <span>Şehir</span>
            <input type="search" value={city ?? ""} onChange={(e) => updateParam("sehir", e.target.value)} style={{ fontSize: "16px" }} />
          </label>
          <label>
            <span>İlçe / mahalle</span>
            <input type="search" value={district ?? ""} onChange={(e) => updateParam("ilce", e.target.value)} style={{ fontSize: "16px" }} />
          </label>
          <EarthquakeFilters searchParams={searchParams} onChangeKey={updateParam} />
          {category ? (
            <p className="ilan-katalog__taxonomy-link">
              <Link to={buildTaxonomyPath(category, sub || undefined, type || undefined)}>
                Kategori sayfasına git →
              </Link>
            </p>
          ) : null}
        </aside>

        <section className="ilan-landing__grid-wrap" aria-label="İlan listesi">
          {view === "map" ? (
            <Suspense fallback={<p className="ilan-landing__empty">Harita yükleniyor…</p>}>
              <IlanlarMapInner properties={filtered} />
            </Suspense>
          ) : loadingList ? (
            <div className="ilan-katalog__skeleton" aria-live="polite" aria-label="İlanlar yükleniyor">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`ilan-skeleton-${idx}`} className="ilan-katalog__skeleton-card">
                  <div className="ilan-katalog__skeleton-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ))}
            </div>
          ) : pageItems.length > 0 ? (
            <div className={view === "list" ? "ilan-katalog__list" : "ilan-landing__grid"}>
              {pageItems.map((property) => (
                <PropertyListingCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="ilan-landing__empty">
              <p>Bu filtrelerle eşleşen ilan bulunamadı.</p>
              <p className="text-xs text-slate-500">Aramayı genişletin veya filtreleri sıfırlayıp tekrar deneyin.</p>
              <button
                type="button"
                onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                className="ilan-card__watch"
              >
                Filtreleri temizle
              </button>
            </div>
          )}

          {view !== "map" && totalPages > 1 ? (
            <nav className="ilan-katalog__pager" aria-label="Sayfalama">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => updateParam("sayfa", String(safePage - 1))}
              >
                Önceki
              </button>
              <span>
                Sayfa {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => updateParam("sayfa", String(safePage + 1))}
              >
                Sonraki
              </button>
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}

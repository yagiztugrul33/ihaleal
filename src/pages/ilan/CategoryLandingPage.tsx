import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  TAXONOMY,
  isCategoryKey,
  type CategoryKey,
} from "@/types/property";
import {
  getAllProperties,
  getPropertiesByTaxonomy,
} from "@/lib/demo-data";
import { PropertyListingCard } from "@/components/ilan/PropertyListingCard";
import {
  EarthquakeFilters,
  propertyMatchesEarthquakeUrlParams,
} from "@/components/search/EarthquakeFilters";
import { ensureEarthquakeScore } from "@/lib/property/earthquakeScore";
import { getPropertyPrice } from "@/types/property";
import "@/styles/ilan-pages.css";
import "@/styles/afet-disaster-hub.css";

export interface CategoryLandingPageProps {
  category?: string;
  sub?: string;
  type?: string;
}

type SortKey = "fiyat" | "m2" | "yeni" | "deprem";

const CATEGORY_BULLETS: Partial<Record<CategoryKey, string[]>> = {
  konut: [
    "Oda sayısı, net/brüt m² ve bina yaşı",
    "Site aidatı, otopark ve sosyal tesisler",
    "Tapu durumu ve krediye uygunluk",
    "Mahalle ulaşım ve okul/hastane yakınlığı",
  ],
  ticari: [
    "Kira getirisi ve kiracı profili",
    "Cephe genişliği ve vitrin görünürlüğü",
    "Kat konumu ve bina sınıfı",
    "Otopark ve ziyaretçi trafiği",
  ],
  endustri: [
    "Üretim alanı, tavan yüksekliği ve vinç kapasitesi",
    "OSB konumu ve lojistik erişim",
    "Elektrik gücü (kVA) ve yükleme rampası",
    "Çevre izinleri ve yangın onayı",
  ],
  konaklama: [
    "Doluluk oranı ve oda/yatak kapasitesi",
    "Marka, lisans ve işletme modeli",
    "Spa, restoran ve konferans altyapısı",
    "Yıllık ciro ve EBITDA göstergeleri",
  ],
  arsa: [
    "İmar durumu, emsal ve gabari",
    "Yol cephesi ve köşe parsel avantajı",
    "Ada/parsel ve ifraz imkanı",
    "Altyapı (elektrik, su) hazırlığı",
  ],
  komple: [
    "Toplam m², birim sayısı ve doluluk",
    "Karma kullanım ve kiracı karması",
    "Asansör, otopark ve ortak alanlar",
    "Yıllık kira geliri potansiyeli",
  ],
  altyapi: [
    "Kurulu güç ve yıllık üretim kapasitesi",
    "Şebeke bağlantısı ve PPA durumu",
    "Arazi kira süresi ve YEKDEM uyumu",
    "Devreye alma tarihi ve inverter markası",
  ],
  devren: [
    "Aylık ciro ve kârlılık",
    "Kalan kira süresi ve ekipman dahil mi",
    "Marka/franchise hakları",
    "Devir gerekçesi ve sezon etkisi",
  ],
};

const DEFAULT_BULLETS = [
  "Konum, ulaşım ve çevre analizi",
  "Fiyat/m² ve piyasa karşılaştırması",
  "Hukuki durum ve tapu kontrolü",
  "Yatırım getirisi ve risk profili",
];

const FAQ_ITEMS = [
  {
    q: "Bu kategorideki ilanlar doğrulanmış mı?",
    a: "Demo katalogda tüm kayıtlar platform şemasına uygun üretilmiştir; canlı ortamda SPK ekspertiz ve KYC adımları zorunlu olacaktır.",
  },
  {
    q: "Filtreler URL ile paylaşılabilir mi?",
    a: "Evet. Seçtiğiniz kategori, alt kategori, tip ve filtreler adres çubuğunda saklanır; link paylaşımı aynı sonuçları gösterir.",
  },
  {
    q: "Teklif veya ihaleye nasıl katılırım?",
    a: "İlan detayından teklif verin veya canlı ihale modülüne geçin. Kimlik doğrulama ve depozito kuralları ilan tipine göre değişir.",
  },
];

const RELATED_MODULES = [
  { label: "GES arazi analizi", href: "/arastirma/ges" },
  { label: "Parsel zekası", href: "/arastirma/parsel" },
  { label: "Anında teklif (iBuyer)", href: "/aninda-teklif" },
  { label: "Takas eşleştirme", href: "/takas" },
  { label: "Yatırım savaş odası", href: "/arastirma/war-room" },
];

function resolveTitle(category?: string, sub?: string, type?: string): string {
  if (category && isCategoryKey(category)) {
    const cat = TAXONOMY[category];
    if (sub) {
      const subMeta = cat.subcategories.find((s) => s.key === sub);
      if (subMeta && type) {
        const typeMeta = subMeta.types.find((t) => t.key === type);
        if (typeMeta) return `${typeMeta.labelTR} ilanları`;
        return `${subMeta.labelTR} ilanları`;
      }
      if (subMeta) return `${subMeta.labelTR} ilanları`;
    }
    return `${cat.labelTR} ilanları`;
  }
  return "Tüm ilanlar";
}

function buildPath(category?: string, sub?: string, type?: string): string {
  if (!category) return "/ilanlar";
  if (!sub) return `/ilanlar/${category}`;
  if (!type) return `/ilanlar/${category}/${sub}`;
  return `/ilanlar/${category}/${sub}/${type}`;
}

export default function CategoryLandingPage({
  category,
  sub,
  type,
}: CategoryLandingPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSort = searchParams.get("siralama") as SortKey | null;
  const sort: SortKey =
    rawSort === "fiyat" || rawSort === "m2" || rawSort === "yeni" || rawSort === "deprem"
      ? rawSort
      : "yeni";

  const hasEarthquakeFilters = useMemo(() => {
    for (const k of searchParams.keys()) {
      if (k.startsWith("dp")) return true;
    }
    return false;
  }, [searchParams]);
  const minPrice = searchParams.get("minFiyat");
  const maxPrice = searchParams.get("maxFiyat");
  const minSqm = searchParams.get("minM2");
  const room = searchParams.get("oda");
  const city = searchParams.get("sehir");

  const title = resolveTitle(category, sub, type);
  const bullets =
    (category && isCategoryKey(category) ? CATEGORY_BULLETS[category] : undefined) ??
    DEFAULT_BULLETS;

  const categoryOptions = useMemo(
    () =>
      Object.values(TAXONOMY).map((c) => ({
        key: c.key,
        label: c.labelTR,
      })),
    []
  );

  const subOptions = useMemo(() => {
    if (!category || !isCategoryKey(category)) return [];
    return TAXONOMY[category].subcategories.map((s) => ({
      key: s.key,
      label: s.labelTR,
    }));
  }, [category]);

  const typeOptions = useMemo(() => {
    if (!category || !isCategoryKey(category) || !sub) return [];
    const subMeta = TAXONOMY[category].subcategories.find((s) => s.key === sub);
    return subMeta?.types.map((t) => ({ key: t.key, label: t.labelTR })) ?? [];
  }, [category, sub]);

  const filtered = useMemo(() => {
    let list =
      category && isCategoryKey(category)
        ? getPropertiesByTaxonomy(category, sub, type)
        : getAllProperties();

    if (minPrice) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) {
        list = list.filter((p) => (getPropertyPrice(p) ?? 0) >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) {
        list = list.filter((p) => (getPropertyPrice(p) ?? Infinity) <= max);
      }
    }
    if (minSqm) {
      const min = Number(minSqm);
      if (!Number.isNaN(min)) {
        list = list.filter((p) => (p.grossSqm ?? p.landSqm ?? 0) >= min);
      }
    }
    if (room) {
      list = list.filter((p) => p.roomCount === room);
    }
    if (city) {
      list = list.filter((p) => p.city?.toLowerCase().includes(city.toLowerCase()));
    }

    if (hasEarthquakeFilters) {
      list = list.filter((p) => propertyMatchesEarthquakeUrlParams(p, searchParams));
    }

    const sorted = [...list];
    if (sort === "fiyat") {
      sorted.sort((a, b) => (getPropertyPrice(a) ?? 0) - (getPropertyPrice(b) ?? 0));
    } else if (sort === "m2") {
      sorted.sort(
        (a, b) => (b.grossSqm ?? b.landSqm ?? 0) - (a.grossSqm ?? a.landSqm ?? 0)
      );
    } else if (sort === "deprem") {
      sorted.sort(
        (a, b) =>
          ensureEarthquakeScore(b).composite - ensureEarthquakeScore(a).composite
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    }

    return sorted.slice(0, 12);
  }, [
    category,
    sub,
    type,
    minPrice,
    maxPrice,
    minSqm,
    room,
    city,
    sort,
    hasEarthquakeFilters,
    searchParams,
  ]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const goTaxonomy = (nextCat?: string, nextSub?: string, nextType?: string) => {
    navigate(buildPath(nextCat, nextSub, nextType));
  };

  const showRoomFilter = category === "konut" || !category;
  const showSqmFilter =
    category === "endustri" || category === "arsa" || category === "komple" || !category;

  return (
    <div className="ilan-landing" data-testid="ilan-landing">
      <header className="ilan-landing__hero">
        <nav className="ilan-landing__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Ana sayfa</Link>
          <span>/</span>
          <Link to="/ilanlar">İlanlar</Link>
          {category ? (
            <>
              <span>/</span>
              <span>{title}</span>
            </>
          ) : null}
        </nav>
        <h1>{title}</h1>
        <p className="ilan-landing__hero-sub">
          {filtered.length} ilan listeleniyor · Demo katalog
        </p>
        <ul className="ilan-landing__bullets">
          <li className="ilan-landing__bullets-title">Bu kategoride nelere bakılır</li>
          {bullets.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </header>

      <div className="ilan-landing__cascade">
        <label>
          <span>Kategori</span>
          <select
            value={category ?? ""}
            onChange={(e) => goTaxonomy(e.target.value || undefined)}
          >
            <option value="">Tümü</option>
            {categoryOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Alt kategori</span>
          <select
            value={sub ?? ""}
            disabled={!category}
            onChange={(e) => goTaxonomy(category, e.target.value || undefined)}
          >
            <option value="">Tümü</option>
            {subOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tip</span>
          <select
            value={type ?? ""}
            disabled={!sub}
            onChange={(e) => goTaxonomy(category, sub, e.target.value || undefined)}
          >
            <option value="">Tümü</option>
            {typeOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sıralama</span>
          <select
            value={sort}
            onChange={(e) => updateParam("siralama", e.target.value)}
          >
            <option value="yeni">En yeni</option>
            <option value="fiyat">Fiyat (artan)</option>
            <option value="m2">m² (büyükten küçüğe)</option>
            <option value="deprem">Deprem puani (yuksekten)</option>
          </select>
        </label>
      </div>

      <div className="ilan-landing__layout">
        <aside className="ilan-landing__filters" aria-label="Filtreler">
          <h2>Filtreler</h2>
          <label>
            <span>Min fiyat (₺)</span>
            <input
              type="number"
              inputMode="numeric"
              value={minPrice ?? ""}
              onChange={(e) => updateParam("minFiyat", e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            <span>Max fiyat (₺)</span>
            <input
              type="number"
              inputMode="numeric"
              value={maxPrice ?? ""}
              onChange={(e) => updateParam("maxFiyat", e.target.value)}
              placeholder="Sınırsız"
            />
          </label>
          {showSqmFilter ? (
            <label>
              <span>Min m²</span>
              <input
                type="number"
                inputMode="numeric"
                value={minSqm ?? ""}
                onChange={(e) => updateParam("minM2", e.target.value)}
                placeholder="0"
              />
            </label>
          ) : null}
          {showRoomFilter ? (
            <label>
              <span>Oda</span>
              <select
                value={room ?? ""}
                onChange={(e) => updateParam("oda", e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
              </select>
            </label>
          ) : null}
          <label>
            <span>Şehir</span>
            <input
              type="search"
              value={city ?? ""}
              onChange={(e) => updateParam("sehir", e.target.value)}
              placeholder="İstanbul, Ankara…"
            />
          </label>

          <EarthquakeFilters
            searchParams={searchParams}
            onChangeKey={(key, value) => updateParam(key, value)}
          />
        </aside>

        <section className="ilan-landing__grid-wrap" aria-label="İlan listesi">
          {filtered.length > 0 ? (
            <div className="ilan-landing__grid">
              {filtered.map((property) => (
                <PropertyListingCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="ilan-landing__empty">
              <p>Bu filtrelerle eşleşen ilan bulunamadı.</p>
              <Link to="/destek">Destek ile iletişime geçin →</Link>
            </div>
          )}
        </section>
      </div>

      <section className="ilan-landing__faq" aria-labelledby="ilan-faq-title">
        <h2 id="ilan-faq-title">Sık sorulan sorular</h2>
        <div className="ilan-landing__faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="ilan-landing__faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ilan-landing__modules" aria-labelledby="ilan-modules-title">
        <h2 id="ilan-modules-title">İlgili modüller</h2>
        <div className="ilan-landing__modules-links">
          {RELATED_MODULES.map((mod) => (
            <Link key={mod.href} to={mod.href}>
              {mod.label} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

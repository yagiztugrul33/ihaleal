import { useMemo, useState } from "react";
import { Bell, Crosshair, MapPin, Radar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { PropertyRecord } from "@/types/property";
import { getPropertyPrice } from "@/types/property";
import { getEarthquakeScore } from "@/lib/scoring/getEarthquakeScore";

interface OpportunityRadarProps {
  properties: PropertyRecord[];
}

type Point = {
  id: string;
  title: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  distanceKm: number;
  dealType: PropertyRecord["dealType"];
  marketingMode: PropertyRecord["marketingMode"];
  aiScore: number;
  price: number;
};

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const cc = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return earthRadiusKm * cc;
}

function formatTry(value: number): string {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

export function OpportunityRadar({ properties }: OpportunityRadarProps) {
  const cityCenters = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; count: number }>();
    properties.forEach((p) => {
      if (!p.city || p.latitude == null || p.longitude == null) return;
      const entry = map.get(p.city) ?? { lat: 0, lng: 0, count: 0 };
      entry.lat += p.latitude;
      entry.lng += p.longitude;
      entry.count += 1;
      map.set(p.city, entry);
    });
    return Array.from(map.entries())
      .map(([city, value]) => ({
        city,
        lat: value.lat / value.count,
        lng: value.lng / value.count,
      }))
      .sort((a, b) => a.city.localeCompare(b.city, "tr"));
  }, [properties]);

  const [selectedCity, setSelectedCity] = useState<string>(cityCenters[0]?.city ?? "İstanbul");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState("Manuel bölge seçimi aktif.");
  const [pushMessage, setPushMessage] = useState("Push demo kapalı.");

  const currentCenter = useMemo(() => {
    const fallback = cityCenters.find((item) => item.city === selectedCity) ?? cityCenters[0];
    if (!fallback) return { lat: 39.0, lng: 35.0, city: selectedCity || "Türkiye" };
    if (userCoords) return { lat: userCoords.lat, lng: userCoords.lng, city: selectedCity || fallback.city };
    return { lat: fallback.lat, lng: fallback.lng, city: selectedCity || fallback.city };
  }, [cityCenters, selectedCity, userCoords]);

  const nearby = useMemo<Point[]>(() => {
    return properties
      .filter((p): p is PropertyRecord & { latitude: number; longitude: number } => p.latitude != null && p.longitude != null)
      .map((p) => {
        const distanceKm = calcDistanceKm(currentCenter.lat, currentCenter.lng, p.latitude, p.longitude);
        return {
          id: p.id,
          title: p.title,
          city: p.city ?? "—",
          district: p.district ?? "—",
          lat: p.latitude,
          lng: p.longitude,
          distanceKm,
          dealType: p.dealType,
          marketingMode: p.marketingMode,
          aiScore: p.aiInvestmentScore ?? 60,
          price: getPropertyPrice(p) ?? 0,
        };
      })
      .filter((point) => point.distanceKm <= 80)
      .sort((a, b) => {
        const aw = a.dealType === "transfer" ? -15 : 0;
        const bw = b.dealType === "transfer" ? -15 : 0;
        return a.distanceKm + aw - (b.distanceKm + bw);
      })
      .slice(0, 8);
  }, [currentCenter.lat, currentCenter.lng, properties]);

  const nearStats = useMemo(() => {
    const sale = nearby.filter((row) => row.dealType === "sale").length;
    const rent = nearby.filter((row) => row.dealType === "rent").length;
    const transfer = nearby.filter((row) => row.dealType === "transfer").length;
    const auctions = nearby.filter((row) => row.marketingMode === "auction").length;
    return { sale, rent, transfer, auctions };
  }, [nearby]);

  const intelligence = useMemo(() => {
    const source = properties.filter((p) => p.city === currentCenter.city).slice(0, 12);
    if (source.length === 0) return { safety: 0, investment: 0, avgPrice: 0 };
    const safety =
      source.reduce((acc, item) => acc + getEarthquakeScore(item).totalScore, 0) / source.length;
    const investment =
      source.reduce((acc, item) => acc + (item.aiInvestmentScore ?? 0), 0) / source.length;
    const avgPrice =
      source.reduce((acc, item) => acc + (getPropertyPrice(item) ?? 0), 0) / source.length;
    return { safety, investment, avgPrice };
  }, [currentCenter.city, properties]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Tarayıcı konum servisini desteklemiyor; manuel seçim devam ediyor.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        const nearestCity =
          cityCenters
            .map((city) => ({
              city: city.city,
              distance: calcDistanceKm(lat, lng, city.lat, city.lng),
            }))
            .sort((a, b) => a.distance - b.distance)[0]?.city ?? selectedCity;
        setSelectedCity(nearestCity);
        setLocationMessage(`Konum izni verildi. Şu an buradasın: ${nearestCity}.`);
      },
      () => setLocationMessage("Konum izni reddedildi. Manuel bölge seçimiyle devam ediliyor."),
      { enableHighAccuracy: false, timeout: 7000 },
    );
  };

  const requestPushDemo = async () => {
    if (!("Notification" in window)) {
      setPushMessage("Tarayıcı bildirim API'sini desteklemiyor.");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      setPushMessage("Bildirim izni verilmedi. Demo beklemede.");
      return;
    }
    const message = `Yakın radar güncellemesi: ${nearStats.auctions} ihale ve ${nearStats.transfer} devren fırsatı yakında.`;
    setPushMessage(message);
    window.setTimeout(() => {
      new Notification("İhaleal Radar Demo", { body: message });
    }, 900);
  };

  const mapBounds = useMemo(() => {
    const points = nearby.length ? nearby : [];
    const latValues = [currentCenter.lat, ...points.map((p) => p.lat)];
    const lngValues = [currentCenter.lng, ...points.map((p) => p.lng)];
    return {
      minLat: Math.min(...latValues),
      maxLat: Math.max(...latValues),
      minLng: Math.min(...lngValues),
      maxLng: Math.max(...lngValues),
    };
  }, [currentCenter.lat, currentCenter.lng, nearby]);

  const project = (lat: number, lng: number) => {
    const width = 360;
    const height = 200;
    const lngSpan = Math.max(0.01, mapBounds.maxLng - mapBounds.minLng);
    const latSpan = Math.max(0.01, mapBounds.maxLat - mapBounds.minLat);
    const x = 18 + ((lng - mapBounds.minLng) / lngSpan) * (width - 36);
    const y = 18 + ((mapBounds.maxLat - lat) / latSpan) * (height - 36);
    return { x, y };
  };

  return (
    <section className="ilan-radar" data-testid="nearby-opportunity-radar">
      <div className="ilan-radar__hero">
        <p className="ilan-radar__hero-badge">Konum Fırsat Radarı · Demo</p>
        <h2>Yakındaki fırsatları kaçırma: teklif penceresi kapanmadan harekete geç.</h2>
        <p className="ilan-radar__hero-lead">
          Bu radar modeli, konum sinyali + ihale yoğunluğu + devren fırsatlarını tek ekranda birleştirir. Demo akışında
          Türkiye pazarında benzeri az görülen "yakına göre öncelik" deneyimini simüle eder.
        </p>
      </div>
      <header className="ilan-radar__header">
        <div>
          <p className="ilan-radar__eyebrow">Konum Bazlı Fırsat Radarı</p>
          <h2>Yakınımdaki Fırsatlar</h2>
          <p className="ilan-radar__sub">{locationMessage}</p>
          <p className="mt-1 text-[11px] text-cyan-200">
            Geolocation + yakın ilanlar aktif (demo): anlık konuma göre fırsatlar sıralanır.
          </p>
        </div>
        <div className="ilan-radar__controls">
          <button type="button" onClick={requestLocation}>
            <Crosshair className="h-4 w-4" /> Konum izni ver
          </button>
          <label>
            Bölge
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              {cityCenters.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => void requestPushDemo()}>
            <Bell className="h-4 w-4" /> Push demo
          </button>
        </div>
      </header>

      <div className="ilan-radar__explain-grid">
        <article>
          <h3>Nasıl çalışır?</h3>
          <ul>
            <li>Konumu alır, şehir merkezini ve sana en yakın ilanları 80 km içinde sıralar.</li>
            <li>Devren + ihale fırsatlarını mesafe avantajı ile öne taşır.</li>
            <li>Deprem güvenliği ve AI yatırım skorunu aynı satırda gösterir.</li>
          </ul>
        </article>
        <article>
          <h3>Neden benzersiz?</h3>
          <ul>
            <li>Katalog, harita ve fırsat alarmını tek panelde birleştirir.</li>
            <li>E-posta yerine anlık mobil bildirim hedefiyle daha hızlı aksiyon sağlar.</li>
            <li>Karar ekranında sadece fiyat değil, mesafe + risk + fırsat yoğunluğu birlikte görünür.</li>
          </ul>
        </article>
      </div>

      <div className="ilan-radar__stats">
        <article>
          <p>Şu an buradasın</p>
          <strong>{currentCenter.city}</strong>
          <span>Yakında {nearby.length} aktif fırsat</span>
        </article>
        <article>
          <p>Yakın dağılım</p>
          <strong>
            {nearStats.sale} satılık · {nearStats.rent} kiralık
          </strong>
          <span>
            {nearStats.transfer} devren · {nearStats.auctions} ihale
          </span>
        </article>
        <article>
          <p>Konum zekası</p>
          <strong>Güvenlik {intelligence.safety.toFixed(1)} / 100</strong>
          <span>
            Yatırım {intelligence.investment.toFixed(1)} · Ort. {formatTry(intelligence.avgPrice)}
          </span>
        </article>
        <article>
          <p>Bildirim demosu</p>
          <strong>{pushMessage}</strong>
          <span>Anlık konum bildirimleri yakında mobil uygulamada.</span>
        </article>
      </div>

      <div className="ilan-radar__layout">
        <article className="ilan-radar__map">
          <p className="ilan-radar__map-title">
            <Radar className="h-4 w-4" /> Buradasın + çevre pinleri
          </p>
          <svg viewBox="0 0 360 200" role="img" aria-label="Yakın fırsatlar mini haritası">
            <rect x="0" y="0" width="360" height="200" rx="14" fill="rgba(2,6,23,0.5)" />
            {nearby.map((point) => {
              const pos = project(point.lat, point.lng);
              return (
                <g key={point.id}>
                  <circle cx={pos.x} cy={pos.y} r="5" fill="rgba(56,189,248,0.95)" />
                  <text x={pos.x + 7} y={pos.y - 7} fill="#e2e8f0" fontSize="10">
                    {Math.round(point.distanceKm)} km
                  </text>
                </g>
              );
            })}
            {(() => {
              const user = project(currentCenter.lat, currentCenter.lng);
              return (
                <g>
                  <circle cx={user.x} cy={user.y} r="7" fill="rgba(234,179,8,0.95)" />
                  <text x={user.x + 9} y={user.y + 4} fill="#fef08a" fontSize="11" fontWeight="700">
                    Buradasın
                  </text>
                </g>
              );
            })()}
          </svg>
        </article>
        <article className="ilan-radar__list">
          <p className="ilan-radar__map-title">
            <Sparkles className="h-4 w-4" /> Yakındaki fırsat listesi
          </p>
          <div className="ilan-radar__items">
            {nearby.map((point) => (
              <Link key={point.id} to={`/ilan/${point.id}`} className="ilan-radar__item">
                <div>
                  <p>{point.title}</p>
                  <span>
                    <MapPin className="h-3.5 w-3.5" /> {point.district}, {point.city}
                  </span>
                  {point.dealType === "transfer" ? <span>Devren öncelikli fırsat</span> : null}
                </div>
                <div className="ilan-radar__item-meta">
                  <strong>{formatTry(point.price)}</strong>
                  <small>
                    {point.distanceKm.toFixed(1)} km · AI {Math.round(point.aiScore)}
                  </small>
                </div>
              </Link>
            ))}
            {nearby.length === 0 ? (
              <p className="ilan-radar__empty">Bu bölgede 80 km içinde demo fırsat bulunamadı.</p>
            ) : null}
          </div>
        </article>
      </div>
      <div className="ilan-radar__mobile-promise">
        <p>
          Faz B mobil planı (demo): push tetikleyicileriyle e-posta kanallarına göre 3-10x etkileşim hedeflenir. KVKK
          kapsamında konum verisi yalnızca izinli ve sınırlı amaçla işlenmelidir.
        </p>
      </div>
      <p className="ilan-radar__footnote">
        Dürüst not: Konum, mesafe ve bildirim akışı demo/simülasyon verisiyle çalışır; canlı kararlarda saha doğrulaması
        ve resmi veri kontrolleri zorunludur.
      </p>
    </section>
  );
}

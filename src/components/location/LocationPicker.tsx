import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TR_PROVINCES, findProvince } from "@/data/trProvinces";
import { MapPin, Loader2 } from "lucide-react";

// Leaflet default icon fix (Vite/webpack)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface LocationValue {
  /** İl adı — Türkçe */
  province?: string;
  /** İlçe adı — Türkçe (opsiyonel) */
  district?: string;
  /** Pin koordinatı (WGS84) */
  lat?: number;
  lng?: number;
  /** Açık adres (Nominatim'den ya da elle) */
  formattedAddress?: string;
}

interface LocationPickerProps {
  value?: LocationValue;
  onChange: (value: LocationValue) => void;
  /** Harita göster (varsayılan: true) */
  showMap?: boolean;
  /** Adres arama göster (varsayılan: false — opsiyonel feature) */
  showSearch?: boolean;
  /** Test id */
  testId?: string;
  /** Disabled mod */
  disabled?: boolean;
}

const DEFAULT_CENTER: [number, number] = [39.0, 35.0]; // Türkiye merkezi
const DEFAULT_ZOOM = 6;
const PROVINCE_ZOOM = 11;
const DISTRICT_ZOOM = 13;

/** Pin sürüklenince ve haritaya tıklayınca koordinatı günceller. */
function PinHandler({ lat, lng, onSelect }: { lat?: number; lng?: number; onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  if (lat === undefined || lng === undefined) return null;
  return (
    <Marker
      position={[lat, lng]}
      draggable
      eventHandlers={{
        dragend(e) {
          const m = e.target as L.Marker;
          const p = m.getLatLng();
          onSelect(p.lat, p.lng);
        },
      }}
    />
  );
}

/** Harita'yı seçilen il/ilçeye otomatik yakınlaştırır. */
function MapFlyTo({ lat, lng, zoom }: { lat?: number; lng?: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

export function LocationPicker({
  value,
  onChange,
  showMap = true,
  showSearch = false,
  testId,
  disabled = false,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const selectedProvince = value?.province ? findProvince(value.province) : undefined;
  const districts = selectedProvince?.districts ?? [];

  const handleProvinceChange = (provinceName: string) => {
    if (!provinceName) {
      onChange({});
      return;
    }
    const p = findProvince(provinceName);
    if (!p) return;
    onChange({
      province: p.name,
      district: undefined,
      lat: p.lat,
      lng: p.lng,
      formattedAddress: p.name,
    });
  };

  const handleDistrictChange = (districtName: string) => {
    if (!value?.province) return;
    onChange({
      ...value,
      district: districtName || undefined,
      formattedAddress: districtName ? `${districtName}, ${value.province}` : value.province,
    });
  };

  const handleMapClick = (lat: number, lng: number) => {
    onChange({
      ...value,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    });
  };

  // Nominatim adres arama (opsiyonel, debounce + ücretsiz OSM)
  const searchAddress = async (q: string) => {
    if (q.trim().length < 4) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=5&q=${encodeURIComponent(q)}`;
      const r = await fetch(url, { headers: { "Accept-Language": "tr" } });
      if (!r.ok) return;
      const data: Array<{ lat: string; lon: string; display_name: string }> = await r.json();
      if (data.length === 0) return;
      const first = data[0];
      onChange({
        ...value,
        lat: Number(parseFloat(first.lat).toFixed(6)),
        lng: Number(parseFloat(first.lon).toFixed(6)),
        formattedAddress: first.display_name,
      });
    } catch {
      /* sessiz — opsiyonel feature */
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    if (searchQuery.trim().length >= 4) {
      debounceRef.current = window.setTimeout(() => {
        void searchAddress(searchQuery);
      }, 600);
    }
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const mapZoom = value?.district ? DISTRICT_ZOOM : value?.province ? PROVINCE_ZOOM : DEFAULT_ZOOM;
  const mapCenter: [number, number] =
    value?.lat !== undefined && value?.lng !== undefined
      ? [value.lat, value.lng]
      : DEFAULT_CENTER;

  return (
    <div className="space-y-3" data-testid={testId}>
      {/* DROPDOWN: İl + İlçe (yan yana md+) */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            <MapPin className="inline h-3.5 w-3.5 me-1" />İl
          </label>
          <select
            value={value?.province ?? ""}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            aria-label="İl seçimi"
          >
            <option value="">İl seçiniz</option>
            {TR_PROVINCES.map((p) => (
              <option key={p.code} value={p.name}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            İlçe {districts.length === 0 && value?.province && <span className="text-[10px] text-amber-300">(veri yok — haritadan pin atın)</span>}
          </label>
          <select
            value={value?.district ?? ""}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={disabled || !value?.province || districts.length === 0}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            aria-label="İlçe seçimi"
          >
            <option value="">İlçe seçiniz</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* OPSİYONEL ADRES ARAMA (Nominatim) */}
      {showSearch && (
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Adres ara (opsiyonel — OpenStreetMap)
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahalle, cadde, sokak..."
              disabled={disabled}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
            {searching && (
              <Loader2 className="absolute end-3 top-2.5 h-4 w-4 animate-spin text-cyan-400" />
            )}
          </div>
        </div>
      )}

      {/* HARİTA (Leaflet + OpenStreetMap) */}
      {showMap && (
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom
            style={{ height: "300px", width: "100%" }}
            aria-label="Konum haritası"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katılımcıları'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo lat={value?.lat} lng={value?.lng} zoom={mapZoom} />
            <PinHandler lat={value?.lat} lng={value?.lng} onSelect={handleMapClick} />
          </MapContainer>
          <p className="text-[10px] text-slate-500 px-2 py-1 bg-slate-900/40">
            Pin'i sürükleyerek veya haritaya tıklayarak tam konumu işaretleyin.
            {value?.lat !== undefined && value?.lng !== undefined && (
              <> Koordinat: <code className="text-cyan-400">{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</code></>
            )}
          </p>
        </div>
      )}

      {/* SEÇİLEN KONUM ÖZETİ */}
      {value?.formattedAddress && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
          <MapPin className="inline h-3.5 w-3.5 me-1" />
          <strong>Seçili konum:</strong> {value.formattedAddress}
          {value?.lat !== undefined && value?.lng !== undefined && (
            <span className="text-slate-400 ms-2">({value.lat.toFixed(5)}, {value.lng.toFixed(5)})</span>
          )}
        </div>
      )}
    </div>
  );
}

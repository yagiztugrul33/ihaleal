import type { ScoreBand } from "@/types/property/disaster";
import type { PropertyRecord } from "@/types/property";
import {
  getEarthquakeFilterSnapshot,
  type EarthquakeFilterSnapshot,
} from "@/lib/scoring/earthquakeFilterAdapter";

function num(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** URL parametreleri: dpMin dpMax dpFay dpZemin dpYas dpSinif dpBolge dpKat dpGuclendirme dpHasar dpYuruMax dpDask dpBand dpSoft */
export function propertyMatchesEarthquakeUrlParams(
  p: PropertyRecord,
  sp: URLSearchParams
): boolean {
  const f = getEarthquakeFilterSnapshot(p);

  const minC = num(sp, "dpMin");
  const maxC = num(sp, "dpMax");
  if (minC != null && f.totalScore < minC) return false;
  if (maxC != null && f.totalScore > maxC) return false;

  const fay = num(sp, "dpFay");
  if (fay != null && f.faultDistanceKm < fay) return false;

  const z = sp.get("dpZemin") as EarthquakeFilterSnapshot["soilBand"] | "";
  if (z && f.soilBand !== z) return false;

  const y = sp.get("dpYas") as EarthquakeFilterSnapshot["buildingAgeBand"] | "";
  if (y && f.buildingAgeBand !== y) return false;

  const cls = sp.get("dpSinif") as EarthquakeFilterSnapshot["seismicClassGuess"] | "";
  if (cls && f.seismicClassGuess !== cls) return false;

  const rg = sp.get("dpBolge") as EarthquakeFacets["regionalHazard"] | "";
  if (rg && f.regionalHazard !== rg) return false;

  const vr = sp.get("dpKat") as EarthquakeFilterSnapshot["verticalRisk"] | "";
  if (vr && f.verticalRisk !== vr) return false;

  const g = sp.get("dpGuclendirme") as EarthquakeFilterSnapshot["reinforcement"] | "";
  if (g && f.reinforcement !== g) return false;

  const h = sp.get("dpHasar") as EarthquakeFilterSnapshot["damageVisible"] | "";
  if (h && f.damageVisible !== h) return false;

  const walkMax = num(sp, "dpYuruMax");
  if (walkMax != null && f.assemblyWalkMinutes > walkMax) return false;

  const dask = sp.get("dpDask");
  if (dask === "evet" && !f.daskLikelyKnown) return false;
  if (dask === "hayir" && f.daskLikelyKnown) return false;

  const dpBand = sp.get("dpBand") as ScoreBand | "";
  if (dpBand && f.band !== dpBand) return false;

  const soft = sp.get("dpSoft");
  if (soft === "1" && !f.softStoryFlag) return false;

  return true;
}

const ZEMIN: EarthquakeFilterSnapshot["soilBand"][] = ["kayalik", "siki_kill", "gevsek", "dolgu"];

const EMPTY = "(bos)";

interface EarthquakeFiltersProps {
  searchParams: URLSearchParams;
  onChangeKey: (key: string, value: string) => void;
}

function selClass() {
  return "eqfil-select";
}

export function EarthquakeFilters({ searchParams: sp, onChangeKey }: EarthquakeFiltersProps) {
  const applyChip = (next: Record<string, string>) => {
    Object.entries(next).forEach(([k, v]) => onChangeKey(k, v));
  };

  const clearQuake = () => {
    const keys = [
      "dpMin",
      "dpMax",
      "dpFay",
      "dpZemin",
      "dpYas",
      "dpSinif",
      "dpBolge",
      "dpKat",
      "dpGuclendirme",
      "dpHasar",
      "dpYuruMax",
      "dpDask",
      "dpBand",
      "dpSoft",
    ];
    keys.forEach((k) => onChangeKey(k, ""));
  };

  return (
    <div className="eqfil-root" aria-label="Deprem filtreleri demo">
      <h3 className="eqfil-title">Deprem (demo)</h3>
      <div className="eqfil-quick" role="group" aria-label="Hizli etiketler">
        <button
          type="button"
          className="eqfil-chip"
          onClick={() =>
            applyChip({
              dpMin: "70",
              dpFay: "8",
              dpZemin: "kayalik",
              dpDask: "evet",
            })
          }
        >
          Yuksek güvenlik
        </button>
        <button
          type="button"
          className="eqfil-chip"
          onClick={() =>
            applyChip({
              dpBolge: "dusuk",
              dpKat: "alcak",
              dpSoft: "",
            })
          }
        >
          Dusük bolge riski
        </button>
        <button
          type="button"
          className="eqfil-chip"
          onClick={() =>
            applyChip({
              dpYuruMax: "12",
              dpHasar: "yok",
            })
          }
        >
          Yürünebili toplanma
        </button>
        <button type="button" className="eqfil-chip eqfil-chip--ghost" onClick={clearQuake}>
          Temizle
        </button>
      </div>

      <label className="eqfil-field">
        <span>Minimum bilesik puan</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={sp.get("dpMin") ?? ""}
          placeholder="0"
          onChange={(e) => onChangeKey("dpMin", e.target.value)}
        />
      </label>
      <label className="eqfil-field">
        <span>Maksimum bilesik puan</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={sp.get("dpMax") ?? ""}
          placeholder="100"
          onChange={(e) => onChangeKey("dpMax", e.target.value)}
        />
      </label>
      <label className="eqfil-field">
        <span>Faydan min. mesafe (km)</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={sp.get("dpFay") ?? ""}
          placeholder="Orn. 5"
          onChange={(e) => onChangeKey("dpFay", e.target.value)}
        />
      </label>

      <label className="eqfil-field">
        <span>Zemin</span>
        <select
          className={selClass()}
          value={sp.get("dpZemin") ?? ""}
          onChange={(e) => onChangeKey("dpZemin", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          {ZEMIN.map((z) => (
            <option key={z} value={z}>
              {z.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <label className="eqfil-field">
        <span>Bina yasi</span>
        <select
          className={selClass()}
          value={sp.get("dpYas") ?? ""}
          onChange={(e) => onChangeKey("dpYas", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="yeni">yeni</option>
          <option value="orta">orta</option>
          <option value="eski">eski</option>
          <option value="bilinmiyor">bilinmiyor</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Yapi sinifi (tahmin)</span>
        <select
          className={selClass()}
          value={sp.get("dpSinif") ?? ""}
          onChange={(e) => onChangeKey("dpSinif", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="a_sinifi">A sinifi</option>
          <option value="b_sinifi">B sinifi</option>
          <option value="c_sinifi">C sinifi</option>
          <option value="bilinmiyor">bilinmiyor</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Bolgesel tehlike</span>
        <select
          className={selClass()}
          value={sp.get("dpBolge") ?? ""}
          onChange={(e) => onChangeKey("dpBolge", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="dusuk">dusuk</option>
          <option value="orta">orta</option>
          <option value="yuksek">yuksek</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Dikey kat riski</span>
        <select
          className={selClass()}
          value={sp.get("dpKat") ?? ""}
          onChange={(e) => onChangeKey("dpKat", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="alcak">alcak</option>
          <option value="orta">orta</option>
          <option value="yuksek">yuksek</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Guclendirme</span>
        <select
          className={selClass()}
          value={sp.get("dpGuclendirme") ?? ""}
          onChange={(e) => onChangeKey("dpGuclendirme", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="tamamlandi">tamamlandi</option>
          <option value="kismen">kismen</option>
          <option value="yok">yok</option>
          <option value="bilinmiyor">bilinmiyor</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Yüzey hasari</span>
        <select
          className={selClass()}
          value={sp.get("dpHasar") ?? ""}
          onChange={(e) => onChangeKey("dpHasar", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="yok">yok</option>
          <option value="hafif">hafif</option>
          <option value="orta">orta</option>
          <option value="bilinmiyor">bilinmiyor</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Max toplanma yürüsü (dk)</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={sp.get("dpYuruMax") ?? ""}
          placeholder="Orn. 20"
          onChange={(e) => onChangeKey("dpYuruMax", e.target.value)}
        />
      </label>

      <label className="eqfil-field">
        <span>DASK (demo bayrak)</span>
        <select
          className={selClass()}
          value={sp.get("dpDask") ?? ""}
          onChange={(e) => onChangeKey("dpDask", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="evet">evet</option>
          <option value="hayir">hayir</option>
        </select>
      </label>

      <label className="eqfil-field">
        <span>Bilesik bant filtresi</span>
        <select
          className={selClass()}
          value={sp.get("dpBand") ?? ""}
          onChange={(e) => onChangeKey("dpBand", e.target.value)}
        >
          <option value="">{EMPTY}</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>
      </label>

      <label className="eqfil-field eqfil-checkbox">
        <input
          type="checkbox"
          checked={sp.get("dpSoft") === "1"}
          onChange={(e) => onChangeKey("dpSoft", e.target.checked ? "1" : "")}
        />
        <span>Soft story islaretli olanlar</span>
      </label>
    </div>
  );
}

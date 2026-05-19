import { useMemo, useState, type FormEvent } from "react";
import { Archive, Building, Filter, Search, Send } from "lucide-react";
import {
  COLLAPSED_BUILDINGS,
  COLLAPSE_YEAR_COUNTS,
  filterCollapsedBuildings,
  UNIQUE_CITIES,
  UNIQUE_CONTRACTORS,
  UNIQUE_INSPECTORS,
  type CollapseEventYear,
} from "@/lib/demo-data/modules/collapsedBuildings";
import { ModuleDataTable, ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

function modeTone(mode: string): "ok" | "warn" | "risk" {
  if (mode === "cokme-tehlikesi") return "warn";
  if (mode === "kismi") return "warn";
  return "risk";
}

function modeLabel(mode: string): string {
  if (mode === "tam") return "Tam yıkım";
  if (mode === "kismi") return "Kısmi";
  return "Çökme tehlikesi";
}

export default function YikilanBinalarArsiviPage() {
  const [eventYear, setEventYear] = useState<CollapseEventYear | "all">("all");
  const [city, setCity] = useState("all");
  const [contractor, setContractor] = useState("all");
  const [inspectionFirm, setInspectionFirm] = useState("all");
  const [query, setQuery] = useState("");
  const [crossMode, setCrossMode] = useState<"contractor" | "inspector">("contractor");
  const [crossQuery, setCrossQuery] = useState("");
  const [submitName, setSubmitName] = useState("");
  const [submitNote, setSubmitNote] = useState("");

  const rows = useMemo(
    () => filterCollapsedBuildings({ eventYear, city, contractor, inspectionFirm, query }),
    [eventYear, city, contractor, inspectionFirm, query],
  );

  const crossRows = useMemo(() => {
    const q = crossQuery.trim().toLocaleLowerCase("tr-TR");
    if (!q) return [];
    return COLLAPSED_BUILDINGS.filter((r) => {
      const field = crossMode === "contractor" ? r.contractor : r.inspectionFirm;
      return field.toLocaleLowerCase("tr-TR").includes(q);
    }).slice(0, 12);
  }, [crossMode, crossQuery]);

  const stats = [
    { label: "Toplam kayıt", value: String(COLLAPSED_BUILDINGS.length), hint: "Demo arşiv" },
    { label: "1999", value: String(COLLAPSE_YEAR_COUNTS[1999]), hint: "17 Ağustos bandı" },
    { label: "2023", value: String(COLLAPSE_YEAR_COUNTS[2023]), hint: "6 Şubat bandı" },
    { label: "Filtrelenen", value: String(rows.length), hint: "Aktif liste" },
  ];

  const submitRecord = (e: FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: {
          message: `${submitName || "Kayıt"} için arşiv başvurunuz alındı. Doğrulama ekibimiz inceleyecek.`,
          type: "success",
        },
      }),
    );
    setSubmitName("");
    setSubmitNote("");
  };

  return (
    <ModuleShell
      title="Yıkılan Binalar Arşivi"
      subtitle="1999, 2011, 2020 ve 2023 deprem olaylarına ait örnek yıkım kayıtları; müteahhit ve yapı denetim firması çapraz sorgusu."
      badge="Tarihsel Arşiv"
      icon={Archive}
      iconAccent="text-orange-300"
    >
      <ModuleStatGrid stats={stats} />

      <ModulePanel
        title="Filtreler"
        action={
          <span className="text-xs text-slate-500">
            <Filter className="mr-1 inline h-3.5 w-3.5" />
            {rows.length} sonuç
          </span>
        }
      >
        <div className="mod-form-grid lg:grid-cols-3">
          <div>
            <label htmlFor="yb-yil">Deprem yılı</label>
            <select id="yb-yil" value={eventYear} onChange={(e) => setEventYear(e.target.value as CollapseEventYear | "all")}>
              <option value="all">Tümü</option>
              <option value="1999">1999</option>
              <option value="2011">2011</option>
              <option value="2020">2020</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div>
            <label htmlFor="yb-il">İl</label>
            <select id="yb-il" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="all">Tümü</option>
              {UNIQUE_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="yb-muteahhit">Müteahhit</label>
            <select id="yb-muteahhit" value={contractor} onChange={(e) => setContractor(e.target.value)}>
              <option value="all">Tümü</option>
              {UNIQUE_CONTRACTORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="yb-denetim">Yapı denetim firması</label>
            <select id="yb-denetim" value={inspectionFirm} onChange={(e) => setInspectionFirm(e.target.value)}>
              <option value="all">Tümü</option>
              {UNIQUE_INSPECTORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="yb-ara">Serbest arama</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                id="yb-ara"
                className="pl-9"
                placeholder="Bina adı, mahalle, firma..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </ModulePanel>

      <ModulePanel title="Kayıt listesi">
        <ModuleDataTable
          caption="Yıkılan bina kayıtları"
          columns={[
            { key: "yil", header: "Yıl", render: (r) => r.eventYear },
            { key: "konum", header: "Konum", render: (r) => `${r.city} / ${r.district}` },
            { key: "bina", header: "Bina", render: (r) => r.buildingName },
            { key: "mod", header: "Mod", render: (r) => <ModuleTag tone={modeTone(r.collapseMode)}>{modeLabel(r.collapseMode)}</ModuleTag> },
            { key: "muteahhit", header: "Müteahhit", render: (r) => r.contractor },
            { key: "denetim", header: "Denetim", render: (r) => r.inspectionFirm },
          ]}
          rows={rows}
        />
      </ModulePanel>

      <ModulePanel title="Müteahhit / denetim çapraz sorgu">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={crossMode === "contractor" ? "mod-btn-primary" : "mod-btn-secondary"}
            onClick={() => setCrossMode("contractor")}
          >
            Müteahhit
          </button>
          <button
            type="button"
            className={crossMode === "inspector" ? "mod-btn-primary" : "mod-btn-secondary"}
            onClick={() => setCrossMode("inspector")}
          >
            Denetim firması
          </button>
        </div>
        <input
          placeholder={crossMode === "contractor" ? "Müteahhit adı yazın..." : "Denetim firması yazın..."}
          value={crossQuery}
          onChange={(e) => setCrossQuery(e.target.value)}
        />
        {crossRows.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {crossRows.map((r) => (
              <li key={r.id} className="flex items-start gap-2 rounded-lg border border-white/10 px-3 py-2">
                <Building className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                <span>
                  <strong className="text-white">{r.buildingName}</strong> — {r.city}, {r.eventYear}:{" "}
                  {crossMode === "contractor" ? r.contractor : r.inspectionFirm}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Çapraz sorgu için en az iki karakter girin.</p>
        )}
      </ModulePanel>

      <ModulePanel title="Yeni kayıt önerisi">
        <form className="mod-form-grid" onSubmit={submitRecord}>
          <div>
            <label htmlFor="yb-ad">Adınız / kurum</label>
            <input id="yb-ad" value={submitName} onChange={(e) => setSubmitName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="yb-not">Kayıt özeti</label>
            <textarea
              id="yb-not"
              value={submitNote}
              onChange={(e) => setSubmitNote(e.target.value)}
              placeholder="Konum, yıl, müteahhit veya denetim firması bilgisi"
              required
            />
          </div>
          <div className="mod-form-actions">
            <button type="submit" className="mod-btn-primary">
              <Send className="h-4 w-4" aria-hidden />
              Başvuruyu gönder
            </button>
          </div>
        </form>
      </ModulePanel>
    </ModuleShell>
  );
}

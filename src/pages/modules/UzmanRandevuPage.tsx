import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Star,
} from "lucide-react";
import {
  EXPERT_CATEGORIES,
  expertInitials,
  filterExperts,
  hourlyRateLabel,
  type ExpertCategoryId,
  type ExpertProfile,
} from "@/lib/demo-data/modules/experts";
import { ModulePanel, ModuleShell, ModuleTag } from "./ModuleShell";

type WizardStep = 1 | 2 | 3;

function ExpertAvatar({ name }: { name: string }) {
  const initials = expertInitials(name);
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{
        background: "linear-gradient(135deg, #0d9488 0%, #6366f1 55%, #1e293b 100%)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export default function UzmanRandevuPage() {
  const [category, setCategory] = useState<ExpertCategoryId>("insaat-muhendisi");
  const [city, setCity] = useState("all");
  const [licensedOnly, setLicensedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExpertProfile | null>(null);
  const [step, setStep] = useState<WizardStep>(1);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");

  const catMeta = EXPERT_CATEGORIES.find((c) => c.id === category)!;

  const experts = useMemo(
    () => filterExperts(category, { city, licensedOnly, minRating: minRating || undefined, query }),
    [category, city, licensedOnly, minRating, query],
  );

  const cities = useMemo(() => {
    const set = new Set(experts.map((e) => e.city));
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [experts]);

  const confirmBooking = () => {
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: {
          message: `${selected?.name} ile ${date} ${slot} randevunuz olusturuldu. Onay e-postasi gonderildi.`,
          type: "success",
        },
      }),
    );
    setSelected(null);
    setStep(1);
    setDate("");
    setSlot("");
    setNote("");
  };

  return (
    <ModuleShell
      title="Uzman Randevu"
      subtitle="Statik, zemin, mimari proje, SPK ekspertiz, sigorta, hukuk, psikososyal destek ve afet koordinasyonu uzmanlarindan randevu alin."
      badge="Uzman Agi"
      icon={Calendar}
      iconAccent="text-cyan-300"
    >
      <ModulePanel title="Uzmanlik alani">
        <div className="flex flex-wrap gap-2" role="tablist">
          {EXPERT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              className={
                category === c.id
                  ? "rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-3 py-2 text-sm font-medium text-cyan-100"
                  : "rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06]"
              }
              onClick={() => {
                setCategory(c.id);
                setSelected(null);
                setStep(1);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-400">{catMeta.description}</p>
      </ModulePanel>

      <div className="mod-layout mod-layout--split mt-6">
        <ModulePanel
          title="Filtreler"
          action={
            <span className="text-xs text-slate-500">
              <Filter className="mr-1 inline h-3.5 w-3.5" />
              {experts.length} uzman
            </span>
          }
        >
          <div className="mod-form-grid">
            <div>
              <label htmlFor="ur-il">Sehir</label>
              <select id="ur-il" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="all">Tumu</option>
                {cities.map((ci) => (
                  <option key={ci} value={ci}>
                    {ci}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ur-puan">Minimum puan</label>
              <select id="ur-puan" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
                <option value={0}>Tumu</option>
                <option value={4}>4.0+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={licensedOnly} onChange={(e) => setLicensedOnly(e.target.checked)} />
              Yalnizca lisansli / belgeli
            </label>
            <div>
              <label htmlFor="ur-ara">Arama</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  id="ur-ara"
                  className="pl-9"
                  style={{ fontSize: "16px" }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Isim veya uzmanlik"
                />
              </div>
            </div>
          </div>
        </ModulePanel>

        <ModulePanel title="Uzman listesi">
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {experts.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  selected?.id === e.id ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/10 hover:bg-white/[0.04]"
                }`}
                onClick={() => {
                  setSelected(e);
                  setStep(1);
                }}
              >
                <div className="flex items-start gap-2">
                  <ExpertAvatar name={e.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{e.name}</p>
                    <p className="text-xs text-slate-400">
                      {e.title} · {e.city} · {e.experienceYears} yil · {e.completedJobs} is
                    </p>
                    <p className="text-xs text-slate-500">Oda sicil: {e.chamberNo}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-amber-200">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {e.rating} ({e.reviewCount} yorum)
                    </p>
                    <p className="text-xs text-emerald-200">{hourlyRateLabel(e)}</p>
                    <p className="text-xs text-slate-500">{e.specialties.join(" · ")}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.availableSlotsThisWeek.map((s) => (
                        <span key={s} className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] text-cyan-100">
                          Bu hafta: {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {e.licensed ? <ModuleTag tone="ok">Belgeli</ModuleTag> : null}
                </div>
              </button>
            ))}
          </div>
        </ModulePanel>
      </div>

      {selected ? (
        <ModulePanel title="Randevu sihirbazi">
          <p className="text-sm text-slate-400">
            Adim {step} / 3 — {selected.name}
          </p>
          {step === 1 ? (
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>Oda sicil: {selected.chamberNo}</p>
              <p>Tamamlanan is: {selected.completedJobs}</p>
              <p>Ucret: {hourlyRateLabel(selected)}</p>
              <p>Musait saatler: {selected.availableSlotsThisWeek.join(", ")}</p>
              <button type="button" className="mod-btn-primary mt-2" onClick={() => setStep(2)}>
                Devam
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="mod-form-grid mt-3">
              <div>
                <label htmlFor="ur-tarih">Tarih</label>
                <input id="ur-tarih" type="date" value={date} onChange={(ev) => setDate(ev.target.value)} required />
              </div>
              <div>
                <label htmlFor="ur-saat">Saat</label>
                <select id="ur-saat" value={slot} onChange={(ev) => setSlot(ev.target.value)} required style={{ fontSize: "16px" }}>
                  <option value="">Secin</option>
                  {selected.availableSlotsThisWeek.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="09:00">09:00</option>
                  <option value="14:00">14:00</option>
                </select>
              </div>
              <div>
                <label htmlFor="ur-not">Not</label>
                <textarea id="ur-not" value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Kisa ozet" />
              </div>
              <div className="mod-form-actions">
                <button type="button" className="mod-btn-secondary" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" /> Geri
                </button>
                <button type="button" className="mod-btn-primary" onClick={() => setStep(3)} disabled={!date || !slot}>
                  Ozet
                </button>
              </div>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="mt-3 rounded-lg border border-white/10 p-4 text-sm text-slate-300">
              <p>
                <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-400" />
                {date} {slot} — {selected.name}
              </p>
              <p className="mt-2">{note || "Ek not yok."}</p>
              <div className="mod-form-actions mt-4">
                <button type="button" className="mod-btn-secondary" onClick={() => setStep(2)}>
                  Geri
                </button>
                <button type="button" className="mod-btn-primary" onClick={confirmBooking}>
                  Randevuyu onayla
                </button>
              </div>
            </div>
          ) : null}
        </ModulePanel>
      ) : null}
    </ModuleShell>
  );
}

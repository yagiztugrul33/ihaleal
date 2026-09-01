import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calculator,
  Clock,
  Percent,
  ShieldAlert,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type DamageClass = "A" | "B" | "C" | "D" | "E";

type FormState = {
  city: string;
  buildingAge: string;
  floors: string;
  structuralSystem: string;
  observedDamage: string;
  occupancy: string;
};

const DAMAGE_CLASSES: {
  id: DamageClass;
  label: string;
  tone: "ok" | "warn" | "risk";
  visual: string;
  desc: string;
}[] = [
  { id: "A", label: "A — Hafif", tone: "ok", visual: "bg-emerald-500/20 border-emerald-500/40", desc: "Kozmetik çatlak, işlev kaybı yok" },
  { id: "B", label: "B — Orta", tone: "warn", visual: "bg-amber-500/20 border-amber-500/40", desc: "Onarım gerekir, taşıyıcıda sınırlı etki" },
  { id: "C", label: "C — Ağır", tone: "warn", visual: "bg-orange-500/20 border-orange-500/40", desc: "Kısmi kullanım dışı, güçlendirme gündemi" },
  { id: "D", label: "D — Çok ağır", tone: "risk", visual: "bg-red-500/20 border-red-500/40", desc: "Acil tahliye, statik rapor zorunlu" },
  { id: "E", label: "E — Yıkım", tone: "risk", visual: "bg-red-900/30 border-red-600/50", desc: "Kullanılamaz, yıkım veya kökten güçlendirme" },
];

const ACTIONS = [
  "Statik performans analizi ve saha doğrulaması planlayın",
  "DASK ve konut poliçesi teminat limitlerini güncelleyin",
  "Geçici barınma ve tahliye rotasını aile planına ekleyin",
  "Ruhsatlı güçlendirme veya yıkım-karar süreci için uzman randevusu alın",
  "Hasar fotoğraflarını tarih damgalı arşivleyin",
  "Belediye hasar tespit başvurusu için belge setini hazırlayın",
];

function estimate(form: FormState): {
  damageClass: DamageClass;
  evacuationHours: number;
  economicLossMillion: number;
  insuranceCoveragePct: number;
  regionalAvgLoss: number;
  regionalAvgClass: DamageClass;
} {
  let score = 0;
  if (form.buildingAge === "pre1975") score += 22;
  else if (form.buildingAge === "1975-1999") score += 14;
  else score += 6;
  if (form.structuralSystem === "masonry") score += 18;
  else if (form.structuralSystem === "composite") score += 12;
  else score += 8;
  if (form.floors === "high") score += 14;
  else if (form.floors === "mid") score += 8;
  else score += 4;
  if (form.observedDamage === "tilt") score += 28;
  else if (form.observedDamage === "cracks") score += 16;
  else if (form.observedDamage === "minor") score += 6;
  if (form.occupancy === "full") score += 4;
  if (form.city.toLocaleLowerCase("tr-TR").includes("istanbul")) score += 8;
  if (form.city.toLocaleLowerCase("tr-TR").includes("hatay") || form.city.toLocaleLowerCase("tr-TR").includes("kahraman")) score += 10;

  const damageClass: DamageClass =
    score >= 58 ? "E" : score >= 48 ? "D" : score >= 36 ? "C" : score >= 24 ? "B" : "A";
  const evacuationHours =
    damageClass === "E" ? 0 : damageClass === "D" ? 2 : damageClass === "C" ? 12 : damageClass === "B" ? 48 : 72;
  const economicLossMillion = Math.round((score * 0.42 + 1.2) * 10) / 10;
  const insuranceCoveragePct = Math.max(35, Math.min(92, 88 - score * 0.6));
  const regionalAvgLoss = Math.round((economicLossMillion * 0.78) * 10) / 10;
  const regionalAvgClass: DamageClass = score >= 40 ? "C" : score >= 28 ? "B" : "A";

  return { damageClass, evacuationHours, economicLossMillion, insuranceCoveragePct, regionalAvgLoss, regionalAvgClass };
}

export default function YapayZekaHasarTahminiPage() {
  const [form, setForm] = useState<FormState>({
    city: "İstanbul",
    buildingAge: "1975-1999",
    floors: "mid",
    structuralSystem: "reinforced",
    observedDamage: "cracks",
    occupancy: "full",
  });
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => estimate(form), [form]);
  const activeVisual = DAMAGE_CLASSES.find((d) => d.id === result.damageClass)!;

  const stats = submitted
    ? [
        { label: "Tahmini hasar sınıfı", value: result.damageClass, hint: activeVisual.label },
        { label: "Tahliye süresi", value: `${result.evacuationHours} saat`, hint: "Güvenli kullanım için öneri" },
        { label: "Ekonomik kayıp", value: `${result.economicLossMillion} M TL`, hint: "Yapı + iç mekan özet" },
        { label: "Sigorta karşılama", value: `%${Math.round(result.insuranceCoveragePct)}`, hint: "Poliçe ve muafiyetlere bağlı" },
      ]
    : [];

  return (
    <ModuleShell
      title="Yapay Zeka Hasar Tahmini"
      subtitle="Bina yaşı, sistem tipi ve gözlemlenen hasara göre hasar sınıfı, tahliye süresi ve ekonomik kayıp özetini üretir; bölgesel ortalama ile karşılaştırır."
      badge="AI Hasar Modeli"
      icon={ShieldAlert}
      iconAccent="text-violet-300"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Girdi formu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div>
              <label htmlFor="yz-il">İl / bölge</label>
              <input
                id="yz-il"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="yz-yas">Yapı yaşı bandı</label>
              <select
                id="yz-yas"
                value={form.buildingAge}
                onChange={(e) => setForm((f) => ({ ...f, buildingAge: e.target.value }))}
              >
                <option value="pre1975">1975 öncesi</option>
                <option value="1975-1999">1975–1999</option>
                <option value="post2000">2000 sonrası</option>
              </select>
            </div>
            <div>
              <label htmlFor="yz-sistem">Taşıyıcı sistem</label>
              <select
                id="yz-sistem"
                value={form.structuralSystem}
                onChange={(e) => setForm((f) => ({ ...f, structuralSystem: e.target.value }))}
              >
                <option value="reinforced">Betonarme</option>
                <option value="masonry">Yığma</option>
                <option value="composite">Karma</option>
              </select>
            </div>
            <div>
              <label htmlFor="yz-kat">Kat adedi</label>
              <select
                id="yz-kat"
                value={form.floors}
                onChange={(e) => setForm((f) => ({ ...f, floors: e.target.value }))}
              >
                <option value="low">1–4 kat</option>
                <option value="mid">5–8 kat</option>
                <option value="high">9+ kat</option>
              </select>
            </div>
            <div>
              <label htmlFor="yz-hasar">Gözlemlenen hasar</label>
              <select
                id="yz-hasar"
                value={form.observedDamage}
                onChange={(e) => setForm((f) => ({ ...f, observedDamage: e.target.value }))}
              >
                <option value="none">Belirgin değil</option>
                <option value="minor">Hafif çatlak</option>
                <option value="cracks">Yapısal çatlak</option>
                <option value="tilt">Eğrilme / çıkıntı</option>
              </select>
            </div>
            <div>
              <label htmlFor="yz-doluluk">Doluluk</label>
              <select
                id="yz-doluluk"
                value={form.occupancy}
                onChange={(e) => setForm((f) => ({ ...f, occupancy: e.target.value }))}
              >
                <option value="full">Tam dolu</option>
                <option value="partial">Kısmi</option>
                <option value="empty">Boş</option>
              </select>
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <Calculator className="h-4 w-4" aria-hidden />
                Tahmin üret
              </button>
            </div>
          </form>
        </ModulePanel>

        {submitted ? (
          <ModulePanel title="Hasar görselleştirme ve sonuç">
            <div className="grid gap-3 sm:grid-cols-5">
              {DAMAGE_CLASSES.map((d) => (
                <div
                  key={d.id}
                  className={`rounded-[10px] border p-3 text-center transition ${
                    d.id === result.damageClass ? d.visual + " ring-2 ring-white/30" : "border-white/10 opacity-50"
                  }`}
                >
                  <Building2 className="mx-auto h-6 w-6 text-slate-300" aria-hidden />
                  <p className="mt-2 text-xs font-normal">{d.id}</p>
                  <p className="text-[10px] text-slate-400">{d.desc}</p>
                </div>
              ))}
            </div>
            <ModuleStatGrid stats={stats} />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ModuleTag tone={activeVisual.tone}>{activeVisual.label}</ModuleTag>
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <Clock className="h-4 w-4" /> Tahliye: {result.evacuationHours} saat
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <Wallet className="h-4 w-4" /> Kayıp: {result.economicLossMillion} M TL
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <Percent className="h-4 w-4" /> Sigorta: %{Math.round(result.insuranceCoveragePct)}
              </span>
            </div>

            <ModulePanel title="Bölgesel ortalama karşılaştırması">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Sizin tahmin</p>
                  <p className="text-lg font-normal text-white">
                    {result.damageClass} · {result.economicLossMillion} M TL
                  </p>
                </div>
                <TrendingDown className="h-5 w-5 text-slate-600" aria-hidden />
                <div>
                  <p className="text-slate-500">Bölge ortalaması ({form.city})</p>
                  <p className="text-lg font-normal text-slate-300">
                    {result.regionalAvgClass} · {result.regionalAvgLoss} M TL
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Fark:{" "}
                  {result.economicLossMillion > result.regionalAvgLoss ? "ortalamanın üzerinde" : "ortalamanın altında"}
                </p>
              </div>
            </ModulePanel>

            <h3 className="mt-6 text-sm font-normal text-white">Önerilen 6 aksiyon</h3>
            <ol className="mt-2 list-decimal space-y-2 ps-5 text-sm text-slate-300">
              {ACTIONS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>

            <div className="mod-pdf-cta mt-6">
              <p>Lisanslı statik mühendis ve eksper görüşü için randevu planlayın.</p>
              <Link to="/modul/uzman-randevu" className="mod-btn-primary">
                <ArrowRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
                Uzman randevusu
              </Link>
            </div>
          </ModulePanel>
        ) : (
          <ModulePanel title="Sonuç">
            <p className="mod-empty">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-slate-600" />
              Formu doldurup tahmin üretin.
            </p>
          </ModulePanel>
        )}
      </div>
    </ModuleShell>
  );
}

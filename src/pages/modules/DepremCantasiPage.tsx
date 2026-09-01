import { useMemo, useState } from "react";
import {
  Baby,
  Backpack,
  ChevronLeft,
  ChevronRight,
  Dog,
  FileDown,
  Gamepad2,
  Home,
  Printer,
  Users,
  Utensils,
} from "lucide-react";
import { ModuleDataTable, ModulePanel, ModuleShell } from "./ModuleShell";
import { ModuleRelatedStrip } from "./ModuleRelatedStrip";
import type { RelatedModuleCard } from "./ModuleRelatedStrip";
import { HeartHandshake, MapPin, Shield } from "lucide-react";

type Step = 0 | 1 | 2 | 3 | 4;

type WizardState = {
  household: number;
  hasChildren: boolean;
  hasPets: boolean;
  hasSeniors: boolean;
  daysSupply: number;
  climate: "normal" | "cold" | "hot";
  mobility: "standard" | "limited";
};

const DEFAULT: WizardState = {
  household: 3,
  hasChildren: true,
  hasPets: false,
  hasSeniors: false,
  daysSupply: 3,
  climate: "normal",
  mobility: "standard",
};

const CATEGORIES: { id: string; title: string; base: string[] }[] = [
  {
    id: "su-gida",
    title: "Su ve gıda",
    base: ["Kişi başı günlük 3 L su", "Konserve ve enerji barı", "Manuel konserve açacağı", "Tek kullanımlık tabak-bardak"],
  },
  {
    id: "ilk-yardim",
    title: "İlk yardım",
    base: ["Steril gazlı bez ve yara bandı", "Antiseptik solüsyon", "Ağrı kesici (reçeteye uygun)", "Eldiven ve makas"],
  },
  {
    id: "isinma",
    title: "Isınma ve barınma",
    base: ["Acil battaniye (termal)", "Yağmurluk / ponço", "Çadır veya branda (opsiyonel)", "El feneri + yedek pil"],
  },
  {
    id: "hijyen",
    title: "Hijyen",
    base: ["Islak mendil", "Katı sabun", "Diş fırçası seti", "Çöp torbası"],
  },
  {
    id: "iletisim",
    title: "İletişim ve enerji",
    base: ["Powerbank (tam şarj)", "Whistle / düdük", "Pilli radyo", "Yedek telefon kablosu"],
  },
  {
    id: "belge",
    title: "Belgeler ve nakit",
    base: ["Kimlik fotokopisi (su geçirmez poşet)", "DASK poliçe özeti", "Nakit küçük banknot", "Aile iletişim kartı"],
  },
  {
    id: "alet",
    title: "Alet ve güvenlik",
    base: ["Çok amaçlı çakı", "İp (10 m)", "Bant ve naylon", "Toz maskesi (FFP2)"],
  },
  {
    id: "ozel",
    title: "Özel ihtiyaç",
    base: ["Reçeteli ilaç listesi (30 gün)", "Gözlük / lens yedeği", "Bebek maması formülü (varsa)", "Evcil hayvan tasması ve kayıt"],
  },
];

const RENEWAL_ROWS = [
  { id: "r1", urun: "Su (şişe / depo)", periyot: "6 ay", not: "Güneş ve sıcaklık etkisi" },
  { id: "r2", urun: "Konserve ve enerji barı", periyot: "12 ay", not: "Son kullanma tarihi" },
  { id: "r3", urun: "İlk yardım seti", periyot: "24 ay", not: "Steril ürünler" },
  { id: "r4", urun: "Pil ve powerbank", periyot: "12 ay", not: "Şarj döngüsü kontrolü" },
  { id: "r5", urun: "İlaç listesi", periyot: "3 ay", not: "Reçete yenileme" },
];

const KIDS_GAMES = [
  { title: "Sakin nefes kartları", body: "4-4-4 nefes ritmi; çocuğa kart üzerindeki hayvanları saydırın." },
  { title: "Güvenli köşe oyunu", body: "Çantadaki fenerle gölge oyunu; panik yerine odak sağlar." },
  { title: "Aile kodu kelimesi", body: "Buluşma noktasında söylenecek kısa şifre belirleyin." },
  { title: "Mini görev listesi", body: "Çocuğa battaniye veya düdük taşıma rolü verin." },
];

const PET_ITEMS = [
  "3 günlük kuru mama ve su kabı",
  "Tasma, kayıt numarası ve aşı kartı fotokopisi",
  "Taşıma çantası veya pet yatağı",
  "Temizlik poşeti ve ıslak mendil",
];

const RELATED: RelatedModuleCard[] = [
  { title: "Aile Acil Planı", description: "Toplanma ve iletişim planı.", href: "/modul/aile-acil-plan", icon: HeartHandshake },
  { title: "Afet Toplanma Alanları", description: "En yakın toplanma noktası.", href: "/modul/afet-toplanma-alanlari", icon: MapPin },
  { title: "Deprem Sigortası", description: "DASK ve tamamlayıcı poliçe.", href: "/modul/deprem-sigortasi", icon: Shield },
];

function buildLists(state: WizardState): { id: string; title: string; items: string[] }[] {
  const mult = state.household;
  const dayMult = state.daysSupply;
  return CATEGORIES.map((cat) => {
    const items = [...cat.base];
    if (cat.id === "su-gida") {
      items.unshift(`Toplam su hedefi: ~${mult * dayMult * 3} L`);
    }
    if (state.hasChildren && cat.id === "ozel") {
      items.push("Bebek bezi ve oyuncak (stres azaltıcı)");
    }
    if (state.hasSeniors && cat.id === "ozel") {
      items.push("Yürüteç / baston yedek parçası");
    }
    if (state.hasPets && cat.id === "ozel") {
      items.push(...PET_ITEMS.slice(0, 2));
    }
    if (state.climate === "cold") {
      items.push("Termal içlik ve bere");
    }
    if (state.mobility === "limited") {
      items.push("Katlanır sedye veya oturma desteği notu");
    }
    return { id: cat.id, title: cat.title, items };
  });
}

export default function DepremCantasiPage() {
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<WizardState>(DEFAULT);
  const [done, setDone] = useState(false);

  const lists = useMemo(() => buildLists(state), [state]);

  const steps = [
    { title: "Hane", icon: Users },
    { title: "Özel gruplar", icon: Baby },
    { title: "Süre", icon: Utensils },
    { title: "İklim / erişim", icon: Home },
    { title: "Liste", icon: Backpack },
  ];

  const next = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
    else setDone(true);
  };
  const prev = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  return (
    <ModuleShell
      title="Deprem Çantası"
      subtitle="Beş adımlı sihirbaz ile hane profiline göre sekiz kategoride çanta listesi, yenileme takvimi ve yazdırılabilir özet."
      icon={Backpack}
      badge="Hazırlık Sihirbazı"
    >
      <div className="mod-print-root">
        <ModulePanel title="Çanta planlama sihirbazı">
          <div className="mod-wizard-steps mod-no-print">
            {steps.map((s, i) => (
              <span key={s.title} className={`mod-wizard-step ${i === step ? "mod-wizard-step--active" : ""}`}>
                {i + 1}. {s.title}
              </span>
            ))}
          </div>

          {step === 0 && (
            <div className="mod-form-grid">
              <div>
                <label htmlFor="dc-hane">Hane büyüklüğü</label>
                <input
                  id="dc-hane"
                  type="number"
                  min={1}
                  max={12}
                  value={state.household}
                  onChange={(e) => setState((s) => ({ ...s, household: Number(e.target.value) }))}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mod-form-grid">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.hasChildren} onChange={(e) => setState((s) => ({ ...s, hasChildren: e.target.checked }))} />
                Çocuk var
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.hasSeniors} onChange={(e) => setState((s) => ({ ...s, hasSeniors: e.target.checked }))} />
                Yaşlı birey var
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.hasPets} onChange={(e) => setState((s) => ({ ...s, hasPets: e.target.checked }))} />
                Evcil hayvan var
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="dc-gun">Kaç günlük stok hedefi?</label>
              <select
                id="dc-gun"
                className="mt-1 w-full max-w-xs"
                value={state.daysSupply}
                onChange={(e) => setState((s) => ({ ...s, daysSupply: Number(e.target.value) }))}
              >
                <option value={3}>3 gün (AFAD önerisi tabanı)</option>
                <option value={5}>5 gün</option>
                <option value={7}>7 gün</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="mod-form-grid">
              <div>
                <label htmlFor="dc-iklim">İklim</label>
                <select id="dc-iklim" value={state.climate} onChange={(e) => setState((s) => ({ ...s, climate: e.target.value as WizardState["climate"] }))}>
                  <option value="normal">Ilıman</option>
                  <option value="cold">Soğuk</option>
                  <option value="hot">Sıcak / yaz</option>
                </select>
              </div>
              <div>
                <label htmlFor="dc-mobil">Hareket kabiliyeti</label>
                <select id="dc-mobil" value={state.mobility} onChange={(e) => setState((s) => ({ ...s, mobility: e.target.value as WizardState["mobility"] }))}>
                  <option value="standard">Standart</option>
                  <option value="limited">Kısıtlı / yardımcı gerekli</option>
                </select>
              </div>
            </div>
          )}

          {(step === 4 || done) && (
            <div className="mt-4 space-y-4">
              {lists.map((cat) => (
                <div key={cat.id} className="mod-category-output">
                  <h3>{cat.title}</h3>
                  <ul>
                    {cat.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mod-form-actions mod-no-print mt-4">
            {step > 0 ? (
              <button type="button" className="mod-btn-secondary" onClick={prev}>
                <ChevronLeft className="rtl:rotate-180 h-4 w-4" aria-hidden />
                Geri
              </button>
            ) : null}
            <button type="button" className="mod-btn-primary" onClick={next}>
              {step < 4 ? "İleri" : "Listeyi kilitle"}
              <ChevronRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
            </button>
          </div>
        </ModulePanel>

        <ModulePanel title="Yenileme takvimi">
          <ModuleDataTable
            caption="Deprem çantası yenileme"
            columns={[
              { key: "urun", header: "Ürün", render: (r) => r.urun },
              { key: "periyot", header: "Periyot", render: (r) => r.periyot },
              { key: "not", header: "Not", render: (r) => r.not },
            ]}
            rows={RENEWAL_ROWS}
          />
        </ModulePanel>

        <ModulePanel title="Çocuklar için sakinleştirici oyunlar">
          <div className="mod-games-grid">
            {KIDS_GAMES.map((g) => (
              <div key={g.title} className="mod-game-card">
                <p className="flex items-center gap-2 font-normal text-slate-100">
                  <Gamepad2 className="h-4 w-4 text-[var(--metin-ikincil)]" aria-hidden />
                  {g.title}
                </p>
                <p className="mt-2 text-slate-400">{g.body}</p>
              </div>
            ))}
          </div>
        </ModulePanel>

        <ModulePanel title="Evcil hayvan listesi">
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
            {PET_ITEMS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {state.hasPets ? (
            <p className="mt-3 text-sm text-[var(--metin-ikincil)]">
              <Dog className="me-1 inline h-4 w-4" aria-hidden />
              Profilinizde evcil hayvan işaretlendi; özel ihtiyaç listesine ek kalemler dahil edildi.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Sihirbazda evcil hayvan seçilirse liste genişletilir.</p>
          )}
        </ModulePanel>

        <div className="mod-pdf-cta mod-no-print">
          <p>Liste tamamlandığında yazdırılabilir PDF düzeni tarayıcı baskısı ile alınır.</p>
          <button type="button" className="mod-btn-secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden />
            Çanta listesini yazdır
          </button>
          <button type="button" className="mod-btn-secondary" onClick={() => window.print()}>
            <FileDown className="h-4 w-4" aria-hidden />
            PDF olarak kaydet (yazdır)
          </button>
        </div>
      </div>

      <ModuleRelatedStrip modules={RELATED} />
    </ModuleShell>
  );
}

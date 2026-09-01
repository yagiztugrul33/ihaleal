import { useEffect, useMemo, useState } from "react";
import { FileSearch, Shield, ShieldCheck } from "lucide-react";
import { ModuleDataTable, ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { ModuleRelatedStrip } from "./ModuleRelatedStrip";
import type { RelatedModuleCard } from "./ModuleRelatedStrip";
import { Backpack, Building2 } from "lucide-react";

type DaskPolicy = {
  status: string;
  policyNo: string;
  amountTry: number;
  lastPayment: string;
  adequate: boolean;
};

type CompareRow = {
  id: string;
  sirket: string;
  daskPrim: string;
  konutEk: string;
  teminat: string;
  hasarHiz: string;
  online: string;
};

const INSURERS = [
  "Anadolu Sigorta",
  "Allianz",
  "Axa",
  "Zurich",
  "Generali",
  "HDI",
  "Mapfre",
  "Ergo",
] as const;

const COMPARE_ROWS: CompareRow[] = Array.from({ length: 20 }, (_, i) => {
  const sirket = INSURERS[i % INSURERS.length];
  const base = 7200 + (i % 8) * 340;
  return {
    id: `c${i + 1}`,
    sirket,
    daskPrim: `${base.toLocaleString("tr-TR")} TRY`,
    konutEk: `${(base * 0.55).toFixed(0)} TRY`,
    teminat: `${(1.2 + (i % 6) * 0.25).toFixed(1)}M TRY`,
    hasarHiz: i % 3 === 0 ? "7/24" : "Mesai",
    online: i % 2 === 0 ? "Anında" : "1 iş günü",
  };
});

const FAQ = [
  { q: "DASK zorunlu mu?", a: "Konut tipi yapılar için deprem sigortası (DASK) yasal zorunluluktur; tapu ve abonelik işlemlerinde sorulabilir." },
  { q: "Bina bedeli nasıl belirlenir?", a: "DASK’ta bina bedeli resmi tarife ve metrekare ile sınırlıdır; konut poliçesi ile fark kapatılabilir." },
  { q: "Prim neden artar?", a: "İl risk grubu, bina yaşı, kat sayısı ve önceki hasar geçmişi prim katsayısını etkiler." },
  { q: "Hasar bildirimi nasıl yapılır?", a: "DASK hasarları DASK Genel Müdürlüğü kanallarından; konut ek teminatı ilgili sigorta şirketinden bildirilir." },
  { q: "Kiracı DASK yaptırabilir mi?", a: "Malik adına yapılması esastır; kiracı anlaşma ile ödeme yapabilir ancak poliçe malik bilgisi taşır." },
  { q: "Yenileme ne zaman?", a: "Poliçe bitiş tarihinden önce yenileme yapılmazsa teminat boşluğu oluşur; otomatik hatırlatma servisleri kullanılabilir." },
  { q: "Ekspertiz gerekir mi?", a: "İlk tanzimde genelde gerekmez; hasar sonrası ekspertiz zorunludur." },
  { q: "İpotekli konutta DASK kimde?", a: "Banka lehtarı olarak gösterilebilir; malik sorumluluğu devam eder." },
  { q: "Ticari bağımsız bölüm?", a: "DASK konut için ayrıdır; ticari birimlerde farklı ürünler değerlendirilir." },
  { q: "Bu modül bağlayıcı mı?", a: "Hayır; gösterilen primler demo hesaplamadır. Resmi teklif için sigorta şirketi veya acente kanalı kullanılmalıdır." },
];

const DAMAGE_STEPS = [
  "Deprem sonrası önce can güvenliği; gaz ve elektrik vanalarını kapatın.",
  "Hasarlı binaya giriş yapmayın; çökme ve artçı sarsıntı riskine dikkat.",
  "Fotoğraf ve video ile hasarı belgeleyin; tarih damgalı kayıt tutun.",
  "DASK hasar bildirimini 15 gün içinde online veya çağrı merkezinden yapın.",
  "Konut ek poliçe varsa aynı gün şirkete bildirim açın.",
  "Geçici barınma masrafları için poliçe ek teminat maddelerini kontrol edin.",
];

const RELATED: RelatedModuleCard[] = [
  { title: "Sigorta Pazaryeri", description: "Konut ve DASK teklif karşılaştırması.", href: "/modul/sigorta-pazaryeri", icon: ShieldCheck },
  { title: "Bina Risk Sorgusu", description: "Yapı risk özeti.", href: "/modul/bina-risk-sorgu", icon: Building2 },
  { title: "Deprem Çantası", description: "Acil çanta listesi.", href: "/modul/deprem-cantasi", icon: Backpack },
];

export default function DepremSigortasiPage() {
  const [sqm, setSqm] = useState("120");
  const [year, setYear] = useState("2005");
  const [cityTier, setCityTier] = useState("1");
  const [primResult, setPrimResult] = useState<number | null>(null);
  const [tckn, setTckn] = useState("");
  const [propId, setPropId] = useState("prop-001");
  const [policies, setPolicies] = useState<Record<string, DaskPolicy>>({});
  const [lookup, setLookup] = useState<DaskPolicy | null>(null);

  useEffect(() => {
    fetch("/data/dask-policy-mock.json")
      .then((r) => r.json())
      .then((data: Record<string, DaskPolicy>) => setPolicies(data))
      .catch(() => setPolicies({}));
  }, []);

  const calcDask = () => {
    const m2 = Math.max(40, Number(sqm) || 120);
    const ageFactor = Number(year) < 2000 ? 1.18 : Number(year) < 2010 ? 1.08 : 1;
    const tier = Number(cityTier) || 1;
    const prim = Math.round(m2 * (42 + tier * 8) * ageFactor);
    setPrimResult(prim);
  };

  const doLookup = () => {
    const id = propId.trim() || `prop-${tckn.slice(-3).padStart(3, "0")}`;
    setLookup(policies[id] ?? null);
  };

  const stats = useMemo(
    () => [
      { label: "Hesaplanan DASK (demo)", value: primResult != null ? `${primResult.toLocaleString("tr-TR")} TRY` : "—", hint: "Yıllık prim" },
      { label: "Şirket sayısı", value: "8", hint: "Kart karşılaştırma" },
      { label: "Tablo satırı", value: "20", hint: "Prim / teminat" },
      { label: "Sorgu kaydı", value: lookup ? lookup.policyNo : "—", hint: "Mock TCKN / ilan" },
    ],
    [primResult, lookup],
  );

  return (
    <ModuleShell
      title="Deprem Sigortası (DASK)"
      subtitle="DASK prim hesaplayıcı, sekiz sigorta şirketi kartı, yirmi satırlık karşılaştırma tablosu ve mock poliçe sorgusu."
      icon={Shield}
      iconAccent="text-teal-300"
      badge="DASK & Konut Ek"
    >
      <ModuleStatGrid stats={stats} />

      <div className="mod-layout mod-layout--split">
        <ModulePanel title="DASK prim hesaplayıcı">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              calcDask();
            }}
          >
            <div>
              <label htmlFor="ds-m2">Brüt m²</label>
              <input id="ds-m2" value={sqm} onChange={(e) => setSqm(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ds-yil">Bina tamamlama yılı</label>
              <input id="ds-yil" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ds-tier">İl risk grubu (demo)</label>
              <select id="ds-tier" value={cityTier} onChange={(e) => setCityTier(e.target.value)}>
                <option value="1">1. derece (yüksek)</option>
                <option value="2">2. derece</option>
                <option value="3">3. derece</option>
              </select>
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Prim hesapla
              </button>
            </div>
          </form>
          {primResult != null ? (
            <p className="mt-3 text-sm text-sky-200">
              Tahmini yıllık DASK primi: <strong>{primResult.toLocaleString("tr-TR")} TRY</strong> (demo formül)
            </p>
          ) : null}
        </ModulePanel>

        <ModulePanel title="Mock DASK / TCKN – ilan sorgusu">
          <div className="mod-form-grid">
            <div>
              <label htmlFor="ds-tckn">TCKN (son 3 hane demo eşleşme)</label>
              <input id="ds-tckn" value={tckn} onChange={(e) => setTckn(e.target.value)} placeholder="11 hane" maxLength={11} />
            </div>
            <div>
              <label htmlFor="ds-prop">İlan kimliği</label>
              <input id="ds-prop" value={propId} onChange={(e) => setPropId(e.target.value)} placeholder="prop-001" />
            </div>
            <div className="mod-form-actions">
              <button type="button" className="mod-btn-primary" onClick={doLookup}>
                <FileSearch className="h-4 w-4" aria-hidden />
                Poliçe sorgula
              </button>
            </div>
          </div>
          {lookup ? (
            <div className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.03] p-3 text-sm">
              <p>
                Poliçe: <strong>{lookup.policyNo}</strong> —{" "}
                <ModuleTag tone={lookup.status === "gecerli" ? "ok" : "risk"}>{lookup.status}</ModuleTag>
              </p>
              <p className="mt-2 text-slate-400">
                Teminat: {lookup.amountTry.toLocaleString("tr-TR")} TRY · Son ödeme: {lookup.lastPayment} · Yeterlilik:{" "}
                {lookup.adequate ? "Uygun" : "Eksik teminat riski"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Kayıt bulunamadı; prop-001 … prop-060 arası demo verisi mevcuttur.</p>
          )}
        </ModulePanel>
      </div>

      <ModulePanel title="Sigorta şirketi kartları">
        <div className="mod-insurer-grid">
          {INSURERS.map((name) => (
            <div key={name} className="mod-insurer-card">
              {name}
              <p className="mt-1 text-xs font-normal text-slate-400">DASK + konut ek paket</p>
            </div>
          ))}
        </div>
      </ModulePanel>

      <ModulePanel title="Yirmi satırlık prim karşılaştırma tablosu">
        <ModuleDataTable
          caption="DASK ve konut ek prim karşılaştırması"
          columns={[
            { key: "sirket", header: "Şirket", render: (r) => r.sirket },
            { key: "daskPrim", header: "DASK prim", render: (r) => r.daskPrim },
            { key: "konutEk", header: "Konut ek", render: (r) => r.konutEk },
            { key: "teminat", header: "Teminat", render: (r) => r.teminat },
            { key: "hasarHiz", header: "Hasar hizmeti", render: (r) => r.hasarHiz },
            { key: "online", header: "Online", render: (r) => r.online },
          ]}
          rows={COMPARE_ROWS}
        />
      </ModulePanel>

      <ModulePanel title="Tamamlayıcı deprem / konut sigortası">
        <p className="text-sm leading-relaxed text-slate-400">
          DASK yalnızca bina bedelini sınırlı teminatla karşılar. Eşya, kira kaybı, alternatif konaklama ve müstakil
          yapı unsurları için konut paketi veya deprem ek teminatı değerlendirilmelidir. İpotekli konutlarda banka
          lehtar şartları poliçe seçimini etkiler.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-400">
          <li>Deprem dışı yangın, sel, hırsızlık kalemleri</li>
          <li>Geçici barınma ve kira kaybı limitleri</li>
          <li>Cam, doğrama ve dış cephe ekleri (villa / rezidans)</li>
        </ul>
      </ModulePanel>

      <ModulePanel title="Hasar sonrası başvuru rehberi">
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-300">
          {DAMAGE_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </ModulePanel>

      <ModulePanel title="Sık sorulan sorular">
        <div className="mod-faq-list">
          {FAQ.map((item) => (
            <details key={item.q} className="mod-faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </ModulePanel>

      <ModuleRelatedStrip modules={RELATED} />
    </ModuleShell>
  );
}

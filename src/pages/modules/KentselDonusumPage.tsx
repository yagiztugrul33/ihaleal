import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  Gavel,
  Landmark,
  Scale,
  Search,
  Users,
} from "lucide-react";
import type { LatLngExpression } from "leaflet";
import { ModuleDataTable, ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { ModuleRelatedStrip } from "./ModuleRelatedStrip";
import type { RelatedModuleCard } from "./ModuleRelatedStrip";
import { ShieldCheck, HeartHandshake, ClipboardList } from "lucide-react";

const KentselDonusumMapInner = lazy(() => import("./KentselDonusumMapInner"));

const ADDRESS_PRESETS: { q: string; label: string; city: string; district: string; zoneId: string; center: LatLngExpression; zoom: number }[] = [
  { q: "kadikoy moda", label: "İstanbul Kadıköy — Moda", city: "İstanbul", district: "Kadıköy", zoneId: "kd-ist-kadikoy", center: [40.99, 29.03], zoom: 13 },
  { q: "esenler", label: "İstanbul Esenler — riskli alan", city: "İstanbul", district: "Esenler", zoneId: "kd-ist-esenler", center: [41.06, 28.89], zoom: 13 },
  { q: "bornova", label: "İzmir Bornova", city: "İzmir", district: "Bornova", zoneId: "kd-izm-bornova", center: [38.46, 27.23], zoom: 13 },
  { q: "cankaya", label: "Ankara Çankaya", city: "Ankara", district: "Çankaya", zoneId: "kd-ank-cankaya", center: [39.9, 32.85], zoom: 13 },
];

const RIGHTS = [
  "Riskli yapı tespitine itiraz ve ikinci heyet talebi hakkı",
  "Kira yardımı veya geçici barınma desteği için başvuru sırası",
  "Kat malikleri kurulu kararlarında oy ve temsil güvencesi",
  "Sözleşme ve mimari proje ön inceleme talebi",
  "Hak ediş ödemelerinin şeffaf takibi ve teminat mektubu",
  "Sigorta ve DASK yenileme sürecinde bilgilendirilme",
  "Tapu ve iskan sonrası değer artışına ilişkin vergi danışmanlığı yönlendirmesi",
  "Uzlaşma toplantılarında bağımsız teknik rapor sunma hakkı",
];

const DISPUTE_STEPS = [
  { title: "Ön bilgilendirme", body: "Belediye ve Çevre Şehircilik bildirimlerinin süre içinde tebliğ edilip edilmediğini kontrol edin." },
  { title: "İtiraz dilekçesi", body: "Riskli yapı kararına 30 günlük sürede itiraz; eksik belge listesi ile birlikte kayıt altına alın." },
  { title: "Uzlaşma masası", body: "Müteahhit ve kat malikleri arasında pay oranı, geçici konut ve süre takvimi yazılı hale getirilir." },
  { title: "Bağımsız ekspertiz", body: "Lisanslı statik rapor ile resmi tespit raporunu karşılaştırın; farklılıklar tutanak altına alınır." },
  { title: "Arabuluculuk / dava", body: "Anlaşmazlık devam ederse arabuluculuk kanalı veya idari yargı yolu değerlendirilir." },
];

const SUPPORT_ROWS = [
  { id: "s1", kurum: "Çevre Şehircilik İl Müdürlüğü", hizmet: "Riskli alan / yapı kaydı sorgusu", iletisim: "ALO 181 / e-Devlet", sure: "7–15 iş günü" },
  { id: "s2", kurum: "Belediye Kentsel Dönüşüm Müdürlüğü", hizmet: "Uzlaşma ve ruhsat süreci", iletisim: "İlçe belediyesi", sure: "Randevulu" },
  { id: "s3", kurum: "TOKİ / Emlak Konut (proje bazlı)", hizmet: "Kamusal dönüşüm projeleri", iletisim: "Proje ofisi", sure: "Değişken" },
  { id: "s4", kurum: "Baro ve adli yardım", hizmet: "Sözleşme inceleme", iletisim: "Baro yönlendirme", sure: "1–3 gün" },
];

const CASES = [
  {
    title: "Kadıköy — Moda sokak dokusu",
    body: "Dar parsel ve sit yakınlığı nedeniyle kat adedi sınırlandı; kira yardımı 18 ay sürdü, yapı 2024’te iskan aldı.",
  },
  {
    title: "Esenler — kütle dönüşümü",
    body: "6306 kapsamında blok bazlı anlaşma; geçici konut TOKİ tahsisi ile tamamlandı, toplam süre 26 ay.",
  },
  {
    title: "Bayraklı — rezerv alan",
    body: "Rezerv alan ilanı sonrası pay oranı yeniden hesaplandı; uzlaşma masasında bağımsız ekspertiz raporu belirleyici oldu.",
  },
];

const FAQ = [
  { q: "Riskli yapı ile riskli alan farkı nedir?", a: "Riskli yapı bina bazlı tespit; riskli alan ise plan ve imar kararıyla belirlenen bölgesel kapsamdır. Her ikisinde de farklı uzlaşma ve kamulaştırma prosedürleri uygulanabilir." },
  { q: "Kira yardımı kimlere verilir?", a: "Genellikle riskli yapıda ikamet eden ve sözleşmeyle kanıtlanan kiracı veya maliklere, mevzuattaki süre ve tavanlara göre ödenir. Başvuru belgeleri il müdürlüğü web sitesinde listelenir." },
  { q: "Kat karşılığı sözleşmede nelere dikkat edilmeli?", a: "Teslim süresi, geçici konut, arsa payı, ortak alan metrajı, cezai şart ve teminat mektubu maddeleri yazılı ve ekli projeyle uyumlu olmalıdır." },
  { q: "İtiraz süresi ne kadar?", a: "Tebligat tarihinden itibaren yasal süre içinde itiraz edilmezse karar kesinleşir; süre ve merci tebligat metninde belirtilir." },
  { q: "DASK zorunlu mu?", a: "Deprem sigortası (DASK) riskli yapı sürecinde ayrıca takip edilir; poliçe güncelliği tapu ve iskan aşamalarında sorulabilir." },
  { q: "Müteahhit değişirse haklarım korunur mu?", a: "Devir halinde sözleşme hükümleri ve teminatlar devralan müteahhit için geçerli olacak şekilde güncellenmelidir; noter onaylı devir önerilir." },
  { q: "Kentsel dönüşüm vergisi var mı?", a: "İskan sonrası değer artışı ve emlak vergisi taraf değişiklikleri için mali müşavir desteği alınması önerilir; istisna ve muafiyetler dönemsel değişir." },
  { q: "Haritadaki bölgeler resmi midir?", a: "Bu modüldeki katman demo GeoJSON verisidir; bağlayıcı karar için belediye ve il müdürlüğü kayıtları esas alınır." },
];

const RELATED: RelatedModuleCard[] = [
  { title: "Bina Risk Sorgusu", description: "Yapı yaşı ve taşıyıcı sistem özet skoru.", href: "/modul/bina-risk-sorgu", icon: ShieldCheck },
  { title: "Aile Acil Planı", description: "Toplanma ve iletişim planı oluşturun.", href: "/modul/aile-acil-plan", icon: HeartHandshake },
  { title: "Güçlendirme Rehberi", description: "Takviye yöntemleri ve maliyet bandı.", href: "/modul/guclendirme-rehberi", icon: ClipboardList },
];

function ProcessSvg() {
  return (
    <svg className="mod-process-svg" viewBox="0 0 640 120" role="img" aria-label="Kentsel dönüşüm beş adımlı süreç">
      <title>Kentsel dönüşüm süreci</title>
      {[
        { x: 20, label: "Tespit" },
        { x: 150, label: "İtiraz / uzlaşma" },
        { x: 290, label: "Proje" },
        { x: 430, label: "Yıkım / inşa" },
        { x: 560, label: "İskan" },
      ].map((step, i) => (
        <g key={step.label}>
          <circle cx={step.x} cy={50} r={22} fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth={2} />
          <text x={step.x} y={55} textAnchor="middle" fill="#e2e8f0" fontSize={14} fontWeight={600}>
            {i + 1}
          </text>
          <text x={step.x} y={95} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            {step.label}
          </text>
          {i < 4 ? <line x1={step.x + 24} y1={50} x2={step.x + 106} y2={50} stroke="#475569" strokeWidth={2} strokeDasharray="4 3" /> : null}
        </g>
      ))}
    </svg>
  );
}

export default function KentselDonusumPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<(typeof ADDRESS_PRESETS)[0] | null>(ADDRESS_PRESETS[0]);
  const [highlightId, setHighlightId] = useState<string | null>("kd-ist-kadikoy");

  const search = useCallback(() => {
    const q = query.trim().toLowerCase();
    const hit =
      ADDRESS_PRESETS.find((p) => p.q.includes(q) || p.label.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)) ??
      ADDRESS_PRESETS[0];
    setResult(hit);
    setHighlightId(hit.zoneId);
  }, [query]);

  const stats = useMemo(
    () => [
      { label: "Aktif bölge (demo)", value: "12", hint: "3 il" },
      { label: "Seçili ilçe risk", value: result ? `${result.district}` : "—", hint: "Harita odak" },
      { label: "Ortalama süre", value: "18–28 ay", hint: "Uzlaşmalı projeler" },
      { label: "Destek hattı", value: "ALO 181", hint: "Çevre Şehircilik" },
    ],
    [result],
  );

  return (
    <ModuleShell
      title="Kentsel Dönüşüm"
      subtitle="Riskli alan ve yapı süreçlerini harita, haklar, uzlaşma yol haritası ve kurum destek tablosu ile tek ekranda izleyin."
      icon={Building2}
      iconAccent="text-amber-300"
      badge="6306 / Rezerv Alan"
    >
      <ModuleStatGrid stats={stats} />

      <ModulePanel title="Bölge haritası ve adres sorgusu">
        <form
          className="mod-form-grid mod-no-print"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <div>
            <label htmlFor="kd-adres">Adres veya mahalle</label>
            <input
              id="kd-adres"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn. Kadıköy Moda, Esenler, Bornova"
            />
          </div>
          <div className="mod-form-actions">
            <button type="submit" className="mod-btn-primary">
              <Search className="h-4 w-4" aria-hidden />
              Bölgeyi göster
            </button>
          </div>
        </form>
        {result ? (
          <p className="mt-3 text-sm text-slate-400">
            Sonuç: <strong className="text-slate-200">{result.label}</strong> — demo riskli alan poligonu vurgulandı.
          </p>
        ) : null}
        <Suspense
          fallback={
            <div className="flex min-h-[22rem] items-center justify-center text-sm text-slate-400">
              Harita yükleniyor…
            </div>
          }
        >
          <KentselDonusumMapInner highlightId={highlightId} flyCenter={result?.center ?? null} flyZoom={result?.zoom} />
        </Suspense>
      </ModulePanel>

      <ModulePanel title="Beş adımlı süreç özeti">
        <ProcessSvg />
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Süreç; resmi tespit tebliğinden iskan ve tapu tesciline kadar uzanır. Her adımda yazılı kayıt ve tarihli tutanak
          tutulması uzlaşma gücünü artırır.
        </p>
      </ModulePanel>

      <div className="mod-layout mod-layout--split">
        <ModulePanel title="6306 ve ilgili mevzuat özeti">
          <p className="text-sm leading-relaxed text-slate-400">
            6306 sayılı Kanun; riskli yapı ve alanların dönüştürülmesi, kira yardımı, uzlaşma ve kamulaştırma usullerini
            çerçeveler. Rezerv alan ilanları imar planı ile birlikte okunmalıdır. Bu özet bilgilendirme amaçlıdır; bağlayıcı
            karar için resmi gazete ve il müdürlüğü kayıtları esas alınır.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-400">
            <li>Riskli yapı tespit raporu ve itiraz süreleri</li>
            <li>Kat malikleri en az ⅔ çoğunluk ile anlaşma</li>
            <li>Geçici konut ve kira yardımı başvuru koşulları</li>
            <li>Yapı denetim ve iskan öncesi DASK güncelliği</li>
          </ul>
        </ModulePanel>

        <ModulePanel title="Malik ve kiracı hakları (8 madde)">
          <div className="mod-rights-list">
            {RIGHTS.map((r) => (
              <div key={r} className="mod-rights-item">
                <Scale className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden />
                {r}
              </div>
            ))}
          </div>
        </ModulePanel>
      </div>

      <ModulePanel title="Anlaşmazlık yol haritası">
        <div className="mod-roadmap">
          {DISPUTE_STEPS.map((s, i) => (
            <div key={s.title} className="mod-roadmap-step">
              <span className="mod-roadmap-num">{i + 1}</span>
              <div>
                <p className="font-semibold text-slate-100">{s.title}</p>
                <p className="text-sm text-slate-400">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </ModulePanel>

      <ModulePanel title="Kurum destek tablosu">
        <ModuleDataTable
          caption="Kentsel dönüşüm destek kanalları"
          columns={[
            { key: "kurum", header: "Kurum", render: (r) => r.kurum },
            { key: "hizmet", header: "Hizmet", render: (r) => r.hizmet },
            { key: "iletisim", header: "İletişim", render: (r) => r.iletisim },
            { key: "sure", header: "Süre", render: (r) => r.sure },
          ]}
          rows={SUPPORT_ROWS}
        />
      </ModulePanel>

      <ModulePanel title="Örnek vaka çalışmaları">
        <div className="mod-case-grid">
          {CASES.map((c) => (
            <article key={c.title} className="mod-case-card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
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

      <div className="mod-cta-row mod-no-print">
        <Link to="/kat-karsiligi-arsa" className="mod-btn-primary">
          <Landmark className="h-4 w-4" aria-hidden />
          Kat karşılığı arsa modülü
          <ChevronRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
        </Link>
        <Link to="/modul/uzman-randevu" className="mod-btn-secondary">
          <Users className="h-4 w-4" aria-hidden />
          Uzman randevusu al
        </Link>
        <Link to="/modul/bina-risk-sorgu" className="mod-btn-secondary">
          <Gavel className="h-4 w-4" aria-hidden />
          Bina risk sorgusu
        </Link>
      </div>

      <ModuleRelatedStrip modules={RELATED} />
    </ModuleShell>
  );
}

import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Baby,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  Phone,
  Printer,
  Utensils,
} from "lucide-react";
import { ModulePanel, ModuleShell, ModuleTag } from "./ModuleShell";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

type PlanState = {
  rallyAddress: string;
  rallyAlt: string;
  externalContact: string;
  documents: string[];
  utilities: string[];
  seniorsPets: string;
  commsChannel: string;
};

const DEFAULT: PlanState = {
  rallyAddress: "Moda sahil parkı girişi (örnek toplanma noktası)",
  rallyAlt: "İkinci rota: Mahalle muhtarlığı önü",
  externalContact: "+90 5xx xxx xx xx (şehir dışı akraba)",
  documents: ["kimlik", "tapu-fotokopi", "dask-poliçe", "ilaç-listesi"],
  utilities: ["ana-su", "gaz-ana-vana", "elektrik-pano"],
  seniorsPets: "Yaşlı birey + evcil hayvan taşıma çantası listesi",
  commsChannel: "WhatsApp aile grubu + SMS yedek",
};

const DOC_OPTIONS = [
  { id: "kimlik", label: "Nüfus cüzdanı / ikamet" },
  { id: "tapu-fotokopi", label: "Tapu veya kira sözleşmesi özeti" },
  { id: "dask-poliçe", label: "DASK ve konut poliçe numaraları" },
  { id: "ilaç-listesi", label: "Reçeteli ilaç listesi ve dozaj" },
  { id: "veteriner", label: "Evcil hayvan sağlık kartı" },
  { id: "okul", label: "Okul iletişim ve veli onayı" },
] as const;

const UTIL_OPTIONS = [
  { id: "ana-su", label: "Ana su vanası kapatma sırası" },
  { id: "gaz-ana-vana", label: "Doğalgaz ana vanası" },
  { id: "elektrik-pano", label: "Elektrik panosu etiketleme" },
  { id: "asansor", label: "Asansör kullanmama kuralı" },
] as const;

export default function AileAcilPlanPage() {
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<PlanState>(DEFAULT);
  const [finalized, setFinalized] = useState(false);

  const steps = useMemo(
    () => [
      { title: "Toplanma noktası", icon: HeartHandshake, body: "Evde ve dışarıda iki net buluşma adresi belirleyin." },
      { title: "Dış iletişim hattı", icon: Phone, body: "Şehir dışı güvenilir kişi ve ikinci hat." },
      { title: "Belgeler", icon: FileText, body: "Taşınabilir evrak seti ve yedek dijital kopya." },
      { title: "Tesisat güvenliği", icon: Utensils, body: "Deprem sonrası su, gaz ve elektrik sıralaması." },
      { title: "Yararlanıcılar", icon: Baby, body: "Yaşlı, çocuk ve evcil hayvan ihtiyaçları." },
      { title: "Özet ve paylaşım", icon: Bell, body: "Yazdır veya WhatsApp ile kısa metin gönder." },
    ],
    [],
  );

  const shareBody = useMemo(() => {
    const lines = [
      "İhaleal Aile Acil Planı — özet",
      `Toplanma: ${state.rallyAddress}`,
      `Alternatif: ${state.rallyAlt}`,
      `Dış hat: ${state.externalContact}`,
      `Belgeler: ${state.documents.join(", ")}`,
      `Tesisat: ${state.utilities.join(", ")}`,
      `Özel ihtiyaç: ${state.seniorsPets}`,
      `İletişim: ${state.commsChannel}`,
      `Detay: ${typeof window !== "undefined" ? window.location.origin : ""}/modul/aile-acil-plan`,
    ];
    return lines.join("\n");
  }, [state]);

  const waLink = useMemo(() => {
    const text = encodeURIComponent(shareBody);
    return `https://wa.me/?text=${text}`;
  }, [shareBody]);

  const copyPlan = useCallback(() => {
    void navigator.clipboard.writeText(shareBody);
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", { detail: { message: "Plan metni panoya kopyalandı.", type: "success" } }),
    );
  }, [shareBody]);

  const toggleList = (key: "documents" | "utilities", id: string) => {
    setState((s) => {
      const list = s[key];
      const has = list.includes(id);
      return { ...s, [key]: has ? list.filter((x) => x !== id) : [...list, id] };
    });
  };

  const next = () => {
    if (step < 5) setStep((v) => (v + 1) as Step);
    else setFinalized(true);
  };

  const prev = () => {
    if (step > 0) setStep((v) => (v - 1) as Step);
  };

  return (
    <ModuleShell
      title="Aile Acil Planı"
      subtitle="Altı adımda toplanma, iletişim, evrak ve tesisat sırasını netleştirir; çıktıyı yazdırabilir veya WhatsApp üzerinden paylaşabilirsiniz."
      badge="Hane Hazırlığı"
      icon={HeartHandshake}
      iconAccent="text-pink-300"
    >
      <ModulePanel title="Rehberli plan sihirbazı">
        <div className="mod-layout mod-layout--split">
          <div className="space-y-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              return (
                <div
                  key={s.title}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    active ? "border-pink-500/40 bg-pink-500/10" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 text-pink-300" aria-hidden />
                    <div>
                      <p className="font-semibold text-white">
                        {i + 1}. {s.title}
                      </p>
                      <p className="text-xs text-slate-400">{s.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link
              to="/modul/bina-risk-sorgu"
              className="inline-flex items-center gap-2 text-sm text-sky-300 hover:underline"
            >
              Bina risk özetine geç <ChevronRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="space-y-4">
            {step === 0 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="rally">Birincil toplanma yeri</label>
                  <textarea
                    id="rally"
                    value={state.rallyAddress}
                    onChange={(e) => setState((s) => ({ ...s, rallyAddress: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="rally2">Yedek rota / ikinci buluşma</label>
                  <textarea
                    id="rally2"
                    value={state.rallyAlt}
                    onChange={(e) => setState((s) => ({ ...s, rallyAlt: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="ext">Şehir dışı güvenilir kişi</label>
                  <input
                    id="ext"
                    value={state.externalContact}
                    onChange={(e) => setState((s) => ({ ...s, externalContact: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="comms">Bildirim kanalı</label>
                  <input
                    id="comms"
                    value={state.commsChannel}
                    onChange={(e) => setState((s) => ({ ...s, commsChannel: e.target.value }))}
                    placeholder="WhatsApp grubu adı, SMS anahtar kelimesi…"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Afet anında hatlar yoğunlaşır; kısa kodlu mesajlar ve sabit saatli &quot;her şey yolunda&quot; kontrolü
                  önerilir.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Taşınacak evrakları işaretleyin:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DOC_OPTIONS.map((d) => (
                    <label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={state.documents.includes(d.id)}
                        onChange={() => toggleList("documents", d.id)}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Tesisat güvenliği için görev dağılımı:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {UTIL_OPTIONS.map((u) => (
                    <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={state.utilities.includes(u.id)}
                        onChange={() => toggleList("utilities", u.id)}
                      />
                      {u.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="seniors">Yaşlı, çocuk ve evcil hayvan notları</label>
                  <textarea
                    id="seniors"
                    rows={4}
                    value={state.seniorsPets}
                    onChange={(e) => setState((s) => ({ ...s, seniorsPets: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Acil çantada su, yedek ilaç, küçük güç bankası ve evcil hayvan için gıda önerilir. Mahalle yardım
                  gönüllüsü ve komşu kontaklarını da ekleyin.
                </p>
              </div>
            )}

            {step === 5 && (
              <div id="print-aile-plan" className="mod-print-root space-y-4 rounded-xl border border-white/12 bg-slate-950/50 p-4 print:bg-white print:text-black">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ModuleTag tone="ok">Plan taslağı</ModuleTag>
                  {finalized ? <ModuleTag tone="warn">Kilitlendi</ModuleTag> : null}
                </div>
                <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-slate-200">
                  {shareBody}
                </pre>
                <div className="flex flex-wrap gap-3 mod-print-actions">
                  <button type="button" className="mod-btn-secondary mod-no-print" onClick={copyPlan}>
                    Metni kopyala
                  </button>
                  <a className="mod-btn-primary mod-no-print" href={waLink} target="_blank" rel="noopener noreferrer">
                    WhatsApp ile paylaş
                  </a>
                  <button type="button" className="mod-btn-secondary" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" aria-hidden />
                    Yazdır / PDF
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Yazdırma sırasında yalnızca plan kutusu görünür hale getirilir; tarayıcı &quot;PDF olarak kaydet&quot;
                  seçeneğiyle arşivleyebilirsiniz.
                </p>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3">
              <button type="button" className="mod-btn-secondary" onClick={prev} disabled={step === 0}>
                <ChevronLeft className="rtl:rotate-180 h-4 w-4" aria-hidden />
                Geri
              </button>
              {step < 5 ? (
                <button type="button" className="mod-btn-primary" onClick={next}>
                  İleri <ChevronRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button type="button" className="mod-btn-primary" onClick={() => setFinalized(true)} disabled={finalized}>
                  Planı onayla
                </button>
              )}
            </div>
          </div>
        </div>
      </ModulePanel>
    </ModuleShell>
  );
}

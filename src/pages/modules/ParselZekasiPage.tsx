import { ArrowRight, MapPin } from "lucide-react";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { LocationIntelligenceWorkbench } from "@/components/location/LocationIntelligenceWorkbench";
import { Button } from "@/components/ui/button";

const DECISION_FRAME = [
  {
    title: "Likidite okunabilirliği",
    detail: "Parselin bulunduğu bölgede satış süresi ve talep yoğunluğu birlikte değerlendirilir.",
  },
  {
    title: "Operasyon erişimi",
    detail: "Ulaşım, lojistik ve kamu hizmetlerine erişim proje teslim süresini doğrudan etkiler.",
  },
  {
    title: "Risk tamponu",
    detail: "Deprem, zemin, güvenlik ve plan notu belirsizlikleri skor üzerinde aşağı yönlü etki yapar.",
  },
  {
    title: "Gelir potansiyeli",
    detail: "Kira/satış bandı ve segment talebiyle gelir üretim kapasitesi önceliklendirilir.",
  },
] as const;

const DECISION_STEPS = [
  "1) Ada/parsel veya konum pin'i girilir; temel çevresel veri seti çekilir.",
  "2) SES + erişim + eğitim + güvenlik skorları normalize edilip tek panelde görünür.",
  "3) Zayıf katmanlar için risk notu açılır ve aksiyon önerisi üretilir.",
  "4) Sonuç, değerleme ve fizibilite modülüne karar özeti olarak aktarılır.",
] as const;

const LINKED_TOOLS = [
  { label: "Şehir rehberi", hint: "Makro şehir sinyalini önce oku" },
  { label: "Deprem risk haritası", hint: "Afet riskini karar öncesi doğrula" },
  { label: "GES analizi", hint: "Enerji uyumlu arazi senaryosu çalış" },
  { label: "Değerleme modülü", hint: "Nihai fiyat bandını konum skoru ile birleştir" },
] as const;

export default function ParselZekasiPage() {
  return (
    <ModuleShell
      title="Parsel Zekası"
      subtitle="Konum zekası katmanlarıyla bir parselin çevresel değerini SES, erişim, eğitim ve güvenlik kırılımında analiz edin."
      icon={MapPin}
      iconAccent="text-cyan-300"
      badge="GIS + AI"
    >
      <div className="space-y-4">
        <ModulePanel title="Neden Konum Zekası">
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              Hedonik teoriye göre mülk fiyatının belirleyici kısmı komşuluk ve erişim kalitesinden gelir. Bu nedenle ada/parsel kararında
              sadece EMSAL değil, çevresel sinyaller de zorunlu olarak birlikte okunmalıdır.
            </p>
            <p>
              Bu modül, Palantir/Endeksa yaklaşımına benzer katmanlı ön analiz üretir: SES, POI erişimi, eğitim ve güvenlik skorları
              ağırlıklı birleşik bir konum puanına dönüşür.
            </p>
          </div>
        </ModulePanel>

        <ModulePanel title="Katmanlar">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-200">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">SES</p>
              <p className="mt-1">SEGE + TÜİK mantığıyla gelir, eğitim ve meslek kompozisyonu.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">POI / erişim</p>
              <p className="mt-1">Market, okul, hastane, metro ve park erişimi; toplu taşıma en güçlü pozitif etki.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">Eğitim</p>
              <p className="mt-1">Okul yoğunluğu, mesafe ve bölgesel eğitim seviyesi birlikte değerlendirilir.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">Güvenlik</p>
              <p className="mt-1">Proxy güvenlik sinyalleri (aydınlatma, müdahale süresi, risk göstergeleri).</p>
            </div>
          </div>
        </ModulePanel>

        <LocationIntelligenceWorkbench title="Konum/parsel gir, katman skorlarını üret" compact />

        <ModulePanel title="Karar çerçevesi (operasyonel)">
          <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-200">
            {DECISION_FRAME.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">{item.title}</h3>
                <p className="mt-2 leading-relaxed">{item.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Amaç tek skor üretmek değil; yatırım, satış ve proje ekipleri için açıklanabilir karar notu oluşturmaktır.
          </p>
        </ModulePanel>

        <ModulePanel title="Adım adım kullanım kılavuzu">
          <ol className="space-y-2 text-sm text-slate-200">
            {DECISION_STEPS.map((step) => (
              <li key={step} className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-slate-200">
              <h3 className="font-semibold text-emerald-100">Kime göre</h3>
              <p className="mt-1">
                Yatırımcı riskli bölgeleri erken eler, müteahhit faz planını günceller, emlakçı fiyat anlatısını veriyle güçlendirir.
              </p>
            </article>
            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-slate-100">
              <h3 className="font-semibold">Dürüst sınır</h3>
              <p className="mt-1">
                Konum skoru resmi ekspertiz veya imar uygunluk onayının yerine geçmez; karar öncesi saha ve hukuk doğrulaması gerekir.
              </p>
            </article>
          </div>
        </ModulePanel>

        <ModulePanel title="Bağlı araçlar ve entegrasyon">
          <div className="grid gap-3 md:grid-cols-2">
            {LINKED_TOOLS.map((tool) => (
              <article key={tool.label} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
                <p className="font-semibold text-slate-100">{tool.label}</p>
                <p className="mt-1 text-xs text-slate-400">{tool.hint}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Bu modülün çıktısı şehir/GES/değerleme akışına taşındığında rol bazlı iş akışında karar tutarlılığı artar.
          </p>
        </ModulePanel>

        <ModulePanel title="Örnek ve Dürüst Sınır">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Örnek analiz</h3>
              <p className="mt-2">
                Kadıköy örneğinde metroya yakınlık ve okul yoğunluğu artarken birleşik skor yükselir; güvenlik proxy zayıfsa nihai skor
                baskılanır.
              </p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Kime göre</h3>
              <p className="mt-2">Alıcı aşırı ödeme riskini, satıcı konumsal primini, yatırımcı fırsat ve risk dengesini görür.</p>
            </article>
            <article className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              <h3 className="text-xs font-black uppercase tracking-[0.12em]">Veri kaynağı + sınır</h3>
              <p className="mt-2">
                Demo + kamuya açık veri ile ön analizdir. Canlıda TÜİK/SEGE resmi entegrasyon ve yerel doğrulama olmadan kesin karar
                verilmemelidir.
              </p>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
            <p className="text-sm text-cyan-100">Katman skorlarını imar ve fizibilite raporuna taşıyarak tek panel karar akışı kurun.</p>
            <Button type="button" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              Değerleme başlat <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}

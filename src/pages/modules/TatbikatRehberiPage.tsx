import { useState } from "react";
import {
  Building2,
  ClipboardList,
  FileDown,
  Gamepad2,
  HeartPulse,
  Users,
  Video,
} from "lucide-react";
import { ModulePanel, ModuleShell } from "./ModuleShell";

type ScenarioId = "isyeri" | "okul" | "site" | "belediye";

const SCENARIOS: {
  id: ScenarioId;
  label: string;
  icon: typeof Building2;
  duration: string;
  checklist: string[];
  roles: string[];
}[] = [
  {
    id: "isyeri",
    label: "İş yeri ve ofis",
    icon: Building2,
    duration: "45–60 dk",
    checklist: [
      "Çök-kapan-tutun anonsu ve kat sorumluları",
      "Asansör ve yangın merdiveni tahliye sırası",
      "Toplanma alanı ve yoklama listesi",
      "IT ve kritik evrak yedekleme kontrolü",
    ],
    roles: ["İşveren temsilcisi", "İSG uzmanı", "Bina yöneticisi", "İlk yardım ekibi"],
  },
  {
    id: "okul",
    label: "Okul ve kreş",
    icon: Gamepad2,
    duration: "30–40 dk",
    checklist: [
      "Sınıf bazlı tahliye rotası",
      "Engelli öğrenci refakat planı",
      "Veli bilgilendirme SMS şablonu",
      "Bahçe toplanma alanı işaretlemesi",
    ],
    roles: ["Müdür yardımcısı", "Rehber öğretmen", "Zümre başkanı", "Güvenlik"],
  },
  {
    id: "site",
    label: "Site ve apartman",
    icon: Users,
    duration: "35–50 dk",
    checklist: [
      "Blok sorumluları ve asansör kapatma",
      "Otopark çıkış ve araç trafiği",
      "Yaşlı ve bebek refakat listesi",
      "Su-gaz-elektrik ana vanaları",
    ],
    roles: ["Yönetici", "Denetçi", "Gönüllü komşu", "Site güvenliği"],
  },
  {
    id: "belediye",
    label: "Belediye ve kamu",
    icon: ClipboardList,
    duration: "60–90 dk",
    checklist: [
      "Kriz masası aktivasyonu",
      "Basın ve vatandaş hattı",
      "Lojistik ve toplanma alanı haritası",
      "Sağlık ve AFAD koordinasyon noktası",
    ],
    roles: ["Kriz koordinatörü", "Basın sözcüsü", "Lojistik", "Saha ekipleri"],
  },
];

const KIDS_GAMES = [
  { title: "Çök-kapan-tutun parkuru", body: "Oyun alanında minderlerle üç adımlı hareket; süreyi kronometre ile ölçün." },
  { title: "Acil çanta hazırlama", body: "Su, düdük, fener ve aile fotoğrafı kartlarını doğru kutuya yerleştirme yarışması." },
  { title: "Güvenli oda haritası", body: "Ev planı üzerinde masa altı ve kapı kasası gibi güvenli bölgeleri boyama." },
  { title: "İletişim kartı", body: "Aile üyelerinin numaralarını ezberleme ve dış iletişim kişisini seçme." },
];

const ELDERLY = [
  { title: "İlaç ve kimlik seti", body: "Haftalık ilaç kutusu, reçete özeti ve acil iletişim kartı her zaman ulaşılabilir yerde tutulmalıdır." },
  { title: "Mobilite planı", body: "Asansör kullanılmaz; refakatçi ve tekerlekli sandalye rampası rotası önceden işaretlenir." },
  { title: "İşitme ve görme desteği", body: "Anons yerine titreşimli uyarı; büyük puntolu talimat kartları ve işaret dili videosu." },
];

export default function TatbikatRehberiPage() {
  const [tab, setTab] = useState<ScenarioId>("isyeri");
  const active = SCENARIOS.find((s) => s.id === tab)!;
  const ActiveIcon = active.icon;

  const downloadManagerPdf = () => {
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: {
          message: "Yönetici tatbikat şablonu (PDF) indirme bağlantısı e-postanıza gönderildi.",
          type: "success",
        },
      }),
    );
  };

  return (
    <ModuleShell
      title="Tatbikat Rehberi"
      subtitle="İş yeri, okul, site ve kamu senaryoları için adım adım kontrol listeleri, yönetici şablonu ve yaş gruplarına özel içerik."
      badge="Kurumsal Hazırlık"
      icon={ClipboardList}
    >
      <ModulePanel title="Senaryo seçimi">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tatbikat senaryoları">
          {SCENARIOS.map((s) => {
            const Icon = s.icon;
            const activeTab = tab === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={activeTab}
                className={
                  activeTab
                    ? "inline-flex items-center gap-2 rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-2 text-sm font-normal text-[var(--metin-ikincil)]"
                    : "inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-normal text-slate-300 hover:bg-white/[0.06]"
                }
                onClick={() => setTab(s.id)}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[var(--metin-ikincil)]">
              <ActiveIcon className="h-5 w-5" aria-hidden />
              <h3 className="font-normal text-white">{active.label}</h3>
              <span className="ms-auto text-xs text-slate-400">Süre: {active.duration}</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {active.checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[var(--metin-ikincil)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-normal uppercase tracking-wide text-slate-500">Roller</p>
            <p className="text-sm text-slate-400">{active.roles.join(" · ")}</p>
          </div>
          <div className="rounded-[20px] border border-dashed border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4">
            <h3 className="flex items-center gap-2 font-normal text-white">
              <FileDown className="h-4 w-4 text-[var(--metin-ikincil)]" aria-hidden />
              Yönetici tatbikat şablonu (PDF)
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Kapak sayfası, kat sorumluları tablosu, yoklama formu ve değerlendirme anketi içeren kurumsal şablon.
            </p>
            <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
              <li>12 sayfa A4, yazdırılabilir</li>
              <li>ISO 22301 uyumlu özet bölüm</li>
              <li>İmza ve fotoğraf eki alanları</li>
            </ul>
            <button type="button" className="mod-btn-primary mt-4" onClick={downloadManagerPdf}>
              <FileDown className="h-4 w-4" aria-hidden />
              PDF şablonunu indir
            </button>
          </div>
        </div>
      </ModulePanel>

      <div className="mod-layout mt-6 lg:grid-cols-2">
        <ModulePanel title="Çocuklar için oyunlaştırılmış etkinlikler">
          <div className="grid gap-3 sm:grid-cols-2">
            {KIDS_GAMES.map((g) => (
              <div key={g.title} className="rounded-[10px] border border-white/10 p-3">
                <div className="flex items-center gap-2 text-[var(--metin-ikincil)]">
                  <Gamepad2 className="h-4 w-4" aria-hidden />
                  <h4 className="text-sm font-normal text-white">{g.title}</h4>
                </div>
                <p className="mt-1 text-xs text-slate-400">{g.body}</p>
              </div>
            ))}
          </div>
        </ModulePanel>

        <ModulePanel title="Yaşlı bireyler ve refakat">
          <div className="space-y-3">
            {ELDERLY.map((e) => (
              <div key={e.title} className="flex gap-3 rounded-[10px] border border-white/10 p-3">
                <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-[var(--metin-ikincil)]" aria-hidden />
                <div>
                  <h4 className="text-sm font-normal text-white">{e.title}</h4>
                  <p className="mt-1 text-xs text-slate-400">{e.body}</p>
                </div>
              </div>
            ))}
          </div>
        </ModulePanel>
      </div>

      <ModulePanel title="Güvenlik videosu">
        <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/40">
          <video
            className="aspect-video w-full"
            controls
            preload="metadata"
            poster="/images/auction-1.jpg"
          >
            <source src="/videos/ihaleal-tanitim.mp4" type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
          <p className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
            <Video className="h-3.5 w-3.5" aria-hidden />
            Çök-kapan-tutun ve tahliye sırası — örnek eğitim klibi
          </p>
        </div>
      </ModulePanel>
    </ModuleShell>
  );
}


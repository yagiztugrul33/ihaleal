import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Home,
  MapPin,
  Printer,
  Scale,
  Share2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { ModulePanel, ModuleShell, ModuleTag } from "./ModuleShell";

type Step = 0 | 1 | 2 | 3 | 4;

type FormState = {
  city: string;
  district: string;
  ada: string;
  parselNote: string;
  buildingAge: keyof typeof BUILDING_AGE_SCORE;
  structuralSystem: keyof typeof STRUCT_SCORE;
  floors: keyof typeof FLOOR_SCORE;
  softStorySuspect: "yes" | "no" | "unknown";
  damageLevel: keyof typeof DAMAGE_SCORE;
  retrofitLicensed: keyof typeof RETROFIT_SCORE;
};

const BUILDING_AGE_SCORE = { pre1975: 18, g19751999: 12, post2000: 6 } as const;
const STRUCT_SCORE = { masonry: 16, reinforced: 10, composite: 12, unknown: 14 } as const;
const FLOOR_SCORE = { low: 8, medium: 10, high: 16 } as const;
const DAMAGE_SCORE = { none: 4, cracks: 10, tilt: 22, retrofitDone: -8 } as const;
const RETROFIT_SCORE = { none: 8, diy: 12, licensed: -10 } as const;

const SOFT_PENALTY = { yes: 14, no: 0, unknown: 6 } as const;

function computeBreakdown(form: FormState): { label: string; points: number; comment: string }[] {
  const items: { label: string; points: number; comment: string }[] = [
    {
      label: "Konutsal blok ve yakın tehlike istihdamı",
      points: Math.min(
        20,
        6 + Math.floor((BUILDING_AGE_SCORE[form.buildingAge] + STRUCT_SCORE[form.structuralSystem]) / 6),
      ),
      comment:
        form.city.toLowerCase().includes("istanbul") || form.city.toLowerCase().includes("izm")
          ? "Büyük metropol zemin bileşeni ve sık blok yoğunluğu risk bileşenini artırır (özet model)."
          : "Bölgesel sırt ve taban etkilerine göre model risk primi güncellenir.",
    },
    {
      label: "Taşıyıcı sistem – deprem uyumu özet",
      points: STRUCT_SCORE[form.structuralSystem],
      comment:
        form.structuralSystem === "reinforced"
          ? "Betonarme iskeletlerde doğru perde bağlantıları kritik eksiklik göstergesidir."
          : "Yığma ve karma sistemlerde bağlayıcı donatı kopukları en sık hasar nedeni olarak raporlanır.",
    },
    {
      label: "Yapı yaşı bandı ve dayanıklılık evrimi",
      points: BUILDING_AGE_SCORE[form.buildingAge],
      comment:
        "1975 öncesi binalarda sık sık daha gevşek arlık gereksinimi 2018 spektrumu ile daha net ayrılır.",
    },
    {
      label: "Kat adedi ve stabilite bileşeni",
      points: FLOOR_SCORE[form.floors],
      comment:
        form.floors === "high"
          ? "Yüksek yapılarda titreşim ve burulma daha belirgin; saha doğrulaması önemlidir."
          : "Düşük-orta yapılarda sık sık bacalar çekme kuvveti odakları oluşturur.",
    },
    {
      label: "Şişme kat / gevşeme şüphesi",
      points: SOFT_PENALTY[form.softStorySuspect],
      comment:
        form.softStorySuspect === "yes"
          ? "Ticaret katı gevşekliği kritik uyarı olarak işaretlenir."
          : "Tespit yapılmamışsa ara risk bandı atanır.",
    },
    {
      label: "Gözlemlenen hasar derecesi",
      points: DAMAGE_SCORE[form.damageLevel],
      comment:
        form.damageLevel === "none"
          ? "Çatlaksız bloklar ön sıralı senaryoda daha uygun çıkar ancak sıva altı doğrulanmalı."
          : "Eğrilme çizgisi ve çıkıntı oluşması acil güçlendirme gündemidir.",
    },
    {
      label: "Ruhsat uyumlu güçlendirme veya güvence paketi",
      points: RETROFIT_SCORE[form.retrofitLicensed],
      comment:
        form.retrofitLicensed === "licensed"
          ? "Lisanslı projelerde bağ kirişi ve sıvama birlikleri puan iyileştirmesi yapar."
          : form.retrofitLicensed === "diy"
            ? "Kendi kendine müdahaleler resmi garanti oluşturmaz."
            : "Statik güvenceler belgelenmedikçe puan iyileştirilmez.",
    },
    {
      label: "Balkon ve konsol dengesi",
      points: STRUCT_SCORE[form.structuralSystem] > 11 ? 6 : 8,
      comment: "Çıkma ve konsollar çekme kırılmalarına meyilli düğüm noktaları oluşturur.",
    },
    {
      label: "Baca ve mansarda ek yük bileşeni",
      points: 5 + Math.min(7, SOFT_PENALTY[form.softStorySuspect] / 2),
      comment: "Kırmızı tuğla bacalar sık sık üst blokta çıkması zor elastik uyumsuzluk üretir.",
    },
    {
      label: "Zemin seçimi ile uyum (özet band)",
      points: BUILDING_AGE_SCORE[form.buildingAge] >= 14 ? 9 : 6,
      comment: form.district
        ? `${form.district} için taban sıvılaşması ve dolgu riskleri üst katmana taşınır.`
        : "İlçe bilgisi zemin zonlaması seçim katmanına taşır.",
    },
    {
      label: "Komşuluk sıklığı ve kaçış koridorları",
      points: 7,
      comment: "Koridor genişlikleri merdiven sığınaklarıyla birlikte tahliye hızına katkı sağlar.",
    },
    {
      label: "Tesisat – gaz / elektrik / yangın çıkışı",
      points: RETROFIT_SCORE[form.retrofitLicensed] < 0 ? 4 : 7,
      comment:
        form.retrofitLicensed === "licensed"
          ? "Tamamlanmış dönüşümde ayrılmış kaçış ve kaçınılmaz sığınma yolları puan iyileştirmesi alır."
          : "Hat çaprazlamalarında yangın ve ikincil riskler deprem sonrası operasyonu zorlaştırır.",
    },
  ];
  return items;
}

function totalFromBreakdown(items: { points: number }[]): number {
  const raw = items.reduce((a, b) => a + b.points, 0);
  return Math.max(0, Math.min(100, Math.round(raw / 1.35)));
}

const DEFAULT_FORM: FormState = {
  city: "İstanbul",
  district: "Kadıköy",
  ada: "",
  parselNote: "",
  buildingAge: "post2000",
  structuralSystem: "reinforced",
  floors: "medium",
  softStorySuspect: "unknown",
  damageLevel: "none",
  retrofitLicensed: "none",
};

export default function BinaRiskSorguPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>(() => {
    const seed = searchParams.get("q")?.trim();
    if (!seed) return DEFAULT_FORM;
    return {
      ...DEFAULT_FORM,
      district: seed,
      parselNote: `Deprem şeffaflık bandından gelen sorgu: ${seed}`,
    };
  });
  const [done, setDone] = useState(false);

  const breakdown = useMemo(() => computeBreakdown(form), [form]);
  const score = useMemo(() => totalFromBreakdown(breakdown), [breakdown]);

  const shareText = useMemo(() => {
    const band = score >= 72 ? "yüksek dikkat" : score >= 48 ? "orta dikkat" : "görece düşük";
    return `İhaleal Bina Risk Özeti — ${form.city}/${form.district}: skor ${score}/100 (${band}). Detaylı inceleme: ${typeof window !== "undefined" ? window.location.origin : ""}/modul/bina-risk-sorgu`;
  }, [score, form.city, form.district]);

  const copyShare = useCallback(() => {
    void navigator.clipboard.writeText(shareText);
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", { detail: { message: "Özet metin panoya kopyalandı.", type: "success" } }),
    );
  }, [shareText]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  const next = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
    else {
      setDone(true);
    }
  };

  const prev = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const stepsMeta = [
    { title: "Konum", icon: MapPin, desc: "İl, ilçe ve parsel notu" },
    { title: "Yapı kimliği", icon: Building2, desc: "Yaş ve taşıyıcı sistem" },
    { title: "Geometri", icon: Home, desc: "Kat yüksekliği ve şişme kat" },
    { title: "Hasar ve müdahale", icon: Wrench, desc: "Mevcut hasar ve güçlendirme" },
    { title: "Sonuç", icon: ShieldCheck, desc: "Skor ve paylaşım" },
  ];

  return (
    <ModuleShell
      title="Bina Risk Sorgusu"
      subtitle="Beş adımlı sihirbaz ile konutunuzun deprem risk bileşenlerini hızlıca tarayın; 12 eksen üzerinden özet skor çıkarılır."
      icon={ShieldCheck}
      iconAccent="text-orange-300"
      badge="Yapı Dayanıklılığı"
    >
      <ModulePanel title="Çok katmanlı bina özeti denetimi">
        <div className="mod-layout mod-layout--split">
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-400">
              Lokasyon seçimleri Türkiye yayılımıyla uyumlu zemin zonu temsiliğini seçer; nihai değerlendirme ekspertize
              bırakılmalıdır.
            </p>
            <ol className="space-y-2">
              {stepsMeta.map((s, i) => {
                const Icon = s.icon;
                const active = i === step;
                const past = i < step;
                return (
                  <li
                    key={s.title}
                    className={`flex gap-3 rounded-lg border px-3 py-2 text-sm ${
                      active
                        ? "border-sky-500/45 bg-sky-500/10"
                        : past
                          ? "border-emerald-500/25 bg-emerald-500/5"
                          : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/25">
                      <Icon className="h-4 w-4 text-sky-300" aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-100">
                        Adım {i + 1} — {s.title}
                      </p>
                      <p className="text-xs text-slate-400">{s.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Link
              to="/modul/deprem-risk-haritasi"
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-sky-300 hover:bg-white/[0.08]"
            >
              <ClipboardList className="h-4 w-4" aria-hidden />
              Harita üzerinde zemin zonu bağlamına geçiş
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="space-y-4">
            {step === 0 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="br-city">İl</label>
                  <select
                    id="br-city"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  >
                    <option>İstanbul</option>
                    <option>İzmir</option>
                    <option>Ankara</option>
                    <option>Bursa</option>
                    <option>Van</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="br-district">İlçe / Mahalle seçimi</label>
                  <input
                    id="br-district"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                    placeholder="Kadıköy, Alsancak, Çankaya…"
                  />
                </div>
                <div>
                  <label htmlFor="br-ada">Ada (opsiyonel)</label>
                  <input id="br-ada" value={form.ada} onChange={(e) => setForm((f) => ({ ...f, ada: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="br-note">Parsel / adres geçerliliği için notlar</label>
                  <textarea
                    id="br-note"
                    value={form.parselNote}
                    onChange={(e) => setForm((f) => ({ ...f, parselNote: e.target.value }))}
                    placeholder="Parsel yüzölçümü bilgisi, ruhsat yılı vb."
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="br-age">Tamamlama yılı bandı</label>
                  <select
                    id="br-age"
                    value={form.buildingAge}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, buildingAge: e.target.value as FormState["buildingAge"] }))
                    }
                  >
                    <option value="pre1975">1975 öncesi</option>
                    <option value="g19751999">1976 – 1999</option>
                    <option value="post2000">2000 sonrası / deprem düzenlemeli</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="br-struct">Taşıyıcı sistem</label>
                  <select
                    id="br-struct"
                    value={form.structuralSystem}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        structuralSystem: e.target.value as FormState["structuralSystem"],
                      }))
                    }
                  >
                    <option value="masonry">Yığma kargir</option>
                    <option value="reinforced">Betonarme iskelet + perde</option>
                    <option value="composite">Karma (çelik + beton)</option>
                    <option value="unknown">Bilinmiyor</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500">
                  Kolon-bağ mesnetleri ve sıva örtüsü sık sık mevcut sıkığı gizleyebilir; bu adım yalnızca özet toplama
                  içindir.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="br-floors">Kat adedi üst bandı</label>
                  <select
                    id="br-floors"
                    value={form.floors}
                    onChange={(e) => setForm((f) => ({ ...f, floors: e.target.value as FormState["floors"] }))}
                  >
                    <option value="low">4 kata kadar</option>
                    <option value="medium">5 – 11 kat</option>
                    <option value="high">11 kattan daha yüksek yapı</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="br-soft">Şişme (soft) kat şüphesi</label>
                  <select
                    id="br-soft"
                    value={form.softStorySuspect}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        softStorySuspect: e.target.value as FormState["softStorySuspect"],
                      }))
                    }
                  >
                    <option value="no">Hayır</option>
                    <option value="yes">Evet — ticaret / otopark zemin gevşekliği</option>
                    <option value="unknown">Emin değilim</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mod-form-grid">
                <div>
                  <label htmlFor="br-damage">Gözlemlediğiniz doğrusal uyumsuzluklar</label>
                  <select
                    id="br-damage"
                    value={form.damageLevel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, damageLevel: e.target.value as FormState["damageLevel"] }))
                    }
                  >
                    <option value="none">Temiz görünüş</option>
                    <option value="cracks">Geniş çatlak takımları</option>
                    <option value="tilt">Eğilme şüphesi veya taş düşüşü</option>
                    <option value="retrofitDone">Son 5 yılda ruhsata bağlı güçlendirildi</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="br-retrofit">Ruhsatsız veya ruhsata bağlı müdahale</label>
                  <select
                    id="br-retrofit"
                    value={form.retrofitLicensed}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        retrofitLicensed: e.target.value as FormState["retrofitLicensed"],
                      }))
                    }
                  >
                    <option value="none">Resmi güçlendirme yok</option>
                    <option value="diy">Ruhsatsız veya güvenilirlik bilinmez</option>
                    <option value="licensed">Lisanslı statik güçlendirme tamamlandı</option>
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                {!done ? (
                  <p className="text-sm text-slate-400">
                    Son özeti oluşturmak için &quot;Skoru Hesapla&quot; düğmesine basarak tüm parametreleri
                    kilitleyebilirsiniz.
                  </p>
                ) : null}
                {done ? (
                  <div id="print-bina-risk" className="mod-print-root space-y-6 rounded-xl border border-white/15 bg-white/[0.03] p-4 print:border-0 print:bg-white">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400">
                          Özet güvenilirlik düzeneği
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-white">
                          {score}
                          <span className="text-xl text-sky-400">/100</span>
                        </h3>
                        <p className="text-sm text-slate-400">
                          {form.city} · {form.district}
                        </p>
                      </div>
                      <ModuleTag tone={score >= 65 ? "risk" : score >= 40 ? "warn" : "ok"}>
                        {score >= 72 ? "Yüksek dikkat" : score >= 48 ? "Orta takip bandı" : "Şeffaf doğrulanabilir blok"}
                      </ModuleTag>
                    </div>

                    <ul className="mt-4 grid gap-3 md:grid-cols-2">
                      {breakdown.map((item) => (
                        <li
                          key={item.label}
                          className="rounded-lg border border-white/10 bg-slate-950/40 p-3 text-sm leading-relaxed"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                            <span className="font-semibold text-slate-200">{item.label}</span>
                            <span className="font-mono text-xs text-orange-300">+{Math.round(item.points)}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-400">{item.comment}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="mod-print-actions mt-6 flex flex-wrap gap-3">
                      <button type="button" className="mod-btn-secondary" onClick={copyShare}>
                        <Share2 className="h-4 w-4" aria-hidden />
                        WhatsApp için metni kopyala
                      </button>
                      <button type="button" className="mod-btn-primary mod-no-print" onClick={printReport}>
                        <Printer className="h-4 w-4" aria-hidden />
                        Yazdır / PDF oluştur
                      </button>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">{shareText}</p>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                className="mod-btn-secondary"
                onClick={prev}
                disabled={step === 0}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Geri
              </button>
              {step < 4 ? (
                <button type="button" className="mod-btn-primary" onClick={next}>
                  İleri <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button type="button" className="mod-btn-primary" onClick={() => setDone(true)} disabled={done}>
                  <Scale className="h-4 w-4" aria-hidden />
                  Skoru kilitle ve özeti çıkar
                </button>
              )}
            </div>
          </div>
        </div>
      </ModulePanel>
    </ModuleShell>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, CheckCircle2, Printer } from "lucide-react";
import { ModulePanel, ModuleShell, ModuleTag } from "./ModuleShell";
import { LESSONS } from "./egitim/lessons";
import { readProgress } from "./egitim/LessonView";

export default function DepremEgitimiPage() {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    setDone(readProgress());
  }, []);

  const allDone = done.length >= 10;

  return (
    <ModuleShell
      title="Deprem Eğitimi"
      subtitle="On derslik program: okuma, video ve quiz ile ilerleyin; tamamlayınca yazdırılabilir sertifika alın."
      badge="LMS — Afet Okuryazarlığı"
      icon={BookOpen}
      iconAccent="text-emerald-300"
    >
      <ModulePanel title="Neden bu eğitim kritik?">
        <div className="grid gap-3 lg:grid-cols-3 text-sm text-slate-300">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-emerald-200">Amaç</h3>
            <p className="mt-2">Acil durum refleksini güçlendirmek, aile ve ekip için ortak hareket dili oluşturmak.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-emerald-200">Kapsam</h3>
            <p className="mt-2">Çök-kapan-tutun, toplanma planı, tahliye rotası, acil çanta, tatbikat ve iletişim zinciri.</p>
          </article>
          <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-amber-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
            <p className="mt-2">Eğitim içerikleri farkındalık amaçlıdır; yapısal güvenlik için lisanslı uzman raporu gerekir.</p>
          </article>
        </div>
      </ModulePanel>

      <ModulePanel title="Ders programı">
        <p className="mb-3 text-sm text-slate-400">
          Tamamlanan: {done.length} / 10 ders
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LESSONS.map((l) => {
            const completed = done.includes(l.id);
            return (
              <Link
                key={l.id}
                to={`/modul/deprem-egitimi/ders-${l.id}`}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-300">Ders {l.id}</p>
                    <p className="font-semibold text-white">{l.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{l.duration}</p>
                  </div>
                  {completed ? (
                    <ModuleTag tone="ok">
                      <CheckCircle2 className="mr-1 inline h-3 w-3" />
                      Tamam
                    </ModuleTag>
                  ) : (
                    <ModuleTag tone="warn">Devam</ModuleTag>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </ModulePanel>

      {allDone ? (
        <ModulePanel title="Tamamlama sertifikası">
          <div className="mod-print-root rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <Award className="mx-auto h-10 w-10 text-emerald-300" aria-hidden />
            <h3 className="mt-2 text-lg font-bold text-white">Afet Okuryazarlığı Sertifikası</h3>
            <p className="mt-2 text-sm text-slate-300">
              On derslik deprem eğitimi programını başarıyla tamamladınız.
            </p>
            <p className="mt-1 text-xs text-slate-500">Rozet: Deprem Hazırlık Uzmanı — Demo</p>
            <button type="button" className="mod-btn-secondary mod-no-print mt-4" onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden />
              Sertifikayı yazdır
            </button>
          </div>
        </ModulePanel>
      ) : null}

      <ModulePanel title="Program sonrası önerilen adımlar">
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
          <li>`/modul/aile-acil-plan` ile iletişim ve buluşma zincirini yazılı hale getirin.</li>
          <li>`/modul/tatbikat-rehberi` ekranında aylık tatbikat ritmi kurun.</li>
          <li>`/modul/bina-risk-sorgu` ile bina güven skorunu teknik verilerle ölçün.</li>
        </ul>
      </ModulePanel>
    </ModuleShell>
  );
}

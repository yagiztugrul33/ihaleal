import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { ModulePanel, ModuleShell } from "../ModuleShell";
import type { LessonDefinition } from "./lessonTypes";

const PROGRESS_KEY = "ihaleal:deprem-egitim-progress";

export function readProgress(): number[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeProgress(ids: number[]) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids));
}

export function LessonView({ lesson }: { lesson: LessonDefinition }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const prevId = lesson.id > 1 ? lesson.id - 1 : null;
  const nextId = lesson.id < 10 ? lesson.id + 1 : null;

  const resultText = useMemo(() => {
    if (score === null) return null;
    return score >= 4 ? "Başarılı — ders tamamlandı sayılır." : "Tekrar deneyin — en az 4 doğru gerekir.";
  }, [score]);

  const checkQuiz = () => {
    let correct = 0;
    lesson.quiz.forEach((q) => {
      if (answers[q.id] === q.correct) correct += 1;
    });
    setScore(correct);
    setChecked(true);
    if (correct >= 4) {
      const progress = new Set(readProgress());
      progress.add(lesson.id);
      writeProgress([...progress].sort((a, b) => a - b));
      window.dispatchEvent(
        new CustomEvent("ihaleal:add-toast", {
          detail: { message: `Ders ${lesson.id} tamamlandi.`, type: "success" },
        }),
      );
    }
  };

  return (
    <ModuleShell
      title={`Ders ${lesson.id}: ${lesson.title}`}
      subtitle="Profesyonel deprem eğitimi modülü — okuma, video ve quiz."
      badge="Deprem Eğitimi LMS"
      icon={PlayCircle}
      iconAccent="text-emerald-300"
    >
      <ModulePanel title="Ders videosu (placeholder)">
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/30 text-sm text-slate-400">
          <PlayCircle className="mr-2 h-6 w-6" aria-hidden />
          Eğitim videosu alanı
        </div>
      </ModulePanel>

      <ModulePanel title="Ders içeriği">
        <article className="space-y-4 text-sm leading-relaxed text-slate-300">
          {lesson.paragraphs.map((p, i) => (
            <p key={`${lesson.id}-p-${i}`}>{p}</p>
          ))}
        </article>
      </ModulePanel>

      <ModulePanel title="Quiz — 5 soru">
        <div className="space-y-4">
          {lesson.quiz.map((q, qi) => (
            <fieldset key={q.id} className="rounded-lg border border-white/10 p-3">
              <legend className="px-1 text-sm font-semibold text-white">
                {qi + 1}. {q.question}
              </legend>
              <div className="mt-2 space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === oi}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {checked ? (
                <p className={`mt-2 text-xs ${answers[q.id] === q.correct ? "text-emerald-400" : "text-red-400"}`}>
                  {answers[q.id] === q.correct ? "Doğru" : `Yanlış — doğru: ${q.options[q.correct]}`}
                </p>
              ) : null}
            </fieldset>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="mod-btn-primary" onClick={checkQuiz}>
            Cevapları kontrol et
          </button>
          {resultText ? <p className="text-sm text-slate-300">{resultText}</p> : null}
        </div>
      </ModulePanel>

      <nav className="mod-no-print mt-6 flex flex-wrap items-center justify-between gap-3">
        {prevId ? (
          <Link to={`/modul/deprem-egitimi/ders-${prevId}`} className="mod-btn-secondary">
            <ChevronLeft className="h-4 w-4" /> Önceki ders
          </Link>
        ) : (
          <Link to="/modul/deprem-egitimi" className="mod-btn-secondary">
            <ChevronLeft className="h-4 w-4" /> Programa dön
          </Link>
        )}
        {nextId ? (
          <Link to={`/modul/deprem-egitimi/ders-${nextId}`} className="mod-btn-primary">
            Sonraki ders <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link to="/modul/deprem-egitimi" className="mod-btn-primary">
            Programa dön <CheckCircle2 className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </ModuleShell>
  );
}

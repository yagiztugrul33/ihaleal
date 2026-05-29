import { buildLessonParagraphs } from "./buildParagraphs";
import type { LessonDefinition } from "./lessonTypes";

const TITLES = [
  "Türkiye deprem gerçeği ve fay hatları",
  "Bina davranışı ve hasar mekanizmaları",
  "Çök-kapan-tutun ve ilk 72 saat",
  "Aile acil planı ve iletişim",
  "Bina güvenliği ve risk sorgusu",
  "Güçlendirme ve kentsel dönüşüm",
  "Sigorta, DASK ve hasar süreci",
  "Kurumsal hazırlık ve tatbikat",
  "Toplumsal dayanışma ve gönüllülük",
  "Uzun vadeli direnç ve sürdürülebilirlik",
];

function baseQuiz(lessonId: number) {
  const runOpt = ["Mer", "divenden", " ", "koşmak"].join("");
  return [
    {
      id: `l${lessonId}-q1`,
      question: "Deprem anında en güvenli ilk davranış hangisidir?",
      options: ["Asansöre binmek", "Çök-kapan-tutun", runOpt, "Balkona çıkmak"],
      correct: 1,
    },
    {
      id: `l${lessonId}-q2`,
      question: "DASK poliçesi hangi riski temel olarak kapsar?",
      options: ["İş kaybı", "Deprem kaynaklı bina hasarı", "Hırsızlık", "Sel"],
      correct: 1,
    },
    {
      id: `l${lessonId}-q3`,
      question: "Yumuşak kat riski en çok hangi yapı tipinde görülür?",
      options: ["Tek kat ahşap", "Ticaret katlı betonarme", "Prefabrik villa", "Çelik hangar"],
      correct: 1,
    },
    {
      id: `l${lessonId}-q4`,
      question: "Aile acil planında dış iletişim kişisi neden önemlidir?",
      options: [
        "Süs amaçlıdır",
        "Şehir içi hatlar tıkanınca şehir dışından koordinasyon sağlar",
        "Zorunlu değildir",
        "Sadece çocuklar içindir",
      ],
      correct: 1,
    },
    {
      id: `l${lessonId}-q5`,
      question: "Ruhsatlı güçlendirme projesinin temel faydası nedir?",
      options: [
        "Sadece estetik",
        "Taşıyıcı performansın belgelenmiş iyileşmesi",
        "Vergi indirimi garantisi",
        "Asansör hızını artırma",
      ],
      correct: 1,
    },
  ];
}

export const LESSONS: LessonDefinition[] = TITLES.map((title, index) => {
  const id = index + 1;
  return {
    id,
    slug: `ders-${id}`,
    title,
    duration: "35 dk okuma",
    paragraphs: buildLessonParagraphs(title),
    quiz: baseQuiz(id),
  };
});

export function getLessonById(id: number): LessonDefinition | undefined {
  return LESSONS.find((l) => l.id === id);
}

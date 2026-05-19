import fs from "fs";
const lessons = `import { buildLessonParagraphs } from "./buildParagraphs";
import type { LessonDefinition } from "./lessonTypes";

const TITLES = [
  "Turkiye deprem gercegi ve fay hatlari",
  "Bina davranisi ve hasar mekanizmalari",
  "Cok-kapan-tutun ve ilk 72 saat",
  "Aile acil plani ve iletisim",
  "Bina guvenligi ve risk sorgusu",
  "Guclendirme ve kentsel donusum",
  "Sigorta, DASK ve hasar sureci",
  "Kurumsal hazirlik ve tatbikat",
  "Toplumsal dayanisma ve gonulluluk",
  "Uzun vadeli direnc ve surdurulebilirlik",
];

function baseQuiz(lessonId: number) {
  return [
    { id: \`l\${lessonId}-q1\`, question: "Deprem aninda en guvenli ilk davranis hangisidir?", options: ["Asansore binmek", "Cok-kapan-tutun", "Merdivenden kosmak", "Balkona cikmak"], correct: 1 },
    { id: \`l\${lessonId}-q2\`, question: "DASK policesi hangi riski temel olarak kapsar?", options: ["Is kaybi", "Deprem kaynakli bina hasari", "Hirsizlik", "Sel"], correct: 1 },
    { id: \`l\${lessonId}-q3\`, question: "Yumusak kat riski en cok hangi yapi tipinde gorulur?", options: ["Tek kat ahsap", "Ticaret katli betonarme", "Prefabrik villa", "Celik hangar"], correct: 1 },
    { id: \`l\${lessonId}-q4\`, question: "Aile acil planinda dis iletisim kisisi neden onemlidir?", options: ["Sus amaclidir", "Sehir ici hatlar tikaninca sehir disindan koordinasyon saglar", "Zorunlu degildir", "Sadece cocuklar icindir"], correct: 1 },
    { id: \`l\${lessonId}-q5\`, question: "Ruhsatli guclendirme projesinin temel faydasi nedir?", options: ["Sadece estetik", "Tasiyici performansin belgelenmis iyilesmesi", "Vergi indirimi garantisi", "Asansor hizini artirma"], correct: 1 },
  ];
}

export const LESSONS: LessonDefinition[] = TITLES.map((title, index) => {
  const id = index + 1;
  return { id, slug: \`ders-\${id}\`, title, duration: "35 dk okuma", paragraphs: buildLessonParagraphs(title), quiz: baseQuiz(id) };
});

export function getLessonById(id: number): LessonDefinition | undefined {
  return LESSONS.find((l) => l.id === id);
}
`;
fs.writeFileSync("src/pages/modules/egitim/lessons.ts", lessons, "utf8");

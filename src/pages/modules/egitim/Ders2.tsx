import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders2() {
  const lesson = getLessonById(2);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

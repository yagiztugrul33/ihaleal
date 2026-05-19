import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders5() {
  const lesson = getLessonById(5);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

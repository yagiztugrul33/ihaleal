import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders9() {
  const lesson = getLessonById(9);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

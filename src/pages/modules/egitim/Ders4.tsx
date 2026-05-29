import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders4() {
  const lesson = getLessonById(4);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders3() {
  const lesson = getLessonById(3);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders10() {
  const lesson = getLessonById(10);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

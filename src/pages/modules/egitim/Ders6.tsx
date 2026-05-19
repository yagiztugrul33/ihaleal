import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders6() {
  const lesson = getLessonById(6);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

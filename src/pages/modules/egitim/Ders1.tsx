import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders1() {
  const lesson = getLessonById(1);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

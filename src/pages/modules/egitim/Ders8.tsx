import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders8() {
  const lesson = getLessonById(8);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

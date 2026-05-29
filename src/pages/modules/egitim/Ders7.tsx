import { LessonView } from "./LessonView";
import { getLessonById } from "./lessons";

export default function Ders7() {
  const lesson = getLessonById(7);
  if (!lesson) return null;
  return <LessonView lesson={lesson} />;
}

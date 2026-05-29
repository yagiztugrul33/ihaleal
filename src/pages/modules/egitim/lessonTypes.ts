export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface LessonDefinition {
  id: number;
  slug: string;
  title: string;
  duration: string;
  paragraphs: string[];
  quiz: QuizQuestion[];
}

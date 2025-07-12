
export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

export type UserAnswers = Record<string, string>; // question.id -> selected option

export type QuizAttempt = {
  id: string;
  pdfName: string;
  date: number; // Store as timestamp for easy sorting
  questions: QuizQuestion[];
  userAnswers: UserAnswers;
  score: number;
};

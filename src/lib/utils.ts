import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAnswerKey(text: string): Record<number, string> {
  const answers: Record<number, string> = {};
  const lines = text.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    const match = line.match(/^(\d+)\s*[.:]?\s*([A-Da-d])/);
    if (match) {
      const questionNumber = parseInt(match[1], 10);
      const answerLetter = match[2].toUpperCase();
      answers[questionNumber] = answerLetter;
    }
  }

  return answers;
}

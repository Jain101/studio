'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically generating quiz questions from PDF content.
 *
 * - generateQuizQuestions - A function that triggers the quiz question generation flow.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  pdfText: z.string().describe('The text content extracted from the uploaded PDF.'),
});
export type GenerateQuizQuestionsInput = z.infer<
  typeof GenerateQuizQuestionsInputSchema
>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z
    .array(z.string())
    .describe('The multiple-choice options for the question.'),
  answer: z.string().describe('The correct answer to the question.'),
});

const GenerateQuizQuestionsOutputSchema = z.array(QuizQuestionSchema);
export type GenerateQuizQuestionsOutput = z.infer<
  typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  const {pdfText} = input;
  const CHUNK_SIZE = 16000;

  if (pdfText.length <= CHUNK_SIZE) {
    return generateQuizQuestionsFlow({pdfText});
  }

  const paragraphs = pdfText.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const p of paragraphs) {
    if (currentChunk.length + p.length + 2 > CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = p;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + p;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  const promises = chunks.map(chunk =>
    generateQuizQuestionsFlow({pdfText: chunk})
  );

  const results = await Promise.all(promises);
  return results.flat();
}

const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator. Given a text from a PDF document, create as many high-quality quiz questions as possible with multiple-choice answers. Each question should have 4 options, with one correct answer.  Prioritize questions that have direct answers in the PDF. Return the questions and answers as a JSON array.

PDF Content: {{{pdfText}}}`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuizQuestionsPrompt(input);
    return output!;
  }
);

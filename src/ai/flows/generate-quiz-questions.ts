'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically generating quiz questions from PDF content.
 *
 * - generateQuizQuestionsFlow - A flow that generates questions from a text chunk.
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

const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator. Given a text from a PDF document, create as many high-quality quiz questions as possible with multiple-choice answers. The text may be missing context from images, diagrams, or equations in the original document; do your best to create valid questions from the text provided. Each question should have 4 options, with one correct answer. Prioritize questions that have direct answers in the PDF. Return the questions and answers as a JSON array.

PDF Content: {{{pdfText}}}`,
});

export const generateQuizQuestionsFlow = ai.defineFlow(
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

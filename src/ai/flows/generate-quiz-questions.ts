'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically generating quiz questions from text content.
 *
 * - generateQuizQuestionsFlow - A flow that generates questions from a PDF document.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file encoded as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
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
  prompt: `You are a quiz generator. Given the following document, create as many high-quality quiz questions as possible with multiple-choice answers. Pay close attention to text, images, diagrams, and equations in the document. Each question should have 4 options, with one correct answer. Prioritize questions that have direct answers in the provided text. Return the questions and answers as a JSON array.

Document:
{{media url=pdfDataUri}}`,
});

export const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await generateQuizQuestionsPrompt(input);

    if (!output) {
      return [];
    }

    // Filter out any incomplete objects that the model might have returned
    // if its response was truncated.
    const validQuestions = output.filter(q => 
      q.question && q.options && q.answer && q.options.length > 0
    );
    
    return validQuestions;
  }
);

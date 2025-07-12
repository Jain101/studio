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
import pdf from 'pdf-parse';

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
  input: {schema: z.object({ context: z.string() })},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator. Given the following document content, create as many high-quality quiz questions as possible with multiple-choice answers. Pay close attention to text, images, diagrams, and equations in the document. Each question should have 4 options, with one correct answer. Prioritize questions that have direct answers in the provided text. Return the questions and answers as a JSON array.

Document Content:
{{{context}}}`,
});

export const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async (input) => {
    // Convert data URI to buffer
    const base64Data = input.pdfDataUri.split(',')[1];
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    
    // Parse the PDF
    const pdfData = await pdf(pdfBuffer);
    
    // For now, we are sending the whole text. 
    // We will implement chunking in a subsequent step if needed.
    const {output} = await generateQuizQuestionsPrompt({ context: pdfData.text });
    return output!;
  }
);

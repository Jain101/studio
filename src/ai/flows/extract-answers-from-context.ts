'use server';

/**
 * @fileOverview A flow that extracts answers from a given context for a quiz question.
 *
 * - extractAnswersFromContext - A function that handles the extraction of answers from context.
 * - ExtractAnswersFromContextInput - The input type for the extractAnswersFromContext function.
 * - ExtractAnswersFromContextOutput - The return type for the extractAnswersFromContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAnswersFromContextInputSchema = z.object({
  context: z
    .string()
    .describe('The context from which to extract answers, typically the PDF content.'),
  question: z.string().describe('The quiz question to find an answer for.'),
});
export type ExtractAnswersFromContextInput = z.infer<
  typeof ExtractAnswersFromContextInputSchema
>;

const ExtractAnswersFromContextOutputSchema = z.object({
  answer: z
    .string()
    .describe('The extracted answer from the context for the given question.'),
  confidence: z
    .number()
    .describe(
      'A confidence score (0-1) indicating the likelihood that the answer is correct.'
    ),
});
export type ExtractAnswersFromContextOutput = z.infer<
  typeof ExtractAnswersFromContextOutputSchema
>;

export async function extractAnswersFromContext(
  input: ExtractAnswersFromContextInput
): Promise<ExtractAnswersFromContextOutput> {
  return extractAnswersFromContextFlow(input);
}

const extractAnswersFromContextPrompt = ai.definePrompt({
  name: 'extractAnswersFromContextPrompt',
  input: {schema: ExtractAnswersFromContextInputSchema},
  output: {schema: ExtractAnswersFromContextOutputSchema},
  prompt: `Given the following context and question, extract the most relevant answer from the context. Also, provide a confidence score between 0 and 1 indicating how confident you are that the answer is correct.\n\nContext: {{{context}}}\nQuestion: {{{question}}}\n\nAnswer:`,
});

const extractAnswersFromContextFlow = ai.defineFlow(
  {
    name: 'extractAnswersFromContextFlow',
    inputSchema: ExtractAnswersFromContextInputSchema,
    outputSchema: ExtractAnswersFromContextOutputSchema,
  },
  async input => {
    const {output} = await extractAnswersFromContextPrompt(input);
    return output!;
  }
);

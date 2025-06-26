import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/extract-answers-from-context.ts';
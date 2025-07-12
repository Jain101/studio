
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCw, PlusCircle, ArrowLeft, FileQuestion, Check, X } from 'lucide-react';
import type { QuizAttempt } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

type QuizResultsProps = {
  attempt: QuizAttempt;
  onRestart: () => void;
  onCreateNew: () => void;
  onBackToHistory?: () => void;
};

export function QuizResults({ attempt, onRestart, onCreateNew, onBackToHistory }: QuizResultsProps) {
  const { score, questions, userAnswers } = attempt;
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPass = percentage >= 70;

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center relative">
        {onBackToHistory && (
          <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={onBackToHistory}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <CardTitle className="text-3xl font-bold">{onBackToHistory ? 'Quiz Review' : 'Quiz Complete!'}</CardTitle>
        <CardDescription>Here's how you did on the quiz from <span className="font-semibold">{attempt.pdfName}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          <div className="md:col-span-1 flex justify-center">
            {isPass ? 
              <CheckCircle2 className="h-28 w-28 text-green-500" /> : 
              <XCircle className="h-28 w-28 text-destructive" />
            }
          </div>
          <div className="md:col-span-2 space-y-2">
            <p className="text-5xl font-bold">
              {score} / {totalQuestions}
            </p>
            <p className="text-2xl text-muted-foreground">You got {percentage}% correct.</p>
             {!onBackToHistory && (
               <div className="flex justify-center md:justify-start gap-4 pt-4">
                 <Button size="lg" onClick={onRestart}>
                   <RotateCw className="mr-2 h-4 w-4" />
                   Try Again
                 </Button>
                 <Button size="lg" onClick={onCreateNew} variant="outline">
                   <PlusCircle className="mr-2 h-4 w-4" />
                   Create New Quiz
                 </Button>
               </div>
             )}
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Detailed Review</h3>
          <ScrollArea className="h-[calc(100vh-550px)] pr-4 border rounded-lg">
             <ul className="space-y-4 p-4">
              {questions.map((q, index) => {
                const userAnswer = userAnswers[q.id];
                const isCorrect = userAnswer === q.answer;
                return (
                  <li key={q.id} className="p-4 border rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-1 ${isCorrect ? 'bg-green-500' : 'bg-destructive'}`}>
                        {isCorrect ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">{index + 1}. {q.question}</p>
                        <ul className="mt-3 space-y-2 text-sm">
                          {q.options.map((opt, i) => {
                            const isSelected = userAnswer === opt;
                            const isCorrectAnswer = q.answer === opt;
                            return (
                              <li 
                                key={i} 
                                className={cn(
                                  "flex items-center p-2 rounded-md",
                                  isCorrectAnswer && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium",
                                  isSelected && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 font-medium line-through"
                                )}
                              >
                                <span className="font-mono mr-3">{String.fromCharCode(65 + i)}.</span>
                                <span>{opt}</span>
                              </li>
                            );
                          })}
                        </ul>
                         <div className="mt-3 text-xs p-2 bg-background rounded-md">
                           <p><span className="font-bold">Your Answer:</span> {userAnswer || 'Not answered'}</p>
                           {!isCorrect && <p><span className="font-bold">Correct Answer:</span> {q.answer}</p>}
                         </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

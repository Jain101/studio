
"use client";

import type { QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Play, FileQuestion, FileText } from 'lucide-react';

type QuizListProps = {
  questions: QuizQuestion[];
  pdfName: string;
  onStartQuiz: () => void;
  onBack: () => void;
};

export function QuizList({ questions, pdfName, onStartQuiz, onBack }: QuizListProps) {
  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-grow">
              <CardTitle className="text-2xl">Your Quiz is Ready!</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 mt-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium truncate max-w-sm">{pdfName}</span> -
                <span>{questions.length} questions</span>
              </CardDescription>
            </div>
            <div className="w-10"></div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-350px)] pr-4">
            <ul className="space-y-4">
              {questions.map((q, index) => (
                <li key={q.id} className="p-4 border rounded-lg bg-background">
                  <p className="font-semibold flex items-start gap-2">
                    <FileQuestion className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{q.question}</span>
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground pl-7">
                    {q.options.map((opt, i) => (
                      <li key={i} className={`flex items-center ${opt === q.answer ? 'text-primary font-medium' : ''}`}>
                        <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </ScrollArea>
           <div className="mt-6 flex justify-center">
             <Button size="lg" className="text-lg py-6 px-10" onClick={onStartQuiz}>
               <Play className="mr-2 h-5 w-5" />
               Start Quiz
             </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

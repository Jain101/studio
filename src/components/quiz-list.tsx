"use client";

import type { QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from './ui/separator';
import { Trash2 } from 'lucide-react';

type QuizListProps = {
  questions: QuizQuestion[];
  onDeleteQuestion: (id: string) => void;
};

export function QuizList({ questions, onDeleteQuestion }: QuizListProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <Separator />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Quiz</CardTitle>
          <CardDescription>Here are the questions you've added. You can start the quiz once you're ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {questions.map((q, index) => (
              <li key={q.id} className="p-4 border rounded-lg flex justify-between items-start">
                <div>
                  <p className="font-semibold">{index + 1}. {q.question}</p>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5">
                    {q.options.map((opt, i) => (
                      <li key={i} className={opt === q.answer ? 'text-primary font-medium' : ''}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDeleteQuestion(q.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

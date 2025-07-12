"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCw, PlusCircle } from 'lucide-react';

type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onCreateNew: () => void;
};

export function QuizResults({ score, totalQuestions, onRestart, onCreateNew }: QuizResultsProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPass = percentage >= 70;

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
        <CardDescription>Here's how you did.</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="flex justify-center items-center">
          {isPass ? 
            <CheckCircle2 className="h-28 w-28 text-green-500" /> : 
            <XCircle className="h-28 w-28 text-destructive" />
          }
        </div>
        <p className="text-5xl font-bold">
          {score} / {totalQuestions}
        </p>
        <p className="text-2xl text-muted-foreground">You got {percentage}% correct.</p>
        <div className="flex justify-center gap-4 pt-4">
          <Button size="lg" onClick={onRestart}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button size="lg" onClick={onCreateNew} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

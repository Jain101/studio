"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCw } from 'lucide-react';

type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
};

export function QuizResults({ score, totalQuestions, onRestart }: QuizResultsProps) {
    const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Complete!</CardTitle>
        <CardDescription>Here's how you did.</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="flex justify-center items-center">
            {percentage > 70 ? <CheckCircle2 className="h-24 w-24 text-green-500" /> : <XCircle className="h-24 w-24 text-destructive" /> }
        </div>
        <p className="text-4xl font-bold">
          {score} / {totalQuestions}
        </p>
        <p className="text-xl text-muted-foreground">You got {percentage}% correct.</p>
        <Button onClick={onRestart}>
          <RotateCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

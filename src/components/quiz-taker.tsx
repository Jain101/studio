"use client";

import { useState, useEffect } from 'react';
import type { QuizQuestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type QuizTakerProps = {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
};

export function QuizTaker({ questions, onFinish }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((currentQuestionIndex) / questions.length) * 100);
  }, [currentQuestionIndex, questions.length]);
  
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === currentQuestion.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setProgress(100);
      onFinish(score);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
         <Label className="flex-shrink-0">Progress</Label>
         <Progress value={progress} className="w-full" />
       </div>
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedAnswer || undefined} 
            onValueChange={handleSelectAnswer}
            disabled={showFeedback}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.answer;
                
                return (
                    <div key={index} 
                        className={cn(
                            "flex items-center space-x-3 p-4 border rounded-lg transition-colors",
                            showFeedback && isCorrect && "bg-green-100 border-green-400 text-green-800",
                            showFeedback && isSelected && !isCorrect && "bg-red-100 border-red-400 text-red-800",
                            !showFeedback && "hover:bg-muted/50 cursor-pointer"
                        )}
                        onClick={() => handleSelectAnswer(option)}
                    >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-base cursor-pointer w-full">{option}</Label>
                    </div>
                )
            })}
          </RadioGroup>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} disabled={!showFeedback}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

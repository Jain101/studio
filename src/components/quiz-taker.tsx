
"use client";

import { useState, useEffect } from 'react';
import type { QuizQuestion, UserAnswers } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

type QuizTakerProps = {
  questions: QuizQuestion[];
  onFinish: (score: number, userAnswers: UserAnswers) => void;
};

export function QuizTaker({ questions, onFinish }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<UserAnswers>({});
  
  const isQuizFinished = currentQuestionIndex === questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    if (isQuizFinished && questions.length > 0) {
      let finalScore = 0;
      questions.forEach((q) => {
        if (q.answer === selectedAnswers[q.id]) {
          finalScore++;
        }
      });
      
      setTimeout(() => onFinish(finalScore, selectedAnswers), 500);
    }
  }, [isQuizFinished, questions, selectedAnswers, onFinish]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswers[currentQuestion.id]) return; // Answer already selected for current question
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Auto-advance to next question
    setTimeout(() => {
        setCurrentQuestionIndex(i => i + 1);
    }, 800);
  };

  const progressValue = (currentQuestionIndex / questions.length) * 100;
  
  if (!currentQuestion && !isQuizFinished) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <div className="flex justify-between font-mono text-sm text-muted-foreground">
          <span>Question {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}</span>
          <span>Progress</span>
        </div>
        <Progress value={progressValue} className="w-full h-2" />
      </div>

      <div className="relative h-[450px]">
        <AnimatePresence mode="wait">
        {!isQuizFinished && currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
            className="absolute w-full"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl leading-relaxed">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                  const selectedAnswerForThis = selectedAnswers[currentQuestion.id];
                  const isSelected = selectedAnswerForThis === option;
                  const isCorrect = option === currentQuestion.answer;
                  const showFeedback = selectedAnswerForThis !== undefined;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 * index }}
                      className={cn(
                          "flex items-center space-x-3 p-4 border rounded-lg transition-all duration-300",
                          showFeedback && isSelected && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-400 text-green-800 dark:text-green-300 scale-105 shadow-lg",
                          showFeedback && isSelected && !isCorrect && "bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300 scale-105 shadow-lg",
                          showFeedback && !isSelected && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-400 text-green-800 dark:text-green-300",
                          !showFeedback && "hover:bg-primary/5 hover:border-primary/50 cursor-pointer"
                      )}
                      onClick={() => handleSelectAnswer(option)}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary text-primary font-bold flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Label htmlFor={`option-${index}`} className="text-base cursor-pointer w-full">{option}</Label>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

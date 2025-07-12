"use client";

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { QuizCreator } from '@/components/quiz-creator';
import { QuizList } from '@/components/quiz-list';
import { QuizResults } from '@/components/quiz-results';
import { QuizTaker } from '@/components/quiz-taker';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

type AppState = 'creating' | 'list' | 'taking' | 'results';

export default function Home() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [appState, setAppState] = useState<AppState>('creating');
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleGeneratedQuestions = (newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions);
    setAppState('list');
  };
  
  const handleStartQuiz = () => {
    setAppState('taking');
  }

  const handleQuizFinish = (score: number) => {
    setQuizScore(score);
    setAppState('results');
  };
  
  const handleRestartQuiz = () => {
    setQuizScore(null);
    setAppState('taking'); 
  }
  
  const handleCreateNew = () => {
    setQuizScore(null);
    setQuestions([]);
    setAppState('creating');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="container mx-auto p-4 sm:p-6 md:p-8 flex-grow flex flex-col items-center">
        <AnimatePresence mode="wait">
          {appState === 'creating' && (
            <motion.div
              key="creating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              <QuizCreator onGeneratedQuestions={handleGeneratedQuestions} />
            </motion.div>
          )}

          {appState === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <QuizList questions={questions} onStartQuiz={handleStartQuiz} onBack={handleCreateNew} />
            </motion.div>
          )}

          {appState === 'taking' && (
             <motion.div
              key="taking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              <QuizTaker questions={questions} onFinish={handleQuizFinish} />
            </motion.div>
          )}

          {appState === 'results' && quizScore !== null && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              className="w-full max-w-2xl"
            >
               <QuizResults 
                 score={quizScore} 
                 totalQuestions={questions.length} 
                 onRestart={handleRestartQuiz}
                 onCreateNew={handleCreateNew}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

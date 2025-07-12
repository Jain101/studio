
"use client";

import { useState, useEffect } from 'react';
import type { QuizQuestion, QuizAttempt, UserAnswers } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { QuizCreator } from '@/components/quiz-creator';
import { QuizHistory } from '@/components/quiz-history';
import { QuizList } from '@/components/quiz-list';
import { QuizResults } from '@/components/quiz-results';
import { QuizTaker } from '@/components/quiz-taker';
import { AnimatePresence, motion } from 'framer-motion';

type AppState = 'creating' | 'list' | 'taking' | 'results' | 'history' | 'dashboard';

export default function Home() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [pdfName, setPdfName] = useState<string>('');
  const [appState, setAppState] = useState<AppState>('creating');
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);

  const handleGeneratedQuestions = (newQuestions: QuizQuestion[], name: string) => {
    setQuestions(newQuestions);
    setPdfName(name);
    setAppState('list');
  };
  
  const handleStartQuiz = () => {
    setAppState('taking');
  }

  const handleQuizFinish = (score: number, userAnswers: UserAnswers) => {
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      pdfName,
      date: Date.now(),
      questions,
      score,
      userAnswers,
    };
    
    // Save to local storage
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]') as QuizAttempt[];
    history.unshift(attempt); // Add to the beginning
    localStorage.setItem('quizHistory', JSON.stringify(history));

    setCurrentAttempt(attempt);
    setAppState('results');
  };
  
  const handleRestartQuiz = () => {
    setAppState('taking'); 
  }
  
  const handleCreateNew = () => {
    setQuestions([]);
    setPdfName('');
    setCurrentAttempt(null);
    setAppState('creating');
  }

  const handleViewHistory = () => {
    setAppState('history');
  }

  const handleViewDashboard = (attempt: QuizAttempt) => {
    setCurrentAttempt(attempt);
    setAppState('dashboard');
  }

  const handleBackToHistory = () => {
    setCurrentAttempt(null);
    setAppState('history');
  }
  
  const handleBackToCreator = () => {
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
              <QuizCreator onGeneratedQuestions={handleGeneratedQuestions} onViewHistory={handleViewHistory} />
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
              <QuizList questions={questions} onStartQuiz={handleStartQuiz} onBack={handleCreateNew} pdfName={pdfName} />
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

          {(appState === 'results' || appState === 'dashboard') && currentAttempt && (
            <motion.div
              key={appState}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              className="w-full max-w-4xl"
            >
               <QuizResults 
                 attempt={currentAttempt}
                 onRestart={handleRestartQuiz}
                 onCreateNew={handleCreateNew}
                 onBackToHistory={appState === 'dashboard' ? handleBackToHistory : undefined}
               />
            </motion.div>
          )}

          {appState === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl"
            >
              <QuizHistory 
                onViewDashboard={handleViewDashboard} 
                onBack={handleBackToCreator} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

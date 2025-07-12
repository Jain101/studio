"use client";

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { QuizCreator } from '@/components/quiz-creator';
import { QuizList } from '@/components/quiz-list';
import { QuizResults } from '@/components/quiz-results';
import { QuizTaker } from '@/components/quiz-taker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleAddQuestion = (question: QuizQuestion) => {
    setQuestions(prev => [...prev, question]);
  };

  const handleGeneratedQuestions = (newQuestions: QuizQuestion[]) => {
    setQuestions(prev => [...prev, ...newQuestions]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleQuizFinish = (score: number) => {
    setQuizScore(score);
    setActiveTab('results');
  };
  
  const handleRestartQuiz = () => {
    setQuizScore(null);
    setActiveTab('take'); 
  }
  
  const handleCreateNew = () => {
    setQuizScore(null);
    setQuestions([]);
    setActiveTab('create');
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">1. Create Quiz</TabsTrigger>
            <TabsTrigger value="take" disabled={questions.length === 0}>2. Take Quiz</TabsTrigger>
            <TabsTrigger value="results" disabled={quizScore === null}>3. View Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <QuizCreator 
                  onAddQuestion={handleAddQuestion} 
                  onGeneratedQuestions={handleGeneratedQuestions}
                  clearExistingQuestions={() => setQuestions([])}
                />
              </div>
              <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto pr-4">
                <QuizList questions={questions} onDeleteQuestion={handleDeleteQuestion} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="take" className="mt-6">
            <QuizTaker questions={questions} onFinish={handleQuizFinish} />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {quizScore !== null && (
               <QuizResults 
                 score={quizScore} 
                 totalQuestions={questions.length} 
                 onRestart={handleRestartQuiz}
                 onCreateNew={handleCreateNew}
               />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

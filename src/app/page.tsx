"use client";

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { QuizCreator } from '@/components/quiz-creator';
import { QuizList } from '@/components/quiz-list';
import { QuizResults } from '@/components/quiz-results';
import { QuizTaker } from '@/components/quiz-taker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const [context, setContext] = useState('');
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
  };
  
  const handleRestartQuiz = () => {
    setQuizScore(null);
    setActiveTab('take'); 
  }
  
  const handleCreateNew = () => {
    setQuizScore(null);
    setQuestions([]);
    setContext('');
    setActiveTab('create');
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="grid lg:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8">
        <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
              <CardDescription>Paste your document text here. The AI will use this content to generate questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your content here..."
                className="h-96 min-h-96"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="take" disabled={questions.length === 0}>Take Quiz</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-6">
              <QuizCreator 
                context={context} 
                onAddQuestion={handleAddQuestion} 
                onGeneratedQuestions={handleGeneratedQuestions}
              />
              <QuizList questions={questions} onDeleteQuestion={handleDeleteQuestion} />
            </TabsContent>
            <TabsContent value="take" className="mt-6">
              {quizScore !== null ? (
                <QuizResults 
                  score={quizScore} 
                  totalQuestions={questions.length} 
                  onRestart={handleRestartQuiz}
                />
              ) : (
                <QuizTaker questions={questions} onFinish={handleQuizFinish} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

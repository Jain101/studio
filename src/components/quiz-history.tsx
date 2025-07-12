
"use client";

import { useState, useEffect } from 'react';
import type { QuizAttempt } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, FileText, BarChart, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type QuizHistoryProps = {
  onViewDashboard: (attempt: QuizAttempt) => void;
  onBack: () => void;
};

export function QuizHistory({ onViewDashboard, onBack }: QuizHistoryProps) {
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]') as QuizAttempt[];
    setHistory(storedHistory);
  }, []);

  const handleDelete = (id: string) => {
    const updatedHistory = history.filter(attempt => attempt.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
  };
  
  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem('quizHistory');
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl">Quiz History</CardTitle>
              <CardDescription>
                Review your past quiz attempts and performance.
              </CardDescription>
            </div>
            <div className="w-10">
             {history.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your quiz history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll}>Delete All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
             )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            {history.length > 0 ? (
              <ul className="space-y-4">
                {history.map((attempt) => (
                  <li key={attempt.id} className="p-4 border rounded-lg bg-background flex items-center justify-between gap-4">
                    <div className="flex-grow space-y-2">
                       <p className="font-semibold flex items-center gap-2">
                         <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                         <span className="truncate" title={attempt.pdfName}>{attempt.pdfName}</span>
                       </p>
                       <div className="text-sm text-muted-foreground flex items-center gap-4">
                         <div className="flex items-center gap-1.5">
                           <Calendar className="h-4 w-4" />
                           {format(new Date(attempt.date), "PPP p")}
                         </div>
                         <div className="flex items-center gap-1.5 font-medium">
                            <BarChart className="h-4 w-4" />
                            {`Score: ${attempt.score} / ${attempt.questions.length}`}
                         </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => onViewDashboard(attempt)}>View Results</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <Trash2 className="h-4 w-4 text-muted-foreground" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this attempt?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the quiz results for "{attempt.pdfName}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(attempt.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-center py-16">
                 <h3 className="text-lg font-semibold">No Quiz History</h3>
                 <p className="text-muted-foreground mt-2">
                   You haven't completed any quizzes yet. Create and take a quiz to see your history here.
                 </p>
                 <Button onClick={onBack} className="mt-6">
                   <PlusCircle className="mr-2 h-4 w-4" />
                   Create New Quiz
                 </Button>
               </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Add this to the components that need it if you don't have it globally
import { PlusCircle } from 'lucide-react';

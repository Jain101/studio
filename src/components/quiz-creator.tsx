"use client";

import { useState, ChangeEvent, DragEvent, useRef } from 'react';
import { generateQuizQuestionsFlow } from '@/ai/flows/generate-quiz-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion } from '@/lib/types';
import { parseAnswerKey } from '@/lib/utils';
import { Loader2, Wand2, FileText, UploadCloud, FileCheck2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuizCreatorProps = {
  onGeneratedQuestions: (questions: QuizQuestion[]) => void;
};

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};

export function QuizCreator({ onGeneratedQuestions }: QuizCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const { toast } = useToast();

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const answerKeyInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, enter: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (enter) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPdfFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleGenerate = async () => {
    if (!pdfFile) {
      toast({
        title: 'No PDF file selected',
        description: 'Please upload a PDF document to generate questions from.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const pdfDataUri = await fileToDataUri(pdfFile);
      const answerKeyText = answerKeyFile ? await answerKeyFile.text() : null;
      const answerKey = answerKeyText ? parseAnswerKey(answerKeyText) : null;
      
      const generated = await generateQuizQuestionsFlow({ pdfDataUri });
      
      let finalQuestions = generated.map((q, index) => {
        const newQ = { ...q, id: crypto.randomUUID() };
        if (answerKey) {
          const questionNumber = index + 1;
          const correctAnswerLetter = answerKey[questionNumber];
          if (correctAnswerLetter) {
            const answerIndex = 'ABCD'.indexOf(correctAnswerLetter);
            if (answerIndex !== -1 && newQ.options[answerIndex]) {
              newQ.answer = newQ.options[answerIndex];
            }
          }
        }
        return newQ;
      });
      
      onGeneratedQuestions(finalQuestions);

      toast({
        title: 'Success!',
        description: `Successfully finished generating ${finalQuestions.length} questions.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
      <Card className="w-full transition-all">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create a Quiz with AI</CardTitle>
          <CardDescription>Upload a PDF document and we'll automatically generate quiz questions for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 md:px-8">
           
           <div 
             className={cn(
                "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
             )}
             onDragEnter={(e) => handleDrag(e, true)}
             onDragLeave={(e) => handleDrag(e, false)}
             onDragOver={(e) => handleDrag(e, true)}
             onDrop={handleDrop}
             onClick={() => pdfInputRef.current?.click()}
           >
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">
                {pdfFile ? 'PDF selected. Ready to generate!' : 'Drag & drop a PDF file here'}
              </p>
              <p className="text-muted-foreground">or click to browse</p>
              <Input 
                ref={pdfInputRef}
                id="pdf-upload" 
                type="file" 
                accept=".pdf" 
                onChange={e => handleFileChange(e, setPdfFile)} 
                className="hidden" 
              />
           </div>

           {pdfFile && (
              <div className="fade-in flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-sm truncate">{pdfFile.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPdfFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
           )}

           <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => answerKeyInputRef.current?.click()}
            >
              {answerKeyFile ? <FileCheck2 className="mr-2 h-4 w-4 text-green-600" /> : <FileText className="mr-2 h-4 w-4" />}
              {answerKeyFile ? <span className="truncate">{answerKeyFile.name}</span> : 'Upload Answer Key (Optional)'}
            </Button>
            {answerKeyFile && (
               <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setAnswerKeyFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
            )}
            <Input 
              ref={answerKeyInputRef}
              id="answer-key-upload" 
              type="file" 
              accept=".txt" 
              onChange={e => handleFileChange(e, setAnswerKeyFile)} 
              className="hidden" 
            />
           </div>

          <Button 
            size="lg"
            className="w-full text-lg py-6"
            onClick={handleGenerate} 
            disabled={isGenerating || !pdfFile}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
  );
}

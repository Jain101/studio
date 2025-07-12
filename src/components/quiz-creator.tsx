
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
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type QuizCreatorProps = {
  onGeneratedQuestions: (questions: QuizQuestion[]) => void;
};

export function QuizCreator({ onGeneratedQuestions }: QuizCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
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
      if (e.dataTransfer.files[0].type === 'application/pdf') {
        setPdfFile(e.dataTransfer.files[0]);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
      }
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
    setProgress(0);
    
    try {
      const answerKeyText = answerKeyFile ? await answerKeyFile.text() : null;
      const answerKey = answerKeyText ? parseAnswerKey(answerKeyText) : null;
      
      const fileBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(fileBuffer).promise;
      const numPages = pdf.numPages;

      let allQuestions: QuizQuestion[] = [];
      let pagesProcessed = 0;

      const processPage = async (pageNumber: number) => {
        try {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const pageImage = canvas.toDataURL('image/png');
            return await generateQuizQuestionsFlow({ pageImage });
          }
        } catch (error) {
           console.error(`Error processing page ${pageNumber}:`, error);
           // Return a promise that resolves to an empty array to not break Promise.all
           return Promise.resolve([]);
        }
        return [];
      };

      const promises = [];
      for (let i = 1; i <= numPages; i++) {
        promises.push(processPage(i));
      }

      for (const promise of promises) {
        try {
            const questionsFromPage = await promise;
            if (questionsFromPage) {
              allQuestions.push(...questionsFromPage);
            }
        } catch(e) {
            console.error('Failed to process a page promise', e);
        } finally {
            pagesProcessed++;
            setProgress((pagesProcessed / numPages) * 100);
        }
      }

      let finalQuestions = allQuestions.map((q, index) => {
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
      // Keep progress at 100 on finish, reset on new upload
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
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPdfFile(null); setProgress(0); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
           )}
          
           {isGenerating && (
             <div className="fade-in w-full text-center">
               <p className="text-sm text-muted-foreground mb-2">Generating questions... {Math.round(progress)}%</p>
               <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
               </div>
             </div>
           )}

           <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => answerKeyInputRef.current?.click()}
              disabled={isGenerating}
            >
              {answerKeyFile ? <FileCheck2 className="mr-2 h-4 w-4 text-green-600" /> : <FileText className="mr-2 h-4 w-4" />}
              {answerKeyFile ? <span className="truncate">{answerKeyFile.name}</span> : 'Upload Answer Key (Optional)'}
            </Button>
            {answerKeyFile && (
               <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setAnswerKeyFile(null)} disabled={isGenerating}>
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

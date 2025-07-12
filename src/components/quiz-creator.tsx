"use client";

import { useState, ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuizQuestionsFlow } from '@/ai/flows/generate-quiz-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion } from '@/lib/types';
import { parseAnswerKey } from '@/lib/utils';
import { Loader2, Wand2, PlusCircle, UploadCloud } from 'lucide-react';

type QuizCreatorProps = {
  onAddQuestion: (question: QuizQuestion) => void;
  onGeneratedQuestions: (questions: QuizQuestion[]) => void;
  clearExistingQuestions: () => void;
};

const manualQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters.'),
  options: z.array(z.object({ value: z.string().min(1, "Option can't be empty.") })).length(4, 'There must be 4 options.'),
  answerIndex: z.string().min(1, 'You must select a correct answer.'),
});

// Helper function to convert a File to a data URI
const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};


export function QuizCreator({ onAddQuestion, onGeneratedQuestions, clearExistingQuestions }: QuizCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof manualQuestionSchema>>({
    resolver: zodResolver(manualQuestionSchema),
    defaultValues: {
      question: '',
      options: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
      answerIndex: '',
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "options"
  });

  const handleManualSubmit = (values: z.infer<typeof manualQuestionSchema>) => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: values.question,
      options: values.options.map(o => o.value),
      answer: values.options[parseInt(values.answerIndex)].value,
    };
    onAddQuestion(newQuestion);
    form.reset();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
    clearExistingQuestions();
    
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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UploadCloud className="text-primary" /> Generate from Document</CardTitle>
          <CardDescription>Upload a PDF and an optional answer key to generate a quiz with AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="pdf-upload">PDF Document</Label>
            <Input id="pdf-upload" type="file" accept=".pdf" onChange={e => handleFileChange(e, setPdfFile)} />
           </div>
           <div className="space-y-2">
            <Label htmlFor="answer-key-upload">Answer Key (Optional, .txt)</Label>
            <Input id="answer-key-upload" type="file" accept=".txt" onChange={e => handleFileChange(e, setAnswerKeyFile)} />
           </div>
          <Button onClick={handleGenerate} disabled={isGenerating || !pdfFile}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="text-primary" /> Add Manually</CardTitle>
          <CardDescription>Create your own custom question.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleManualSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., What is the capital of France?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <Label>Options & Correct Answer</Label>
                <FormField
                  control={form.control}
                  name="answerIndex"
                  render={({ field }) => (
                    <FormItem>
                       <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {fields.map((item, index) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name={`options.${index}.value`}
                              render={({ field: optionField }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                      <Input placeholder={`Option ${index + 1}`} {...optionField} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </RadioGroup>
                       </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Add Question</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

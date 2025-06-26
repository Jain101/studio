"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { QuizQuestion } from '@/lib/types';
import { Loader2, Wand2, PlusCircle } from 'lucide-react';

type QuizCreatorProps = {
  context: string;
  onAddQuestion: (question: QuizQuestion) => void;
  onGeneratedQuestions: (questions: QuizQuestion[]) => void;
};

const manualQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters.'),
  options: z.array(z.object({ value: z.string().min(1, "Option can't be empty.") })).length(4, 'There must be 4 options.'),
  answerIndex: z.string().min(1, 'You must select a correct answer.'),
});

export function QuizCreator({ context, onAddQuestion, onGeneratedQuestions }: QuizCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof manualQuestionSchema>>({
    resolver: zodResolver(manualQuestionSchema),
    defaultValues: {
      question: '',
      options: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
      answerIndex: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
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

  const handleGenerate = async () => {
    if (!context.trim()) {
      toast({
        title: 'Content is empty',
        description: 'Please paste some document content first.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateQuizQuestions({ pdfText: context, numQuestions: 5 });
      const newQuestions = generated.map(q => ({ ...q, id: crypto.randomUUID() }));
      onGeneratedQuestions(newQuestions);
      toast({
        title: 'Success!',
        description: 'AI-generated questions have been added.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate questions. Please try again.',
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
          <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary" /> Generate with AI</CardTitle>
          <CardDescription>Let AI create questions from your document content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={isGenerating || !context}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate 5 Questions'
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

import { Icons } from '@/components/icons';

export function AppHeader() {
  return (
    <header className="flex items-center space-x-2 p-4 sm:p-6 md:p-8">
      <Icons.Logo className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">PDF Quizzer</h1>
    </header>
  );
}

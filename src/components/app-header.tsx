import { FileQuestion } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="flex items-center justify-center p-4 sm:p-6 border-b">
      <div className="flex items-center space-x-3">
        <FileQuestion className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quiz<span className="font-light">Whiz</span>
        </h1>
      </div>
    </header>
  );
}

import { FileQuestion } from 'lucide-react';
import type { SVGProps } from 'react';

// This file is kept for compatibility but is no longer used by AppHeader.
// The AppHeader now uses the lucide-react icon directly.

export const Icons = {
  Logo: (props: SVGProps<SVGSVGElement>) => (
    <FileQuestion {...props} />
  ),
};

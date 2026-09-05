import type { ReactNode } from 'react';

export type ExampleErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: string;
};

export type ExampleErrorBoundaryState = {
  error: Error | null;
};

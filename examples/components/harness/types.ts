import type { ReactNode } from 'react';

export type ExampleErrorBoundaryProps = {
  children: ReactNode;
};

export type ExampleErrorBoundaryState = {
  error: Error | null;
};

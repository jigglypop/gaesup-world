import { createContext, useContext } from 'react';

import type { GaesupRuntime } from './types';

export const GaesupRuntimeContext = createContext<{
  runtime: GaesupRuntime | null;
  revision: number;
}>({
  runtime: null,
  revision: 0,
});

export function useGaesupRuntime(): GaesupRuntime | null {
  return useContext(GaesupRuntimeContext).runtime;
}

export function useGaesupRuntimeRevision(): number {
  return useContext(GaesupRuntimeContext).revision;
}

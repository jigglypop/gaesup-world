import { createContext, useContext, type ReactNode } from 'react';

import type { GaesupRuntime } from './types';

type GaesupRuntimeContextValue = {
  runtime: GaesupRuntime | null;
  revision: number;
};

export interface GaesupRuntimeProviderProps {
  runtime?: GaesupRuntime | null;
  revision?: number;
  children?: ReactNode;
}

const GaesupRuntimeContext = createContext<GaesupRuntimeContextValue>({
  runtime: null,
  revision: 0,
});

export function GaesupRuntimeProvider({
  runtime = null,
  revision = 0,
  children,
}: GaesupRuntimeProviderProps) {
  return (
    <GaesupRuntimeContext.Provider value={{ runtime, revision }}>
      {children}
    </GaesupRuntimeContext.Provider>
  );
}

export function useGaesupRuntime(): GaesupRuntime | null {
  return useContext(GaesupRuntimeContext).runtime;
}

export function useGaesupRuntimeRevision(): number {
  return useContext(GaesupRuntimeContext).revision;
}

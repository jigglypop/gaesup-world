import { type ReactNode } from 'react';
import type { GaesupRuntime } from './types';
export interface GaesupRuntimeProviderProps {
    runtime?: GaesupRuntime | null;
    revision?: number;
    children?: ReactNode;
}
export declare function GaesupRuntimeProvider({ runtime, revision, children, }: GaesupRuntimeProviderProps): import("react").JSX.Element;
export declare function useGaesupRuntime(): GaesupRuntime | null;
export declare function useGaesupRuntimeRevision(): number;

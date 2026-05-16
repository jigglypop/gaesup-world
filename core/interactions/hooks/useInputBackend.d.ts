import type { GaesupRuntime } from '../../runtime';
import { type InputAdapter } from '../core';
export declare function resolveRuntimeInputBackend(runtime: GaesupRuntime | null): InputAdapter | null;
export declare function useInputBackend(): InputAdapter;

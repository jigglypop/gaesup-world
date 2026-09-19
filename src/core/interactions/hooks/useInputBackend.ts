import type { GaesupRuntime } from '../../runtime';
import { useGaesupRuntime } from '../../runtime';
import {
  createInteractionInputAdapter,
  type InputAdapter,
} from '../core';

export function resolveRuntimeInputBackend(runtime: GaesupRuntime | null): InputAdapter | null {
  return runtime?.inputAdapter ?? null;
}

export function useInputBackend(): InputAdapter {
  const runtime = useGaesupRuntime();
  return resolveRuntimeInputBackend(runtime) ?? createInteractionInputAdapter();
}

import { useMemo, useRef } from 'react';

import type { GaesupRuntime } from '../../runtime';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime';
import {
  createInteractionInputAdapter,
  DEFAULT_INTERACTION_INPUT_EXTENSION_ID,
  type InputAdapter,
  type InputBackendExtension,
} from '../core';

export function resolveRuntimeInputBackend(runtime: GaesupRuntime | null): InputAdapter | null {
  if (!runtime) return null;
  const extension = runtime.plugins.context.input.get<InputBackendExtension>(
    DEFAULT_INTERACTION_INPUT_EXTENSION_ID,
  );
  return extension?.createAdapter() ?? null;
}

export function useInputBackend(): InputAdapter {
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();
  const fallbackRef = useRef<InputAdapter | null>(null);
  fallbackRef.current ??= createInteractionInputAdapter();

  return useMemo(
    () => resolveRuntimeInputBackend(runtime) ?? fallbackRef.current!,
    [runtime, revision],
  );
}

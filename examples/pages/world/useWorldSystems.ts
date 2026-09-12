import { useEffect, useRef, useState } from 'react';

import {
  useAudioStore,
  useAutoSave,
  logger,
  type GaesupRuntime,
  type SaveSystem,
} from 'gaesup-world';

import { loadWorldRuntime } from '../runtime';

export interface WorldSystemsProps {
  runtime: GaesupRuntime;
  onRuntimeReady?: () => void;
}

const RESOLVED_WORLD_RUNTIME_OPERATION = Promise.resolve();
const WORLD_RUNTIME_OPERATION_QUEUES = new WeakMap<SaveSystem, Promise<void>>();

function reportWorldRuntimeOperationFailure(operation: 'load' | 'dispose', error: unknown): void {
  try {
    logger.error(
      `[WorldSystems] Runtime ${operation} failed.`,
      error instanceof Error ? error : String(error),
    );
  } catch {
    // Runtime lifecycle failures stay handled even when the diagnostics boundary fails.
  }
}

function enqueueWorldRuntimeOperation(
  runtime: GaesupRuntime,
  operation: 'load' | 'dispose',
  run: () => Promise<void>,
): Promise<void> {
  const previous =
    WORLD_RUNTIME_OPERATION_QUEUES.get(runtime.save) ?? RESOLVED_WORLD_RUNTIME_OPERATION;
  const recovered = previous.then(run).catch((error: unknown) => {
    reportWorldRuntimeOperationFailure(operation, error);
  });
  WORLD_RUNTIME_OPERATION_QUEUES.set(runtime.save, recovered);
  void recovered.then(() => {
    if (WORLD_RUNTIME_OPERATION_QUEUES.get(runtime.save) === recovered) {
      WORLD_RUNTIME_OPERATION_QUEUES.delete(runtime.save);
    }
  });
  return recovered;
}

export function WorldSystems({ runtime, onRuntimeReady }: WorldSystemsProps) {
  const [readyRuntime, setReadyRuntime] = useState<GaesupRuntime | null>(null);
  const generationRef = useRef(0);
  const onRuntimeReadyRef = useRef(onRuntimeReady);
  useEffect(() => {
    onRuntimeReadyRef.current = onRuntimeReady;
  }, [onRuntimeReady]);
  useAutoSave({ intervalMs: 60_000, saveSystem: runtime.save, enabled: readyRuntime === runtime });

  useEffect(() => {
    useAudioStore.setState({
      masterMuted: true,
      bgmMuted: true,
      sfxMuted: true,
      currentBgmId: null,
    });
    useAudioStore.getState().stopBgm();
    useAudioStore.getState().apply();
  }, []);

  useEffect(() => {
    const generation = generationRef.current + 1;
    setReadyRuntime(null);
    generationRef.current = generation;
    const controller = new AbortController();
    void enqueueWorldRuntimeOperation(runtime, 'load', async () => {
      if (controller.signal.aborted || generationRef.current !== generation) return;
      await loadWorldRuntime(runtime, controller.signal);
      if (!controller.signal.aborted && generationRef.current === generation) {
        setReadyRuntime(runtime);
        onRuntimeReadyRef.current?.();
      }
    });

    return () => {
      controller.abort();
      if (generationRef.current === generation) {
        generationRef.current = generation + 1;
      }
      void enqueueWorldRuntimeOperation(runtime, 'dispose', async () => {
        await runtime.dispose();
      });
    };
  }, [runtime]);

  return null;
}

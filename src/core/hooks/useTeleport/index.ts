import { useCallback, useMemo } from 'react';

import { Vector3, Euler } from 'three';

import {
  useGaesupRuntime,
  useGaesupRuntimeRevision,
} from '../../runtime';
import { useStateSystem } from '../../motions/hooks/useStateSystem';
import {
  DEFAULT_MOTIONS_RUNTIME_SERVICE_ID,
  requestMotionsTeleport,
  type MotionsRuntimeService,
  type MotionsTeleportPayload,
} from '../../motions/plugin';

export interface TeleportResult {
  teleport: (position: Vector3, rotation?: Euler, options?: TeleportOptions) => void;
  canTeleport: boolean;
}

export type TeleportOptions = {
  dropHeight?: number;
  effect?: boolean | {
    kind?: 'instant' | 'drop';
    durationMs?: number;
  };
};

function createTeleportEffectId(): string {
  return `teleport-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTeleport(): TeleportResult {
  const { activeState, updateActiveState } = useStateSystem();
  const runtime = useGaesupRuntime();
  const runtimeRevision = useGaesupRuntimeRevision();
  const motionsRuntime = useMemo(() => {
    if (!runtime) return null;
    const service = runtime.getService<MotionsRuntimeService>(DEFAULT_MOTIONS_RUNTIME_SERVICE_ID);
    return service?.create() ?? null;
  }, [runtime, runtimeRevision]);
  
  const canTeleport = Boolean(activeState);

  const teleport = useCallback((position: Vector3, rotation?: Euler, options: TeleportOptions = {}) => {
    if (!activeState) {
      console.warn('[useTeleport]: Cannot teleport - activeState not available');
      return;
    }
    const dropHeight = Math.max(0, options.dropHeight ?? 7);
    const spawnPosition = dropHeight > 0
      ? position.clone().add(new Vector3(0, dropHeight, 0))
      : position.clone();
    const shouldEmitEffect = options.effect !== false;
    const effectOptions = typeof options.effect === 'object' ? options.effect : {};
    const payload: MotionsTeleportPayload = {
      position: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
      spawnPosition: {
        x: spawnPosition.x,
        y: spawnPosition.y,
        z: spawnPosition.z,
      },
      ...(shouldEmitEffect
        ? {
            effect: {
              id: createTeleportEffectId(),
              kind: effectOptions.kind ?? (dropHeight > 0 ? 'drop' : 'instant'),
              dropHeight,
              durationMs: effectOptions.durationMs ?? 900,
            },
          }
        : {}),
    };

    if (motionsRuntime) {
      requestMotionsTeleport(motionsRuntime, payload);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gaesup:teleport', { detail: payload }));
    }

    updateActiveState({
      position: spawnPosition,
      euler: rotation || activeState.euler,
    });
  }, [activeState, motionsRuntime, updateActiveState]);

  return {
    teleport,
    canTeleport,
  };
}

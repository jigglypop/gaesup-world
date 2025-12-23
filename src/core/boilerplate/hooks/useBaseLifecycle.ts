import { useEffect, useRef } from 'react';

import { AbstractBridge } from '../bridge/AbstractBridge';
import { IDisposable, UseBaseLifecycleOptions } from '../types';

export function useBaseLifecycle<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  engine: EngineType | null,
  options: UseBaseLifecycleOptions<EngineType> = {}
) {
  const { onRegister, onUnregister, dependencies = [], enabled = true } = options;
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!bridge || !engine || !enabled) return;
    bridge.register(id, engine);

    if (onRegister) {
      const cleanup = onRegister(engine);
      if (typeof cleanup === 'function') {
        cleanupRef.current = cleanup;
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (onUnregister) {
        onUnregister(engine);
      }
      bridge.unregister(id);
    };
  }, [bridge, id, engine, enabled, ...dependencies]);
}

export function useDelayedLifecycle<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  engineGetter: () => EngineType | null,
  options: UseBaseLifecycleOptions<EngineType> = {}
) {
  const engine = engineGetter();
  useBaseLifecycle(bridge, id, engine, options);
} 
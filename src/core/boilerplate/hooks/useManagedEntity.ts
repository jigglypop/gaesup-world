import { RefObject, useRef, useState, useEffect } from 'react';

import { ManagedEntity } from '../entity/ManagedEntity';
import { IDisposable, UseManagedEntityOptions } from '../types';
import { useBaseFrame } from './useBaseFrame';
import { useBaseLifecycle } from './useBaseLifecycle';
import { AbstractBridge } from '../bridge/AbstractBridge';
import { DIContainer } from '../di';

export function useManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  ref: RefObject<EngineType>,
  options: UseManagedEntityOptions<EngineType, SnapshotType, CommandType> = {}
): ManagedEntity<EngineType, SnapshotType, CommandType> | null {
  const [entity, setEntity] = useState<ManagedEntity<EngineType, SnapshotType, CommandType> | null>(null);
  const entityRef = useRef<ManagedEntity<EngineType, SnapshotType, CommandType> | null>(null);
  const { 
    onInit, 
    onDispose, 
    frameCallback,
    onRegister,
    onUnregister,
    dependencies,
    enabled = true,
    priority,
    throttle,
    skipWhenHidden,
    ...entityOptions 
  } = options;

  useEffect(() => {
    if (!bridge || !ref.current || !enabled) return;

    const managedEntity = new ManagedEntity<EngineType, SnapshotType, CommandType>(id, ref.current, entityOptions);
    let firstError: unknown;

    // DI injection should not prevent initialization.
    try {
      DIContainer.getInstance().injectProperties(managedEntity);
    } catch (e) {
      firstError = firstError ?? e;
    }

    try {
      managedEntity.initialize();
    } catch (e) {
      firstError = firstError ?? e;
    }

    entityRef.current = managedEntity;
    setEntity(managedEntity);
    
    if (onInit) {
      try {
        onInit(managedEntity);
      } catch (e) {
        firstError = firstError ?? e;
      }
    }

    if (firstError) {
      throw firstError;
    }

    return () => {
      let cleanupError: unknown;

      if (onDispose) {
        try {
          onDispose(managedEntity);
        } catch (e) {
          cleanupError = cleanupError ?? e;
        }
      }

      try {
        managedEntity.dispose();
      } catch (e) {
        cleanupError = cleanupError ?? e;
      }

      entityRef.current = null;
      setEntity(null);

      if (cleanupError) {
        throw cleanupError;
      }
    };
  }, [bridge, id, ref, enabled, ...(dependencies || [])]);

  useBaseLifecycle(bridge, id, ref.current, {
    ...(onRegister && { onRegister }),
    ...(onUnregister && { onUnregister }),
    dependencies: dependencies || [],
    enabled: enabled && !!entity
  });

  useBaseFrame(bridge, id, frameCallback, {
    ...(priority !== undefined && { priority }),
    enabled: enabled && !!entity,
    ...(throttle !== undefined && { throttle }),
    ...(skipWhenHidden !== undefined && { skipWhenHidden })
  });
  
  return entity;
}

export function useBatchManagedEntities<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  entries: Array<{ id: string; ref: RefObject<EngineType> }>,
  options: UseManagedEntityOptions<EngineType, SnapshotType, CommandType> = {}
): Array<ManagedEntity<EngineType, SnapshotType, CommandType> | null> {
  return entries.map(({ id, ref }) => 
    useManagedEntity(bridge, id, ref, options)
  );
} 
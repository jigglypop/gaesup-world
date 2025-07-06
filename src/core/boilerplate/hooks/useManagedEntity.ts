import { RefObject, useRef, useState, useEffect } from 'react';
import { AbstractBridge } from '../bridge/AbstractBridge';
import { ManagedEntity } from '../entity/ManagedEntity';
import { IDisposable, UseManagedEntityOptions } from '../types';
import { useBaseLifecycle } from './useBaseLifecycle';
import { useBaseFrame } from './useBaseFrame';

export function useManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType> | null,
  id: string,
  ref: RefObject<EngineType>,
  options: UseManagedEntityOptions = {}
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
    const managedEntity = new ManagedEntity(bridge, id, ref.current, entityOptions);
    entityRef.current = managedEntity;
    setEntity(managedEntity);
    if (onInit) {
      onInit(managedEntity);
    }
    return () => {
      managedEntity.dispose();
      entityRef.current = null;
      setEntity(null);
    };
  }, [bridge, id, ref, enabled, ...(dependencies || [])]);
  useBaseLifecycle(bridge, id, ref.current, {
    ...(onRegister && { onRegister }),
    ...(onUnregister && { onUnregister }),
    ...(dependencies && { dependencies }),
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
  options: UseManagedEntityOptions = {}
): Array<ManagedEntity<EngineType, SnapshotType, CommandType> | null> {
  return entries.map(({ id, ref }) => 
    useManagedEntity(bridge, id, ref, options)
  );
} 
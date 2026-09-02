import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { useFrame, type RootState } from '@react-three/fiber';

import { AbstractBridge } from '../bridge/AbstractBridge';
import { DIContainer } from '../di';
import { ManagedEntity } from '../entity/ManagedEntity';
import {
  IDisposable,
  MILLISECONDS_IN_SECOND,
  RuntimeValue,
  UseManagedEntityOptions,
} from '../types';
import { useBaseFrame } from './useBaseFrame';
import { useBaseLifecycle } from './useBaseLifecycle';

type BatchManagedEntityRecord<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> = {
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType>;
  engine: EngineType;
  entity: ManagedEntity<EngineType, SnapshotType, CommandType>;
  id: string;
  lastUpdateTime: number;
  registrationActive: boolean;
  registrationCleanup: (() => void) | null;
  onDispose: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>['onDispose'];
  onRegister: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>['onRegister'];
  onUnregister: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>['onUnregister'];
};

function normalizeLifecycleError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function disposeBatchManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
>(record: BatchManagedEntityRecord<EngineType, SnapshotType, CommandType>): Error | undefined {
  let firstError: Error | undefined;
  const attempt = (operation: () => void) => {
    try {
      operation();
    } catch (error) {
      firstError ??= normalizeLifecycleError(error);
    }
  };

  if (record.onDispose) {
    attempt(() => record.onDispose?.(record.entity));
  }
  attempt(() => record.entity.dispose());
  if (record.registrationActive && record.registrationCleanup) {
    const cleanup = record.registrationCleanup;
    record.registrationCleanup = null;
    attempt(cleanup);
  }
  if (record.registrationActive && record.onUnregister) {
    attempt(() => record.onUnregister?.(record.engine));
  }
  record.registrationActive = false;
  attempt(() => record.bridge.unregister(record.id));

  return firstError;
}

function reconcileBatchManagedEntityRegistration<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
>(
  record: BatchManagedEntityRecord<EngineType, SnapshotType, CommandType>,
  onRegister: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>['onRegister'],
  onUnregister: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>['onUnregister'],
): Error | undefined {
  let firstError: Error | undefined;
  const attempt = (operation: () => void) => {
    try {
      operation();
    } catch (error) {
      firstError ??= normalizeLifecycleError(error);
    }
  };

  if (!record.registrationActive) {
    record.registrationActive = true;
    record.onRegister = onRegister;
    record.onUnregister = onUnregister;
    if (onRegister) {
      attempt(() => {
        const cleanup = onRegister(record.engine);
        record.registrationCleanup = typeof cleanup === 'function' ? cleanup : null;
      });
    }
    return firstError;
  }

  if (record.onRegister === onRegister && record.onUnregister === onUnregister) {
    return undefined;
  }

  if (record.registrationCleanup) {
    attempt(record.registrationCleanup);
    record.registrationCleanup = null;
  }
  if (record.onUnregister) {
    attempt(() => record.onUnregister?.(record.engine));
  }

  record.onRegister = onRegister;
  record.onUnregister = onUnregister;
  if (onRegister) {
    attempt(() => {
      const cleanup = onRegister(record.engine);
      record.registrationCleanup = typeof cleanup === 'function' ? cleanup : null;
    });
  }

  return firstError;
}

function createBatchManagedEntity<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
>(
  bridge: AbstractBridge<EngineType, SnapshotType, CommandType>,
  id: string,
  engine: EngineType,
  options: UseManagedEntityOptions<EngineType, SnapshotType, CommandType>,
): BatchManagedEntityRecord<EngineType, SnapshotType, CommandType> {
  const {
    onInit,
    onDispose,
    onRegister,
    onUnregister,
  } = options;
  const entityOptions = { ...options };
  delete entityOptions.onInit;
  delete entityOptions.onDispose;
  delete entityOptions.onRegister;
  delete entityOptions.onUnregister;
  delete entityOptions.frameCallback;
  delete entityOptions.dependencies;
  delete entityOptions.enabled;
  delete entityOptions.priority;
  delete entityOptions.throttle;
  delete entityOptions.skipWhenHidden;
  const entity = new ManagedEntity<EngineType, SnapshotType, CommandType>(
    id,
    engine,
    entityOptions,
  );
  let firstError: Error | undefined;
  const attempt = (operation: () => void) => {
    try {
      operation();
    } catch (error) {
      firstError ??= normalizeLifecycleError(error);
    }
  };

  attempt(() => DIContainer.getInstance().injectProperties(entity));
  attempt(() => entity.initialize());
  attempt(() => bridge.register(id, engine));
  if (onInit) {
    attempt(() => onInit(entity));
  }

  const record: BatchManagedEntityRecord<EngineType, SnapshotType, CommandType> = {
    bridge,
    engine,
    entity,
    id,
    lastUpdateTime: Number.NEGATIVE_INFINITY,
    registrationActive: false,
    registrationCleanup: null,
    onDispose,
    onRegister,
    onUnregister,
  };
  if (firstError) {
    disposeBatchManagedEntity(record);
    throw firstError;
  }

  return record;
}

function areRuntimeDependenciesEqual(
  previous: readonly RuntimeValue[],
  next: readonly RuntimeValue[],
): boolean {
  if (previous.length !== next.length) return false;
  return previous.every((value, index) => Object.is(value, next[index]));
}

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
    let firstError: Error | RuntimeValue;

    // DI injection should not prevent initialization.
    try {
      DIContainer.getInstance().injectProperties(managedEntity);
    } catch (e) {
      firstError = firstError ?? (e instanceof Error ? e : String(e));
    }

    try {
      managedEntity.initialize();
    } catch (e) {
      firstError = firstError ?? (e instanceof Error ? e : String(e));
    }

    entityRef.current = managedEntity;
    setEntity(managedEntity);
    
    if (onInit) {
      try {
        onInit(managedEntity);
      } catch (e) {
        firstError = firstError ?? (e instanceof Error ? e : String(e));
      }
    }

    if (firstError) {
      throw firstError;
    }

    return () => {
      let cleanupError: Error | RuntimeValue;

      if (onDispose) {
        try {
          onDispose(managedEntity);
        } catch (e) {
          cleanupError = cleanupError ?? (e instanceof Error ? e : String(e));
        }
      }

      try {
        managedEntity.dispose();
      } catch (e) {
        cleanupError = cleanupError ?? (e instanceof Error ? e : String(e));
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
  const recordsRef = useRef(
    new Map<string, BatchManagedEntityRecord<EngineType, SnapshotType, CommandType>>(),
  );
  const activeBridgeRef = useRef(bridge);
  const activeDependenciesRef = useRef<RuntimeValue[] | null>(null);
  const [, forceRender] = useState(0);
  const {
    dependencies = [],
    enabled = true,
    frameCallback,
    priority = 0,
    throttle = 0,
    skipWhenHidden = true,
  } = options;

  const orderedIds: string[] = [];
  const seenIds = new Set<string>();
  for (const { id } of entries) {
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    orderedIds.push(id);
  }

  useEffect(() => {
    const records = recordsRef.current;
    let changed = false;
    let firstError: Error | undefined;
    const disposeRecord = (id: string) => {
      const record = records.get(id);
      if (!record) return;
      records.delete(id);
      changed = true;
      const disposalError = disposeBatchManagedEntity(record);
      firstError ??= disposalError;
    };
    const dependenciesChanged =
      activeDependenciesRef.current !== null &&
      !areRuntimeDependenciesEqual(activeDependenciesRef.current, dependencies);
    const shouldReset =
      activeBridgeRef.current !== bridge ||
      dependenciesChanged ||
      !enabled ||
      !bridge;

    if (shouldReset) {
      for (const id of [...records.keys()]) {
        disposeRecord(id);
      }
    }
    activeBridgeRef.current = bridge;
    activeDependenciesRef.current = [...dependencies];

    if (bridge && enabled) {
      const desiredEngines = new Map<string, EngineType | null>();
      for (const { id, ref } of entries) {
        if (!desiredEngines.has(id)) {
          desiredEngines.set(id, ref.current);
        }
      }

      for (const id of [...records.keys()]) {
        const desiredEngine = desiredEngines.get(id);
        const record = records.get(id);
        if (desiredEngine === undefined || !desiredEngine || record?.engine !== desiredEngine) {
          disposeRecord(id);
        }
      }

      for (const record of records.values()) {
        const registrationError = reconcileBatchManagedEntityRegistration(
          record,
          options.onRegister,
          options.onUnregister,
        );
        firstError ??= registrationError;
      }

      if (!firstError) {
        const createdIds: string[] = [];
        for (const [id, engine] of desiredEngines) {
          if (!engine || records.has(id)) continue;
          try {
            records.set(id, createBatchManagedEntity(bridge, id, engine, options));
            createdIds.push(id);
            changed = true;
          } catch (error) {
            firstError = normalizeLifecycleError(error);
            break;
          }
        }
        if (firstError) {
          for (const id of createdIds) {
            disposeRecord(id);
          }
        }
      }
    }

    if (changed) {
      forceRender((revision) => revision + 1);
    }
    if (firstError) {
      throw firstError;
    }
  });

  useEffect(
    () => () => {
      let firstError: Error | undefined;
      const records = recordsRef.current;
      for (const record of records.values()) {
        const disposalError = disposeBatchManagedEntity(record);
        firstError ??= disposalError;
      }
      records.clear();
      if (firstError) {
        throw firstError;
      }
    },
    [],
  );

  const handleFrame = useCallback(
    (state: RootState) => {
      if (!bridge || !enabled) return;
      if (skipWhenHidden && typeof document !== 'undefined' && document.hidden) return;
      let now = 0;
      if (throttle > 0) {
        now =
          typeof state.clock?.elapsedTime === 'number'
            ? state.clock.elapsedTime * MILLISECONDS_IN_SECOND
            : performance.now();
      }

      for (let index = 0; index < orderedIds.length; index += 1) {
        const id = orderedIds[index];
        if (id === undefined) continue;
        const record = recordsRef.current.get(id);
        if (!record) continue;
        if (throttle > 0) {
          if (now - record.lastUpdateTime < throttle) continue;
          record.lastUpdateTime = now;
        }
        bridge.notifyListeners(id);
        frameCallback?.();
      }
    },
    [bridge, enabled, frameCallback, orderedIds, skipWhenHidden, throttle],
  );
  useFrame(handleFrame, priority);

  return entries.map(({ id }) => recordsRef.current.get(id)?.entity ?? null);
}

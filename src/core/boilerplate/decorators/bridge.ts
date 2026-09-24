import { logger } from '../../utils/logger';

type NamedInstance = { constructor: { name: string } };
type SnapshotCacheHost = NamedInstance & {
  getEngine?: (id: string) => DecoratorValue;
};
type DecoratorValue =
  | object
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;
type DecoratedMethod = (...args: DecoratorValue[]) => DecoratorValue;
type BridgeIdentifier = string | number | symbol;
type PrimitiveDecoratorValue = Exclude<DecoratorValue, object>;
type SnapshotCacheEntry = {
  value: DecoratorValue;
  timestamp: number;
};
type InstanceSnapshotCache = {
  objectEntries: WeakMap<object, SnapshotCacheEntry>;
  primitiveEntries: Map<PrimitiveDecoratorValue, SnapshotCacheEntry>;
  nextPrimitivePruneAt: number;
};

const MIN_PRIMITIVE_CACHE_PRUNE_INTERVAL_MS = 1;

function resolveSnapshotObjectKey(
  host: SnapshotCacheHost,
  firstArg: DecoratorValue,
): object | undefined {
  if (typeof firstArg === 'object' && firstArg !== null) {
    return firstArg;
  }

  if (typeof firstArg !== 'string' || !host.getEngine) {
    return undefined;
  }

  const engine = host.getEngine(firstArg);
  return typeof engine === 'object' && engine !== null ? engine : undefined;
}

function pruneExpiredPrimitiveEntries(
  cache: InstanceSnapshotCache,
  now: number,
  ttl: number,
): void {
  if (now < cache.nextPrimitivePruneAt) return;

  const pruneInterval = Math.max(ttl, MIN_PRIMITIVE_CACHE_PRUNE_INTERVAL_MS);
  if (cache.primitiveEntries.size === 0) {
    cache.nextPrimitivePruneAt = now + pruneInterval;
    return;
  }

  for (const [key, entry] of cache.primitiveEntries) {
    if (now - entry.timestamp >= ttl) {
      cache.primitiveEntries.delete(key);
    }
  }

  cache.nextPrimitivePruneAt = now + pruneInterval;
}

/**
 * 釉뚮┸吏 硫붿꽌?쒖쓽 ?ㅻ깄??泥섎━瑜??먮룞?쇰줈 濡쒓퉭?섎뒗 ?곗퐫?덉씠??
 */
export function LogSnapshot() {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as DecoratedMethod;

    descriptor.value = function (this: NamedInstance, ...args: DecoratorValue[]) {
      if (logger.isEnabled('log') === false) return originalMethod.apply(this, args);
      const startTime = performance.now();
      const result = originalMethod.apply(this, args);
      const endTime = performance.now();

      logger.log(
        `[${this.constructor.name}] ${propertyKey} snapshot processed in ${(endTime - startTime).toFixed(2)}ms`,
      );

      return result;
    };

    return descriptor;
  };
}

/**
 * 釉뚮┸吏 紐낅졊??泥섎━瑜??먮룞?쇰줈 寃利앺븯???곗퐫?덉씠??
 * CoreBridge??executeCommand 硫붿꽌?쒖뿉 ?ъ슜
 */
export function ValidateCommand() {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as DecoratedMethod;

    descriptor.value = function (
      this: NamedInstance,
      engine: DecoratorValue,
      command: DecoratorValue,
      ...args: DecoratorValue[]
    ) {
      if (!command || typeof command !== 'object') {
        logger.warn(`[${this.constructor.name}] Invalid command passed to ${propertyKey}`);
        return;
      }

      return originalMethod.apply(this, [engine, command, ...args]);
    };

    return descriptor;
  };
}

/** Resolves the engine for the id passed as the first argument before the method runs. */
export function RequireEngineById() {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as DecoratedMethod;

    descriptor.value = function (
      this: NamedInstance & { getEngine?: (id: BridgeIdentifier) => DecoratorValue },
      ...args: DecoratorValue[]
    ) {
      const [id] = args;

      if (!id) {
        logger.warn(`[${this.constructor.name}] No id provided for ${propertyKey}`);
        return originalMethod.apply(this, args);
      }

      if (!this.getEngine) {
        return originalMethod.apply(this, args);
      }

      const engine = typeof id === 'string' || typeof id === 'number' || typeof id === 'symbol'
        ? this.getEngine(id)
        : null;
      if (!engine) {
        logger.warn(`[${this.constructor.name}] No engine found for id: ${String(id)} in ${propertyKey}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 釉뚮┸吏 ?ㅻ깄?룹쓣 罹먯떛?섎뒗 ?곗퐫?덉씠??
 */
export function CacheSnapshot(ttl: number = 16) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    void propertyKey;
    const originalMethod = descriptor.value as DecoratedMethod;
    const instanceCaches = new WeakMap<object, InstanceSnapshotCache>();

    descriptor.value = function (this: SnapshotCacheHost, ...args: DecoratorValue[]) {
      const firstArg = args[0];
      const now = Date.now();
      let instanceCache = instanceCaches.get(this);

      if (!instanceCache) {
        instanceCache = {
          objectEntries: new WeakMap<object, SnapshotCacheEntry>(),
          primitiveEntries: new Map<PrimitiveDecoratorValue, SnapshotCacheEntry>(),
          nextPrimitivePruneAt: now,
        };
        instanceCaches.set(this, instanceCache);
      }

      pruneExpiredPrimitiveEntries(instanceCache, now, ttl);
      const hasEngineLookup = typeof firstArg === 'string' && Boolean(this.getEngine);
      const objectKey = resolveSnapshotObjectKey(this, firstArg);
      if (objectKey) {
        const cached = instanceCache.objectEntries.get(objectKey);

        if (cached && now - cached.timestamp < ttl) {
          return cached.value;
        }

        const result = originalMethod.apply(this, args);
        instanceCache.objectEntries.set(objectKey, { value: result, timestamp: now });

        return result;
      }

      if (typeof firstArg === 'object' && firstArg !== null) {
        return originalMethod.apply(this, args);
      }

      if (hasEngineLookup) {
        return originalMethod.apply(this, args);
      }

      const cached = instanceCache.primitiveEntries.get(firstArg);

      if (cached && now - cached.timestamp < ttl) {
        return cached.value;
      }

      const result = originalMethod.apply(this, args);
      instanceCache.primitiveEntries.set(firstArg, { value: result, timestamp: now });

      return result;
    };

    return descriptor;
  };
}

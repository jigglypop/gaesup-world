import { logger } from '../../utils/logger';
import { BridgeRegistry } from '../bridge/BridgeRegistry';
import type { RuntimeValue } from '../types';

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

/**
 * 釉뚮┸吏瑜??먮룞?쇰줈 ?깅줉?섎뒗 ?대옒???곗퐫?덉씠??
 */
export function RegisterBridge(domain: string) {
  return function <T extends new (...args: RuntimeValue[]) => object>(constructor: T): T {
    const decoratedConstructor = new Proxy(constructor, {
      construct(target, args, newTarget) {
        const instance = Reflect.construct(target, args, newTarget) as object;
        BridgeRegistry.register(domain, constructor);
        logger.info(`[${constructor.name}] Registered as bridge for domain: ${domain}`);
        return instance;
      }
    });

    Object.defineProperty(decoratedConstructor, 'name', { value: constructor.name });
    return decoratedConstructor as T;
  };
}

/**
 * 釉뚮┸吏 硫붿꽌???몄텧 ???붿쭊 ?곹깭瑜??먮룞?쇰줈 泥댄겕?섎뒗 ?곗퐫?덉씠??
 * 泥?踰덉㎏ ?뚮씪誘명꽣媛 entity/engine??硫붿꽌?쒖뿉 ?ъ슜
 */
export function RequireEngine() {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as DecoratedMethod;

    descriptor.value = function (this: NamedInstance, ...args: DecoratorValue[]) {
      const [engineOrEntity] = args;

      if (!engineOrEntity) {
        throw new Error(`[${this.constructor.name}] Engine/Entity not provided for ${propertyKey}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 釉뚮┸吏 硫붿꽌?쒖뿉???붿쭊 ID濡??붿쭊??媛?몄????섎뒗 寃쎌슦 ?ъ슜
 */
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

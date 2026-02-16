import {
  DecoratorTarget,
  PerformanceWithMemory,
  PropertyDescriptorExtended
} from './types';
import { logger } from '../../utils/logger';

const isProduction =
  (process.env as { NODE_ENV?: string }).NODE_ENV === 'production';

const identityMethodDecorator = (
  target: DecoratorTarget,
  propertyKey: string,
  descriptor: PropertyDescriptorExtended
) => {
  void target;
  void propertyKey;
  return descriptor;
};

const HOOK_BEFORE_METADATA_KEY = 'monitoring:hook:before';
const HOOK_AFTER_METADATA_KEY = 'monitoring:hook:after';

const isPromiseLike = (value: unknown): value is Promise<unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const maybePromise = value as { then?: unknown; finally?: unknown };
  return typeof maybePromise.then === 'function' && typeof maybePromise.finally === 'function';
};

export function Profile(label?: string) {
  if (isProduction) {
    void label;
    return identityMethodDecorator;
  }
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const start = performance.now();
      let result: unknown;
      try {
        result = originalMethod!.apply(this, args);
      } catch (e) {
        const end = performance.now();
        const time = end - start;
        const methodLabel = label || `${target.constructor.name}.${propertyKey}`;
        logger.log(`[Profile] ${methodLabel} executed in ${time.toFixed(2)}ms`);
        throw e;
      }

      if (isPromiseLike(result)) {
        const methodLabel = label || `${target.constructor.name}.${propertyKey}`;
        return (result as Promise<unknown>).finally(() => {
          const end = performance.now();
          const time = end - start;
          logger.log(`[Profile] ${methodLabel} executed in ${time.toFixed(2)}ms`);
        });
      }

      const end = performance.now();
      const time = end - start;
      const methodLabel = label || `${target.constructor.name}.${propertyKey}`;
      logger.log(`[Profile] ${methodLabel} executed in ${time.toFixed(2)}ms`);
      return result;
    };

    return descriptor;
  };
}

export function Log(level: 'log' | 'info' | 'warn' | 'error' = 'log') {
  if (isProduction) {
    void level;
    return identityMethodDecorator;
  }
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      logger[level](`[${target.constructor.name}] Calling ${propertyKey} with args:`, args);
      let result: unknown;
      try {
        result = originalMethod!.apply(this, args);
      } catch (e) {
        throw e;
      }

      if (isPromiseLike(result)) {
        return (result as Promise<unknown>).then(
          (resolved) => {
            logger[level](`[${target.constructor.name}] ${propertyKey} returned:`, resolved);
            return resolved;
          },
          (e) => {
            throw e;
          }
        );
      }

      logger[level](`[${target.constructor.name}] ${propertyKey} returned:`, result);
      return result;
    };

    return descriptor;
  };
}

export function Delay(milliseconds: number) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    void propertyKey;
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      await new Promise(resolve => setTimeout(resolve, milliseconds));
      const result = await originalMethod!.apply(this, args);
      return result;
    };

    return descriptor;
  };
}

export function RateLimit(maxCalls: number, windowMs: number) {
  const callCounts = new Map<string, { count: number; resetTime: number }>();

  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const key = `${target.constructor.name}.${propertyKey}`;
      const now = Date.now();
      const callInfo = callCounts.get(key) || { count: 0, resetTime: now + windowMs };

      if (now > callInfo.resetTime) {
        callInfo.count = 0;
        callInfo.resetTime = now + windowMs;
      }

      if (callInfo.count >= maxCalls) {
        logger.warn(`[RateLimit] ${key} exceeded rate limit`);

        // If Hook decorator was applied "inside" RateLimit, it won't run unless we
        // explicitly run the hook metadata here.
        const before = Reflect.getMetadata(HOOK_BEFORE_METADATA_KEY, target, propertyKey) as
          | undefined
          | (() => void);
        const after = Reflect.getMetadata(HOOK_AFTER_METADATA_KEY, target, propertyKey) as
          | undefined
          | (() => void);
        try {
          before?.();
        } finally {
          after?.();
        }
        return;
      }

      callInfo.count++;
      callCounts.set(key, callInfo);

      return originalMethod!.apply(this, args);
    };

    return descriptor;
  };
}

export function Hook(before?: () => void, after?: () => void) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    // Store hooks for outer decorators (e.g. RateLimit) to use.
    if (before) Reflect.defineMetadata(HOOK_BEFORE_METADATA_KEY, before, target, propertyKey);
    if (after) Reflect.defineMetadata(HOOK_AFTER_METADATA_KEY, after, target, propertyKey);
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      before?.();
      let result: unknown;
      try {
        result = originalMethod!.apply(this, args);
      } catch (e) {
        after?.();
        throw e;
      }

      if (isPromiseLike(result)) {
        return (result as Promise<unknown>).finally(() => {
          after?.();
        });
      }

      after?.();
      return result;
    };

    return descriptor;
  };
}

export function MemoryProfile(label?: string) {
  if (isProduction) {
    void label;
    return identityMethodDecorator;
  }
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      // Node-only API. In browsers, fall back to a no-op wrapper.
      const memoryUsage =
        typeof process !== 'undefined' && typeof process.memoryUsage === 'function'
          ? (process.memoryUsage as () => { heapUsed: number })
          : null;
      if (!memoryUsage) {
        return originalMethod!.apply(this, args);
      }

      const before = memoryUsage();
      let result: unknown;
      try {
        result = originalMethod!.apply(this, args);
      } catch (e) {
        const after = memoryUsage();
        const heapDeltaKb = (after.heapUsed - before.heapUsed) / 1024;
        const methodLabel = label || `${target.constructor.name}.${propertyKey}`;
        logger.log(`[MemoryProfile] ${methodLabel} heap: +${heapDeltaKb.toFixed(2)}KB`);
        throw e;
      }

      const after = memoryUsage();
      const heapDeltaKb = (after.heapUsed - before.heapUsed) / 1024;
      const methodLabel = label || `${target.constructor.name}.${propertyKey}`;
      logger.log(`[MemoryProfile] ${methodLabel} heap: +${heapDeltaKb.toFixed(2)}KB`);
      return result;
    };

    return descriptor;
  };
}

export function MonitorMemory(threshold: number = 100) { // MB 단위
  if (isProduction) {
    void threshold;
    return identityMethodDecorator;
  }
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const perf = performance as PerformanceWithMemory;
      const beforeMemory = perf.memory?.usedJSHeapSize || 0;
      const result = originalMethod!.apply(this, args);
      const afterMemory = perf.memory?.usedJSHeapSize || 0;
      
      const memoryDelta = (afterMemory - beforeMemory) / (1024 * 1024); // MB 변환
      
      if (memoryDelta > threshold) {
        logger.warn(
          `[${
            this.constructor.name
          }] ${propertyKey} allocated ${memoryDelta.toFixed(2)}MB of memory`
        );
      }

      return result;
    };

    return descriptor;
  };
}

export function TrackCalls() {
  if (isProduction) {
    return identityMethodDecorator;
  }
  const callCounts = new Map<string, number>();
  
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const key = `${this.constructor.name}.${propertyKey}`;
      const count = (callCounts.get(key) || 0) + 1;
      callCounts.set(key, count);
      
      if (count % 1000 === 0) {
        logger.info(`[${this.constructor.name}] ${propertyKey} called ${count} times`);
      }
      
      return originalMethod!.apply(this, args);
    };

    return descriptor;
  };
}

export function Timeout(ms: number) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${propertyKey} timed out after ${ms}ms`)), ms);
      });
      
      try {
        return await Promise.race([
          originalMethod!.apply(this, args),
          timeoutPromise
        ]);
      } catch (error) {
        logger.error(`[${this.constructor.name}] ${propertyKey} timeout:`, error);
        throw error;
      }
    };

    return descriptor;
  };
} 
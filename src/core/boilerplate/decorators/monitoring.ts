import {
  DecoratorTarget,
  PerformanceWithMemory,
  PropertyDescriptorExtended
} from './types';
import { logger } from '../../utils/logger';

export function Profile(label?: string) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const start = performance.now();
      const result = originalMethod!.apply(this, args);
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
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      logger[level](`[${target.constructor.name}] Calling ${propertyKey} with args:`, args);
      const result = originalMethod!.apply(this, args);
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
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      if (before) before();
      const result = originalMethod!.apply(this, args);
      if (after) after();
      return result;
    };

    return descriptor;
  };
}

export function MonitorMemory(threshold: number = 100) { // MB 단위
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
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
  const callCounts = new Map<string, number>();
  
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
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
import { logger } from '../../utils/logger';

type DecoratorTarget = object;
type PropertyDescriptorExtended = PropertyDescriptor & {
  value?: (...args: unknown[]) => unknown;
};

// Chrome/Edge의 비표준 performance.memory API 타입 정의
interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/**
 * 메서드 실행 시간을 로깅하는 데코레이터
 */
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

/**
 * 메서드 호출을 로깅하는 데코레이터
 */
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

/**
 * 메서드 실행을 지연시키는 데코레이터
 */
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

/**
 * 메서드 호출 횟수를 제한하는 데코레이터
 */
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

/**
 * 메서드 실행 전후에 커스텀 로직을 실행하는 데코레이터
 */
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

/**
 * 메모리 사용량을 모니터링하는 데코레이터
 */
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
        logger.warn(`[${this.constructor.name}] ${propertyKey} allocated ${memoryDelta.toFixed(2)}MB of memory`);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * 메서드 호출 횟수를 추적하는 데코레이터
 */
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

/**
 * 비동기 메서드의 타임아웃을 설정하는 데코레이터
 */
export function Timeout(ms: number) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
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
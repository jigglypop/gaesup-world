import { logger } from '../../utils/logger';

/**
 * 메모리 사용량을 모니터링하는 데코레이터
 */
export function MonitorMemory(threshold: number = 100) { // MB 단위
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const beforeMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const result = originalMethod.apply(this, args);
      const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
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
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const key = `${this.constructor.name}.${propertyKey}`;
      const count = (callCounts.get(key) || 0) + 1;
      callCounts.set(key, count);
      
      if (count % 1000 === 0) {
        logger.info(`[${this.constructor.name}] ${propertyKey} called ${count} times`);
      }
      
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 비동기 메서드의 타임아웃을 설정하는 데코레이터
 */
export function Timeout(ms: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${propertyKey} timed out after ${ms}ms`)), ms);
      });
      
      try {
        return await Promise.race([
          originalMethod.apply(this, args),
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

/**
 * 메서드 실행 전후에 이벤트를 발생시키는 데코레이터
 */
export function EmitEvents(beforeEvent?: string, afterEvent?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (beforeEvent && this.emit) {
        this.emit(beforeEvent, { method: propertyKey, args });
      }
      
      const result = originalMethod.apply(this, args);
      
      if (afterEvent && this.emit) {
        this.emit(afterEvent, { method: propertyKey, args, result });
      }
      
      return result;
    };

    return descriptor;
  };
}

/**
 * 메서드 실행 결과를 검증하는 데코레이터
 */
export function ValidateResult<T>(validator: (result: T) => boolean, errorMessage?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      
      if (!validator(result)) {
        const message = errorMessage || `${propertyKey} returned invalid result`;
        logger.error(`[${this.constructor.name}] ${message}:`, result);
        throw new Error(message);
      }
      
      return result;
    };

    return descriptor;
  };
} 
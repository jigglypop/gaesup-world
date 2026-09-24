import {
  DecoratedValue,
  DecoratorTarget,
  PerformanceWithMemory,
  PropertyDescriptorExtended
} from './types';
import { isProductionEnv } from '../../utils/env';
import { logger } from '../../utils/logger';

const isProduction = isProductionEnv();

const identityMethodDecorator = (
  target: DecoratorTarget,
  propertyKey: string,
  descriptor: PropertyDescriptorExtended
) => {
  void target;
  void propertyKey;
  return descriptor;
};

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

    descriptor.value = function (...args: DecoratedValue[]) {
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

export function Timeout(ms: number) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    const originalMethod = descriptor.value;

    // The timer only bounds the caller's wait; the original work is not cancelled.
    descriptor.value = async function (...args: DecoratedValue[]) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${propertyKey} timed out after ${ms}ms`)), ms);
      });

      try {
        return await Promise.race([
          originalMethod!.apply(this, args),
          timeoutPromise
        ]);
      } catch (error) {
        logger.error(
          `[${this.constructor.name}] ${propertyKey} timeout:`,
          error instanceof Error ? error : String(error),
        );
        throw error;
      } finally {
        clearTimeout(timer);
      }
    };

    return descriptor;
  };
} 

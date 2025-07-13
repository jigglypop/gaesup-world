import { logger } from '../../utils/logger';
import { SystemRegistry } from '../entity/SystemRegistry';
import {
  DecoratorTarget,
  PropertyDescriptorExtended,
  AnyConstructor
} from './types';

/**
 * 시스템 메서드의 에러를 자동으로 처리하는 데코레이터
 */
export function HandleError(defaultReturn?: unknown) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      try {
        return originalMethod!.apply(this, args);
      } catch (error) {
        logger.error(`[${this.constructor.name}] Error in ${propertyKey}:`, error);
        return defaultReturn;
      }
    };

    return descriptor;
  };
}

/**
 * 시스템 초기화를 로깅하는 데코레이터
 */
export function LogInitialization() {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      logger.info(`[${this.constructor.name}] Initializing`);
      const startTime = performance.now();
      const result = originalMethod!.apply(this, args);
      const endTime = performance.now();
      logger.info(`[${this.constructor.name}] Initialized in ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    };
    return descriptor;
  };
}

/**
 * 시스템을 자동으로 등록하는 클래스 데코레이터
 */
export function RegisterSystem(systemType: string) {
  return function <T extends AnyConstructor>(constructor: T) {
    const decoratedClass = class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        SystemRegistry.register(systemType, this as any);
        logger.info(`[${constructor.name}] Registered as ${systemType} system`);
      }
    };
    // 원래 클래스의 이름을 유지
    Object.defineProperty(decoratedClass, 'name', { value: constructor.name });
    return decoratedClass as T;
  };
}

/**
 * 시스템의 런타임을 자동으로 관리하는 클래스 데코레이터
 */
export function ManageRuntime(options: { autoStart?: boolean } = {}) {
  return function <T extends AnyConstructor>(constructor: T) {
    const decoratedClass = class extends constructor {
      private animationFrameId: number | null = null;
      private lastTime: number = 0;
      private totalTime: number = 0;
      private frameCount: number = 0;

      constructor(...args: any[]) {
        super(...args);
        
        if (options.autoStart) {
          this.startRuntime();
        }
      }

      private startRuntime() {
        const loop = (currentTime: number) => {
          if (this.lastTime === 0) {
            this.lastTime = currentTime;
          }
          
          const deltaTime = currentTime - this.lastTime;
          this.lastTime = currentTime;
          this.totalTime += deltaTime;
          this.frameCount++;
          
          const context = {
            deltaTime,
            totalTime: this.totalTime,
            frameCount: this.frameCount
          };
          
          // Type-safe update method call
          const instance = this as unknown as { update?: (context: unknown) => void };
          if (instance.update && typeof instance.update === 'function') {
            instance.update(context);
          }
          
          this.animationFrameId = requestAnimationFrame(loop);
        };
        
        this.animationFrameId = requestAnimationFrame(loop);
        logger.info(`[${constructor.name}] Runtime started`);
      }

      dispose() {
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
          logger.info(`[${constructor.name}] Runtime stopped`);
        }
        
        // 원래 클래스의 dispose 메서드 호출
        const originalDispose = constructor.prototype.dispose;
        if (originalDispose && typeof originalDispose === 'function') {
          originalDispose.call(this);
        }
      }
    };
    // 원래 클래스의 이름을 유지
    Object.defineProperty(decoratedClass, 'name', { value: constructor.name });
    return decoratedClass as T;
  };
} 
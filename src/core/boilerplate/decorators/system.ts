import { logger } from '../../utils/logger';
import { BaseSystem, SystemContext } from '../entity/BaseSystem';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * 메서드 실행 시간을 측정하는 데코레이터
 */
export function Profile() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();
      const result = originalMethod.apply(this, args);
      const endTime = performance.now();
      
      logger.log(`[${this.constructor.name}] ${propertyKey} took ${(endTime - startTime).toFixed(2)}ms`);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * 에러 처리를 자동으로 수행하는 데코레이터
 */
export function HandleError() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);
        
        // Promise 처리
        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            logger.error(`[${this.constructor.name}] Error in ${propertyKey}:`, error);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        logger.error(`[${this.constructor.name}] Error in ${propertyKey}:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 시스템의 런타임을 자동으로 관리하는 클래스 데코레이터
 */
export function ManageRuntime(options: { autoStart?: boolean } = {}) {
  return function <T extends Constructor<BaseSystem>>(constructor: T) {
    return class extends constructor {
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
          
          const context: SystemContext = {
            deltaTime,
            totalTime: this.totalTime,
            frameCount: this.frameCount
          };
          
          this.update(context);
          
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
        
        if (super.dispose) {
          super.dispose();
        }
      }
    };
  };
} 
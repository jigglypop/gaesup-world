import {
  DecoratorTarget,
  DecoratedValue,
  PropertyDescriptorExtended,
  AnyConstructor
} from './types';
import { logger } from '../../utils/logger';
import type { BaseSystem } from '../entity/BaseSystem';
import type { SystemContext } from '../entity/BaseSystem';
import { SystemRegistry } from '../entity/SystemRegistry';
import type { RuntimeValue } from '../types';

type RuntimeState = {
  animationFrameId: number | null;
  lastTime: number;
  totalTime: number;
  frameCount: number;
};

type DisposableInstance = {
  dispose?: () => void;
  update?: (context: SystemContext) => void;
};

type HandledErrorValue = Error | RuntimeValue;

/**
 * ?쒖뒪??硫붿꽌?쒖쓽 ?먮윭瑜??먮룞?쇰줈 泥섎━?섎뒗 ?곗퐫?덉씠??
 */
export function HandleError(defaultReturn?: DecoratedValue) {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: never[]) {
      try {
        return originalMethod!.apply(this, args);
      } catch (error) {
        const loggedError: HandledErrorValue = error instanceof Error ? error : String(error);
        logger.error(
          `[${this.constructor.name}] Error in ${propertyKey}:`,
          loggedError,
        );
        return defaultReturn;
      }
    };

    return descriptor;
  };
}

/**
 * ?쒖뒪??珥덇린?붾? 濡쒓퉭?섎뒗 ?곗퐫?덉씠??
 */
export function LogInitialization() {
  return function (
    target: DecoratorTarget,
    propertyKey: string,
    descriptor: PropertyDescriptorExtended
  ) {
    void target;
    void propertyKey;
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: never[]) {
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
 * ?쒖뒪?쒖쓣 ?먮룞?쇰줈 ?깅줉?섎뒗 ?대옒???곗퐫?덉씠??
 */
export function RegisterSystem(systemType: string) {
  return function <T extends AnyConstructor>(constructor: T): T {
    const decoratedConstructor = new Proxy(constructor, {
      construct(target, args, newTarget) {
        const instance = Reflect.construct(target, args, newTarget) as BaseSystem;
        SystemRegistry.register(systemType, instance);
        logger.info(`[${constructor.name}] Registered as ${systemType} system`);
        return instance;
      }
    });

    Object.defineProperty(decoratedConstructor, 'name', { value: constructor.name });
    return decoratedConstructor as T;
  };
}

/**
 * ?쒖뒪?쒖쓽 ?고??꾩쓣 ?먮룞?쇰줈 愿由ы븯???대옒???곗퐫?덉씠??
 */
export function ManageRuntime(options: { autoStart?: boolean } = {}) {
  return function <T extends AnyConstructor>(constructor: T): T {
    const runtimeState = new WeakMap<object, RuntimeState>();

    const decoratedConstructor = new Proxy(constructor, {
      construct(target, args, newTarget) {
        const instance = Reflect.construct(target, args, newTarget) as object & DisposableInstance;
        const state: RuntimeState = {
          animationFrameId: null,
          lastTime: 0,
          totalTime: 0,
          frameCount: 0,
        };
        runtimeState.set(instance, state);

        const stopRuntime = () => {
          if (state.animationFrameId !== null) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
            logger.info(`[${constructor.name}] Runtime stopped`);
          }
        };

        const startRuntime = () => {
          const loop = (currentTime: number) => {
            if (state.lastTime === 0) {
              state.lastTime = currentTime;
            }

            const deltaTime = currentTime - state.lastTime;
            state.lastTime = currentTime;
            state.totalTime += deltaTime;
            state.frameCount++;

            const context = {
              deltaTime,
              totalTime: state.totalTime,
              frameCount: state.frameCount
            };

            if (instance.update && typeof instance.update === 'function') {
              instance.update(context);
            }

            state.animationFrameId = requestAnimationFrame(loop);
          };

          state.animationFrameId = requestAnimationFrame(loop);
          logger.info(`[${constructor.name}] Runtime started`);
        };

        const originalDispose = instance.dispose?.bind(instance);
        Object.defineProperty(instance, 'dispose', {
          configurable: true,
          writable: true,
          value: () => {
            stopRuntime();
            originalDispose?.();
          }
        });

        if (options.autoStart) {
          startRuntime();
        }

        return instance;
      }
    });

    Object.defineProperty(decoratedConstructor, 'name', { value: constructor.name });
    return decoratedConstructor as T;
  };
}

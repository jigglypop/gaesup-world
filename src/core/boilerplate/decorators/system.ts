import {
  DecoratorTarget,
  DecoratedValue,
  PropertyDescriptorExtended,
} from './types';
import { logger } from '../../utils/logger';
import type { RuntimeValue } from '../types';

type HandledErrorValue = Error | RuntimeValue;

/**
 * Catches synchronous errors, logs them, and returns `defaultReturn`.
 * Scheduled for removal (PRD 23, G2): errors move to phase and command boundaries.
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

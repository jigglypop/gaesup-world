import { logger } from '../../utils/logger';
import { BridgeRegistry } from '../bridge/BridgeRegistry';

type NamedInstance = { constructor: { name: string } };

/**
 * 브릿지 메서드의 스냅샷 처리를 자동으로 로깅하는 데코레이터
 */
export function LogSnapshot() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: NamedInstance, ...args: unknown[]) {
      const startTime = performance.now();
      const result = originalMethod.apply(this, args);
      const endTime = performance.now();

      logger.log(`[${this.constructor.name}] ${propertyKey} snapshot processed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * 브릿지 명령어 처리를 자동으로 검증하는 데코레이터
 * CoreBridge의 executeCommand 메서드에 사용
 */
export function ValidateCommand() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as (
      engine: unknown,
      command: unknown,
      ...args: unknown[]
    ) => unknown;

    descriptor.value = function (this: NamedInstance, engine: unknown, command: unknown, ...args: unknown[]) {
      // executeCommand의 경우 첫 번째 인자가 engine, 두 번째가 command
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
 * 브릿지를 자동으로 등록하는 클래스 데코레이터
 */
export function RegisterBridge(domain: string) {
  // TS mixin requirement: base constructor args must be `any[]`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends new (...args: any[]) => object>(constructor: T) {
    return class extends constructor {
      // TS mixin requirement: rest args must be `any[]`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any[]) {
        super(...(args as unknown as ConstructorParameters<T>));
        
        // BridgeRegistry에 자동 등록
        BridgeRegistry.register(domain, constructor);
        
        logger.info(`[${constructor.name}] Registered as bridge for domain: ${domain}`);
      }
    };
  };
}

/**
 * 브릿지 메서드 호출 시 엔진 상태를 자동으로 체크하는 데코레이터
 * 첫 번째 파라미터가 entity/engine인 메서드에 사용
 */
export function RequireEngine() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: NamedInstance, ...args: unknown[]) {
      const [engineOrEntity] = args;
      
      // 첫 번째 인자가 engine/entity인지 확인
      if (!engineOrEntity) {
        throw new Error(`[${this.constructor.name}] Engine/Entity not provided for ${propertyKey}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 브릿지 메서드에서 엔진 ID로 엔진을 가져와야 하는 경우 사용
 */
export function RequireEngineById() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (
      this: NamedInstance & { getEngine?: (id: unknown) => unknown },
      ...args: unknown[]
    ) {
      const [id] = args;
      
      // ID가 없으면 원래 메서드 실행
      if (!id) {
        logger.warn(`[${this.constructor.name}] No id provided for ${propertyKey}`);
        return originalMethod.apply(this, args);
      }
      
      // getEngine 메서드가 없으면 원래 메서드 실행
      if (!this.getEngine) {
        return originalMethod.apply(this, args);
      }
      
      // 엔진이 없어도 원래 메서드는 실행 (메서드 내부에서 처리하도록)
      const engine = this.getEngine(id);
      if (!engine) {
        logger.warn(`[${this.constructor.name}] No engine found for id: ${id} in ${propertyKey}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 브릿지 스냅샷을 캐싱하는 데코레이터
 */
export function CacheSnapshot(ttl: number = 16) { // 기본 16ms (60fps)
  const cache = new Map<string, { value: unknown; timestamp: number }>();
  
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    void target;
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: NamedInstance, ...args: unknown[]) {
      const firstArg = args[0];
      const argKey =
        typeof firstArg === 'object' && firstArg !== null && 'id' in firstArg
          ? String((firstArg as { id: unknown }).id)
          : String(firstArg ?? 'default');
      const cacheKey = `${this.constructor.name}_${propertyKey}_${argKey}`;
      const now = Date.now();
      const cached = cache.get(cacheKey);

      if (cached && (now - cached.timestamp) < ttl) {
        return cached.value;
      }

      const result = originalMethod.apply(this, args);
      cache.set(cacheKey, { value: result, timestamp: now });
      
      return result;
    };

    return descriptor;
  };
} 
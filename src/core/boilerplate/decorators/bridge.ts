import { logger } from '../../utils/logger';

/**
 * 브릿지 메서드의 스냅샷 처리를 자동으로 로깅하는 데코레이터
 */
export function LogSnapshot() {
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
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (engine: any, command: any, ...args: any[]) {
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
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        
        // BridgeRegistry에 자동 등록
        const BridgeRegistry = require('../bridge/BridgeRegistry').BridgeRegistry;
        BridgeRegistry.register(domain, this);
        
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
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
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
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
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
  const cache = new Map<string, { value: any; timestamp: number }>();
  
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = `${this.constructor.name}_${propertyKey}_${args[0]?.id || args[0] || 'default'}`;
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
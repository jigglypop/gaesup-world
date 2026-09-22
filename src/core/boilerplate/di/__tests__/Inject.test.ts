import 'reflect-metadata';
import { Inject } from '../Inject';

describe('@Inject 데코레이터', () => {
  beforeEach(() => {
    // 각 테스트 전에 메타데이터를 정리할 필요가 있다면
  });

  describe('생성자 파라미터 주입', () => {
    test('생성자 파라미터에 토큰을 설정해야 함', () => {
      class TestService {
        constructor(@Inject('test-token') readonly dependency: unknown) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', TestService);
      expect(paramTypes).toBeDefined();
      expect(paramTypes[0]).toBe('test-token');
    });

    test('여러 파라미터에 각각 다른 토큰을 설정할 수 있어야 함', () => {
      class MultiDependencyService {
        constructor(
          @Inject('token-1') readonly dep1: unknown,
          @Inject('token-2') readonly dep2: unknown,
          @Inject('token-3') readonly dep3: unknown
        ) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', MultiDependencyService);
      expect(paramTypes[0]).toBe('token-1');
      expect(paramTypes[1]).toBe('token-2');
      expect(paramTypes[2]).toBe('token-3');
    });

    test('일부 파라미터만 @Inject를 사용할 수 있어야 함', () => {
      class PartialInjectService {
        constructor(
          readonly normalDep: unknown, // @Inject 없음
          @Inject('injected-token') readonly injectedDep: unknown
        ) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', PartialInjectService);
      expect(paramTypes[0]).toBeUndefined(); // 명시적으로 설정되지 않음
      expect(paramTypes[1]).toBe('injected-token');
    });

    test('심볼 토큰을 파라미터에 설정할 수 있어야 함', () => {
      const SymbolToken = Symbol('test-service');
      
      class SymbolInjectService {
        constructor(@Inject(SymbolToken) readonly service: unknown) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', SymbolInjectService);
      expect(paramTypes[0]).toBe(SymbolToken);
    });

    test('클래스 토큰을 파라미터에 설정할 수 있어야 함', () => {
      class InterfaceToken {}
      
      class ClassInjectService {
        constructor(@Inject(InterfaceToken) readonly service: unknown) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', ClassInjectService);
      expect(paramTypes[0]).toBe(InterfaceToken);
    });
  });

  describe('프로퍼티 주입', () => {
    test('프로퍼티에 토큰을 설정해야 함', () => {
      class PropertyInjectService {
        @Inject('property-token')
        public injectedProperty: unknown;
      }
      
      const properties = Reflect.getMetadata('di:properties', PropertyInjectService);
      expect(properties).toBeDefined();
      expect(properties['injectedProperty']).toBe('property-token');
    });

    test('여러 프로퍼티에 각각 다른 토큰을 설정할 수 있어야 함', () => {
      class MultiPropertyService {
        @Inject('token-a')
        public propA: unknown;
        
        @Inject('token-b')
        public propB: unknown;
        
        @Inject('token-c')
        protected propC: unknown;
      }
      
      const properties = Reflect.getMetadata('di:properties', MultiPropertyService);
      expect(properties['propA']).toBe('token-a');
      expect(properties['propB']).toBe('token-b');
      expect(properties['propC']).toBe('token-c');
    });

    test('심볼 토큰을 프로퍼티에 설정할 수 있어야 함', () => {
      const PropertyToken = Symbol('property-service');
      
      class SymbolPropertyService {
        @Inject(PropertyToken)
        public service: unknown;
      }
      
      const properties = Reflect.getMetadata('di:properties', SymbolPropertyService);
      expect(properties['service']).toBe(PropertyToken);
    });

    test('클래스 토큰을 프로퍼티에 설정할 수 있어야 함', () => {
      class ServiceInterface {}
      
      class ClassPropertyService {
        @Inject(ServiceInterface)
        public service: unknown;
      }
      
      const properties = Reflect.getMetadata('di:properties', ClassPropertyService);
      expect(properties['service']).toBe(ServiceInterface);
    });
  });

  describe('메타데이터 관리', () => {
    test('기존 메타데이터를 보존하면서 새로운 토큰을 추가해야 함', () => {
      class IncrementalService {
        constructor(@Inject('first') readonly first: unknown) {}
      }
      
      // 두 번째 파라미터 추가 시뮬레이션
      const existingTokens = Reflect.getMetadata('di:paramtypes', IncrementalService) || [];
      existingTokens[1] = 'second';
      Reflect.defineMetadata('di:paramtypes', existingTokens, IncrementalService);
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', IncrementalService);
      expect(paramTypes[0]).toBe('first');
      expect(paramTypes[1]).toBe('second');
    });

    test('프로퍼티 메타데이터도 누적적으로 관리되어야 함', () => {
      class CumulativeService {
        @Inject('prop1')
        public prop1: unknown;
      }
      
      // 수동으로 두 번째 프로퍼티 추가
      const existingProps = Reflect.getMetadata('di:properties', CumulativeService) || {};
      existingProps['prop2'] = 'prop2-token';
      Reflect.defineMetadata('di:properties', existingProps, CumulativeService);
      
      const properties = Reflect.getMetadata('di:properties', CumulativeService);
      expect(properties['prop1']).toBe('prop1');
      expect(properties['prop2']).toBe('prop2-token');
    });
  });

  describe('상속과 메타데이터', () => {
    test('상속된 클래스는 독립적인 메타데이터를 가져야 함', () => {
      class BaseService {
        constructor(@Inject('base-token') protected baseDep: unknown) {}
      }
      
      class DerivedService extends BaseService {
        constructor(
          @Inject('base-token') baseDep: unknown,
          @Inject('derived-token') readonly derivedDep: unknown
        ) {
          super(baseDep);
        }
      }
      
      const baseParams = Reflect.getMetadata('di:paramtypes', BaseService);
      const derivedParams = Reflect.getMetadata('di:paramtypes', DerivedService);
      
      expect(baseParams[0]).toBe('base-token');
      expect(derivedParams[0]).toBe('base-token');
      expect(derivedParams[1]).toBe('derived-token');
    });

    test('상속된 클래스의 프로퍼티도 독립적이어야 함', () => {
      class BaseService {
        @Inject('base-prop')
        protected baseProp: unknown;
      }
      
      class DerivedService extends BaseService {
        @Inject('derived-prop')
        public derivedProp: unknown;
      }
      
      const baseProps = Reflect.getMetadata('di:properties', BaseService);
      const derivedProps = Reflect.getMetadata('di:properties', DerivedService);
      
      expect(baseProps['baseProp']).toBe('base-prop');
      expect(derivedProps['derivedProp']).toBe('derived-prop');
      // 상속은 메타데이터를 자동으로 상속하지 않음
    });
  });

  describe('복합 사용 패턴', () => {
    test('생성자와 프로퍼티 주입을 함께 사용할 수 있어야 함', () => {
      class MixedInjectService {
        @Inject('property-service')
        public propertyService: unknown;
        
        constructor(@Inject('constructor-service') readonly constructorService: unknown) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', MixedInjectService);
      const properties = Reflect.getMetadata('di:properties', MixedInjectService);
      
      expect(paramTypes[0]).toBe('constructor-service');
      expect(properties['propertyService']).toBe('property-service');
    });

    test('같은 토큰을 생성자와 프로퍼티에서 사용할 수 있어야 함', () => {
      const SharedToken = Symbol('shared-service');
      
      class SharedTokenService {
        @Inject(SharedToken)
        public sharedProp: unknown;
        
        constructor(@Inject(SharedToken) readonly sharedParam: unknown) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', SharedTokenService);
      const properties = Reflect.getMetadata('di:properties', SharedTokenService);
      
      expect(paramTypes[0]).toBe(SharedToken);
      expect(properties['sharedProp']).toBe(SharedToken);
    });
  });

  describe('에러 상황', () => {
    test('잘못된 사용법에도 에러를 발생시키지 않아야 함', () => {
      expect(() => {
        class ErrorTestService {
          // @ts-expect-error: method targets are misuse, but applying the decorator must not throw
          @Inject('test-token')
          public method() {} // 메서드에 적용 (정상적이지 않지만 에러 없어야 함)
        }
        return ErrorTestService;
      }).not.toThrow();
    });

    test('undefined나 null 토큰도 처리할 수 있어야 함', () => {
      expect(() => {
        class NullTokenService {
          constructor(
            // @ts-expect-error: null tokens from untyped callers must not throw
            @Inject(null) readonly dep: unknown
          ) {}
        }
        return NullTokenService;
      }).not.toThrow();
      
      expect(() => {
        class UndefinedTokenService {
          // @ts-expect-error: undefined tokens from untyped callers must not throw
          @Inject(undefined)
          public prop: unknown;
        }
        return UndefinedTokenService;
      }).not.toThrow();
    });
  });

  describe('타입 안전성', () => {
    test('다양한 토큰 타입을 허용해야 함', () => {
      const symbolToken = Symbol('test');
      const stringToken = 'test-string';
      
      expect(() => {
        class TypeSafeService {
          constructor(
            @Inject(symbolToken) readonly symbolDep: unknown,
            @Inject(stringToken) readonly stringDep: unknown,
            @Inject(Object) readonly classDep: unknown
          ) {}
        }
        return TypeSafeService;
      }).not.toThrow();
    });

    test('토큰이 메타데이터에 정확히 저장되어야 함', () => {
      const complexToken = { type: 'complex', id: 123 };
      
      class ComplexTokenService {
        // @ts-expect-error: non-token objects are outside the Token type but must be stored verbatim
        @Inject(complexToken)
        public complex: unknown;
      }
      
      const properties = Reflect.getMetadata('di:properties', ComplexTokenService);
      expect(properties['complex']).toBe(complexToken);
    });
  });

  describe('실제 사용 사례', () => {
    test('인터페이스 기반 주입 패턴', () => {
      abstract class ILogger {
        abstract log(message: string): void;
      }
      
      class ServiceWithLogger {
        constructor(@Inject(ILogger) readonly logger: ILogger) {}
        
        @Inject(ILogger)
        public alternativeLogger!: ILogger;
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', ServiceWithLogger);
      const properties = Reflect.getMetadata('di:properties', ServiceWithLogger);
      
      expect(paramTypes[0]).toBe(ILogger);
      expect(properties['alternativeLogger']).toBe(ILogger);
    });

    test('설정 기반 주입 패턴', () => {
      const ConfigToken = Symbol('AppConfig');
      const DatabaseToken = Symbol('Database');
      
      class ApplicationService {
        constructor(
          @Inject(ConfigToken) readonly config: unknown,
          @Inject(DatabaseToken) readonly db: unknown
        ) {}
        
        @Inject('cache-service')
        public cache: unknown;
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', ApplicationService);
      const properties = Reflect.getMetadata('di:properties', ApplicationService);
      
      expect(paramTypes[0]).toBe(ConfigToken);
      expect(paramTypes[1]).toBe(DatabaseToken);
      expect(properties['cache']).toBe('cache-service');
    });
  });
}); 
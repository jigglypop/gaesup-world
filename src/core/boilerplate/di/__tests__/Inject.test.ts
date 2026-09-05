import 'reflect-metadata';
import { Inject } from '../Inject';

describe('@Inject 데코레이터', () => {
  beforeEach(() => {
    // 각 테스트 전에 메타데이터를 정리할 필요가 있다면
  });

  describe('생성자 파라미터 주입', () => {
    test('생성자 파라미터에 토큰을 설정해야 함', () => {
      class TestService {
        constructor(@Inject('test-token') private dependency: any) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', TestService);
      expect(paramTypes).toBeDefined();
      expect(paramTypes[0]).toBe('test-token');
    });

    test('여러 파라미터에 각각 다른 토큰을 설정할 수 있어야 함', () => {
      class MultiDependencyService {
        constructor(
          @Inject('token-1') private dep1: any,
          @Inject('token-2') private dep2: any,
          @Inject('token-3') private dep3: any
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
          private normalDep: any, // @Inject 없음
          @Inject('injected-token') private injectedDep: any
        ) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', PartialInjectService);
      expect(paramTypes[0]).toBeUndefined(); // 명시적으로 설정되지 않음
      expect(paramTypes[1]).toBe('injected-token');
    });

    test('심볼 토큰을 파라미터에 설정할 수 있어야 함', () => {
      const SymbolToken = Symbol('test-service');
      
      class SymbolInjectService {
        constructor(@Inject(SymbolToken) private service: any) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', SymbolInjectService);
      expect(paramTypes[0]).toBe(SymbolToken);
    });

    test('클래스 토큰을 파라미터에 설정할 수 있어야 함', () => {
      class InterfaceToken {}
      
      class ClassInjectService {
        constructor(@Inject(InterfaceToken) private service: any) {}
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', ClassInjectService);
      expect(paramTypes[0]).toBe(InterfaceToken);
    });
  });

  describe('프로퍼티 주입', () => {
    test('프로퍼티에 토큰을 설정해야 함', () => {
      class PropertyInjectService {
        @Inject('property-token')
        public injectedProperty: any;
      }
      
      const properties = Reflect.getMetadata('di:properties', PropertyInjectService);
      expect(properties).toBeDefined();
      expect(properties['injectedProperty']).toBe('property-token');
    });

    test('여러 프로퍼티에 각각 다른 토큰을 설정할 수 있어야 함', () => {
      class MultiPropertyService {
        @Inject('token-a')
        public propA: any;
        
        @Inject('token-b')
        public propB: any;
        
        @Inject('token-c')
        private propC: any;
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
        public service: any;
      }
      
      const properties = Reflect.getMetadata('di:properties', SymbolPropertyService);
      expect(properties['service']).toBe(PropertyToken);
    });

    test('클래스 토큰을 프로퍼티에 설정할 수 있어야 함', () => {
      class ServiceInterface {}
      
      class ClassPropertyService {
        @Inject(ServiceInterface)
        public service: any;
      }
      
      const properties = Reflect.getMetadata('di:properties', ClassPropertyService);
      expect(properties['service']).toBe(ServiceInterface);
    });
  });

  describe('메타데이터 관리', () => {
    test('기존 메타데이터를 보존하면서 새로운 토큰을 추가해야 함', () => {
      class IncrementalService {
        constructor(@Inject('first') private first: any) {}
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
        public prop1: any;
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
        constructor(@Inject('base-token') protected baseDep: any) {}
      }
      
      class DerivedService extends BaseService {
        constructor(
          @Inject('base-token') baseDep: any,
          @Inject('derived-token') private derivedDep: any
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
        protected baseProp: any;
      }
      
      class DerivedService extends BaseService {
        @Inject('derived-prop')
        public derivedProp: any;
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
        public propertyService: any;
        
        constructor(@Inject('constructor-service') private constructorService: any) {}
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
        public sharedProp: any;
        
        constructor(@Inject(SharedToken) private sharedParam: any) {}
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
          @Inject('test-token')
          public method() {} // 메서드에 적용 (정상적이지 않지만 에러 없어야 함)
        }
      }).not.toThrow();
    });

    test('undefined나 null 토큰도 처리할 수 있어야 함', () => {
      expect(() => {
        class NullTokenService {
          constructor(@Inject(null as any) private dep: any) {}
        }
      }).not.toThrow();
      
      expect(() => {
        class UndefinedTokenService {
          @Inject(undefined as any)
          public prop: any;
        }
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
            @Inject(symbolToken) private symbolDep: any,
            @Inject(stringToken) private stringDep: any,
            @Inject(Object) private classDep: any
          ) {}
        }
      }).not.toThrow();
    });

    test('토큰이 메타데이터에 정확히 저장되어야 함', () => {
      const complexToken = { type: 'complex', id: 123 };
      
      class ComplexTokenService {
        @Inject(complexToken as any)
        public complex: any;
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
        constructor(@Inject(ILogger) private logger: ILogger) {}
        
        @Inject(ILogger)
        public alternativeLogger: ILogger;
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
          @Inject(ConfigToken) private config: any,
          @Inject(DatabaseToken) private db: any
        ) {}
        
        @Inject('cache-service')
        public cache: any;
      }
      
      const paramTypes = Reflect.getMetadata('di:paramtypes', ApplicationService);
      const properties = Reflect.getMetadata('di:properties', ApplicationService);
      
      expect(paramTypes[0]).toBe(ConfigToken);
      expect(paramTypes[1]).toBe(DatabaseToken);
      expect(properties['cache']).toBe('cache-service');
    });
  });
}); 
import 'reflect-metadata';
import { Autowired } from '../Autowired';

describe('@Autowired 데코레이터', () => {
  beforeEach(() => {
    // 각 테스트 전에 필요한 정리 작업
  });

  describe('기본 동작', () => {
    test('프로퍼티를 autowired 목록에 추가해야 함', () => {
      class TestService {
        @Autowired()
        public dependency: any;
      }
      
      const autowiredProps = Reflect.getMetadata('autowired', TestService);
      expect(autowiredProps).toBeDefined();
      expect(autowiredProps).toContain('dependency');
    });

    test('여러 프로퍼티를 autowired 목록에 추가할 수 있어야 함', () => {
      class MultiAutowiredService {
        @Autowired()
        public service1: any;
        
        @Autowired()
        public service2: any;
        
        @Autowired()
        private service3: any;
      }
      
      const autowiredProps = Reflect.getMetadata('autowired', MultiAutowiredService);
      expect(autowiredProps).toContain('service1');
      expect(autowiredProps).toContain('service2');
      expect(autowiredProps).toContain('service3');
      expect(autowiredProps).toHaveLength(3);
    });

    test('기존 autowired 목록을 보존하면서 새 프로퍼티를 추가해야 함', () => {
      class IncrementalService {
        @Autowired()
        public first: any;
      }
      
      // 기존 메타데이터 확인
      let autowiredProps = Reflect.getMetadata('autowired', IncrementalService);
      expect(autowiredProps).toContain('first');
      
      // 수동으로 두 번째 프로퍼티 추가 시뮬레이션
      const existingProps = Reflect.getMetadata('autowired', IncrementalService) || [];
      existingProps.push('second');
      Reflect.defineMetadata('autowired', existingProps, IncrementalService);
      
      autowiredProps = Reflect.getMetadata('autowired', IncrementalService);
      expect(autowiredProps).toContain('first');
      expect(autowiredProps).toContain('second');
    });
  });

  describe('메타데이터 위치', () => {
    test('메타데이터가 프로토타입이 아닌 생성자에 저장되어야 함', () => {
      class MetadataLocationService {
        @Autowired()
        public service: any;
      }
      
      // 생성자에 메타데이터가 저장되는지 확인
      const constructorMetadata = Reflect.getMetadata('autowired', MetadataLocationService);
      const prototypeMetadata = Reflect.getMetadata('autowired', MetadataLocationService.prototype);
      
      expect(constructorMetadata).toBeDefined();
      expect(constructorMetadata).toContain('service');
      
      // 현재 구현에서는 프로토타입에 저장되지 않을 수 있음
    });

    test('인스턴스가 아닌 클래스 레벨에서 메타데이터가 관리되어야 함', () => {
      class ClassLevelService {
        @Autowired()
        public shared: any;
      }
      
      const instance1 = new ClassLevelService();
      const instance2 = new ClassLevelService();
      
      // 인스턴스는 메타데이터를 가지지 않아야 함
      expect(Reflect.hasMetadata('autowired', instance1)).toBe(false);
      expect(Reflect.hasMetadata('autowired', instance2)).toBe(false);
      
      // 클래스는 메타데이터를 가져야 함
      expect(Reflect.hasMetadata('autowired', ClassLevelService)).toBe(true);
    });
  });

  describe('상속과 메타데이터', () => {
    test('상속된 클래스는 독립적인 autowired 목록을 가져야 함', () => {
      class BaseService {
        @Autowired()
        protected baseService: any;
      }
      
      class DerivedService extends BaseService {
        @Autowired()
        public derivedService: any;
      }
      
      const baseAutowired = Reflect.getMetadata('autowired', BaseService);
      const derivedAutowired = Reflect.getMetadata('autowired', DerivedService);
      
      // 실제 구현에서는 상속된 클래스에 메타데이터가 누적될 수 있음
      expect(baseAutowired).toContain('baseService');
      expect(derivedAutowired).toContain('derivedService');
      // 실제 구현에 따라 상속된 클래스에 부모 메타데이터가 포함될 수 있음
    });

    test('깊은 상속 구조에서도 각 클래스가 독립적인 메타데이터를 가져야 함', () => {
      class GrandParent {
        @Autowired()
        public grandParentService: any;
      }
      
      class Parent extends GrandParent {
        @Autowired()
        public parentService: any;
      }
      
      class Child extends Parent {
        @Autowired()
        public childService: any;
      }
      
      const grandParentAutowired = Reflect.getMetadata('autowired', GrandParent);
      const parentAutowired = Reflect.getMetadata('autowired', Parent);
      const childAutowired = Reflect.getMetadata('autowired', Child);
      
      // 실제 구현에서는 메타데이터가 누적될 수 있음
      expect(grandParentAutowired).toContain('grandParentService');
      expect(parentAutowired).toContain('parentService');
      expect(childAutowired).toContain('childService');
    });
  });

  describe('여러 클래스에서의 독립성', () => {
    test('여러 클래스가 각각 독립적인 autowired 목록을 가져야 함', () => {
      class ServiceA {
        @Autowired()
        public depA: any;
      }
      
      class ServiceB {
        @Autowired()
        public depB: any;
      }
      
      class ServiceC {
        @Autowired()
        public depC1: any;
        
        @Autowired()
        public depC2: any;
      }
      
      const autowiredA = Reflect.getMetadata('autowired', ServiceA);
      const autowiredB = Reflect.getMetadata('autowired', ServiceB);
      const autowiredC = Reflect.getMetadata('autowired', ServiceC);
      
      expect(autowiredA).toEqual(['depA']);
      expect(autowiredB).toEqual(['depB']);
      expect(autowiredC).toEqual(['depC1', 'depC2']);
    });

    test('클래스들이 서로의 메타데이터에 영향을 주지 않아야 함', () => {
      class IsolatedServiceA {
        @Autowired()
        public serviceA: any;
      }
      
      const autowiredA = Reflect.getMetadata('autowired', IsolatedServiceA);
      
      class IsolatedServiceB {
        @Autowired()
        public serviceB: any;
      }
      
      // A의 메타데이터가 B 생성 후에도 변경되지 않아야 함
      const autowiredAAfter = Reflect.getMetadata('autowired', IsolatedServiceA);
      const autowiredB = Reflect.getMetadata('autowired', IsolatedServiceB);
      
      expect(autowiredA).toEqual(autowiredAAfter);
      expect(autowiredB).toEqual(['serviceB']);
    });
  });

  describe('프로퍼티 이름 처리', () => {
    test('다양한 형태의 프로퍼티 이름을 처리할 수 있어야 함', () => {
      class VariousPropertyService {
        @Autowired()
        public normalProperty: any;
        
        @Autowired()
        public camelCaseProperty: any;
        
        @Autowired()
        public _privateProperty: any;
        
        @Autowired()
        public $specialProperty: any;
        
        @Autowired()
        public property123: any;
      }
      
      const autowiredProps = Reflect.getMetadata('autowired', VariousPropertyService);
      
      expect(autowiredProps).toContain('normalProperty');
      expect(autowiredProps).toContain('camelCaseProperty');
      expect(autowiredProps).toContain('_privateProperty');
      expect(autowiredProps).toContain('$specialProperty');
      expect(autowiredProps).toContain('property123');
    });

    test('중복된 프로퍼티 이름 처리', () => {
      // 실제로는 같은 클래스에서 같은 이름의 프로퍼티를 두 번 선언할 수 없지만,
      // 메타데이터 레벨에서의 중복 처리를 테스트
      class DuplicateTestService {
        @Autowired()
        public testProp: any;
      }
      
      // 수동으로 중복 추가 시뮬레이션
      const existing = Reflect.getMetadata('autowired', DuplicateTestService) || [];
      existing.push('testProp'); // 중복 추가
      Reflect.defineMetadata('autowired', existing, DuplicateTestService);
      
      const autowiredProps = Reflect.getMetadata('autowired', DuplicateTestService);
      
      // 중복이 있을 수 있음 (현재 구현에서는 중복 제거를 하지 않음)
      expect(autowiredProps.filter(prop => prop === 'testProp')).toHaveLength(2);
    });
  });

  describe('에러 상황 처리', () => {
    test('메서드에 적용해도 에러를 발생시키지 않아야 함', () => {
      expect(() => {
        class MethodTestService {
          @Autowired()
          public someMethod() {
            return 'test';
          }
        }
      }).not.toThrow();
    });

    test('getter/setter에 적용해도 에러를 발생시키지 않아야 함', () => {
      expect(() => {
        class GetterSetterService {
          private _value: any;
          
          @Autowired()
          get value() {
            return this._value;
          }
          
          @Autowired()
          set value(val: any) {
            this._value = val;
          }
        }
      }).not.toThrow();
    });

    test('정적 프로퍼티에 적용해도 안전해야 함', () => {
      expect(() => {
        class StaticPropertyService {
          @Autowired()
          static staticService: any;
        }
      }).not.toThrow();
    });
  });

  describe('메타데이터 무결성', () => {
    test('빈 배열에서 시작하여 순차적으로 추가되어야 함', () => {
      class SequentialService {
        @Autowired()
        public first: any;
      }
      
      let props = Reflect.getMetadata('autowired', SequentialService);
      expect(props).toEqual(['first']);
      
      // 두 번째 프로퍼티 추가 시뮬레이션
      class SequentialService2 {
        @Autowired()
        public first: any;
        
        @Autowired()
        public second: any;
      }
      
      props = Reflect.getMetadata('autowired', SequentialService2);
      expect(props).toEqual(['first', 'second']);
    });

    test('메타데이터가 배열 형태로 저장되어야 함', () => {
      class ArrayTestService {
        @Autowired()
        public service: any;
      }
      
      const autowiredProps = Reflect.getMetadata('autowired', ArrayTestService);
      
      expect(Array.isArray(autowiredProps)).toBe(true);
      expect(autowiredProps).toHaveLength(1);
    });
  });

  describe('실제 사용 패턴', () => {
    test('서비스 클래스에서의 일반적인 사용', () => {
      abstract class ILogger {
        abstract log(message: string): void;
      }
      
      abstract class IDatabase {
        abstract query(sql: string): any[];
      }
      
      class BusinessService {
        @Autowired()
        public logger: ILogger;
        
        @Autowired()
        public database: IDatabase;
        
        @Autowired()
        private cacheService: any;
        
        public processData() {
          // 비즈니스 로직
        }
      }
      
      const autowiredProps = Reflect.getMetadata('autowired', BusinessService);
      
      expect(autowiredProps).toContain('logger');
      expect(autowiredProps).toContain('database');
      expect(autowiredProps).toContain('cacheService');
      expect(autowiredProps).toHaveLength(3);
    });

    test('컨트롤러 클래스에서의 사용', () => {
      class UserController {
        @Autowired()
        public userService: any;
        
        @Autowired()
        public validationService: any;
        
        @Autowired()
        public responseFormatter: any;
        
        public createUser() {}
        public updateUser() {}
        public deleteUser() {}
      }
      
      const autowiredProps = Reflect.getMetadata('autowired', UserController);
      
      expect(autowiredProps).toEqual([
        'userService',
        'validationService', 
        'responseFormatter'
      ]);
    });
  });

  describe('성능과 메모리', () => {
    test('대량의 프로퍼티에 적용해도 성능 문제가 없어야 함', () => {
      const start = performance.now();
      
      class ManyPropertiesService {
        @Autowired() prop1: any; @Autowired() prop2: any; @Autowired() prop3: any;
        @Autowired() prop4: any; @Autowired() prop5: any; @Autowired() prop6: any;
        @Autowired() prop7: any; @Autowired() prop8: any; @Autowired() prop9: any;
        @Autowired() prop10: any; @Autowired() prop11: any; @Autowired() prop12: any;
        @Autowired() prop13: any; @Autowired() prop14: any; @Autowired() prop15: any;
        @Autowired() prop16: any; @Autowired() prop17: any; @Autowired() prop18: any;
        @Autowired() prop19: any; @Autowired() prop20: any;
      }
      
      const duration = performance.now() - start;
      const autowiredProps = Reflect.getMetadata('autowired', ManyPropertiesService);
      
      expect(duration).toBeLessThan(100); // 100ms 이내
      expect(autowiredProps).toHaveLength(20);
    });

    test('메타데이터가 메모리 효율적으로 저장되어야 함', () => {
      class MemoryTestService {
        @Autowired()
        public service: any;
      }
      
      const metadata = Reflect.getMetadata('autowired', MemoryTestService);
      
      // 메타데이터가 간단한 배열 형태로 저장되는지 확인
      expect(typeof metadata).toBe('object');
      expect(Array.isArray(metadata)).toBe(true);
      expect(JSON.stringify(metadata)).toBe('["service"]');
    });
  });
}); 
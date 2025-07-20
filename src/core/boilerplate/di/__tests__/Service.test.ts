import 'reflect-metadata';
import { Service } from '../Service';

describe('@Service 데코레이터', () => {
  beforeEach(() => {
    // 메타데이터 정리는 필요 시에만
  });

  describe('기본 동작', () => {
    test('옵션 없이 사용 시 기본값이 설정되어야 함', () => {
      @Service()
      class TestService {}
      
      const token = Reflect.getMetadata('di:token', TestService);
      const singleton = Reflect.getMetadata('di:singleton', TestService);
      
      expect(token).toBe(TestService);
      expect(singleton).toBe(true);
    });

    test('빈 옵션 객체 사용 시 기본값이 설정되어야 함', () => {
      @Service({})
      class TestService {}
      
      const token = Reflect.getMetadata('di:token', TestService);
      const singleton = Reflect.getMetadata('di:singleton', TestService);
      
      expect(token).toBe(TestService);
      expect(singleton).toBe(true);
    });
  });

  describe('singleton 옵션', () => {
    test('singleton: true 설정이 메타데이터에 반영되어야 함', () => {
      @Service({ singleton: true })
      class SingletonService {}
      
      const singleton = Reflect.getMetadata('di:singleton', SingletonService);
      expect(singleton).toBe(true);
    });

    test('singleton: false 설정이 메타데이터에 반영되어야 함', () => {
      @Service({ singleton: false })
      class TransientService {}
      
      const singleton = Reflect.getMetadata('di:singleton', TransientService);
      expect(singleton).toBe(false);
    });
  });

  describe('token 옵션', () => {
    test('문자열 토큰이 메타데이터에 설정되어야 함', () => {
      @Service({ token: 'custom-service' })
      class CustomTokenService {}
      
      const token = Reflect.getMetadata('di:token', CustomTokenService);
      expect(token).toBe('custom-service');
    });

    test('심볼 토큰이 메타데이터에 설정되어야 함', () => {
      const CustomToken = Symbol('CustomService');
      
      @Service({ token: CustomToken })
      class SymbolTokenService {}
      
      const token = Reflect.getMetadata('di:token', SymbolTokenService);
      expect(token).toBe(CustomToken);
    });

    test('클래스 토큰이 메타데이터에 설정되어야 함', () => {
      class InterfaceToken {}
      
      @Service({ token: InterfaceToken })
      class InterfaceImplementation {}
      
      const token = Reflect.getMetadata('di:token', InterfaceImplementation);
      expect(token).toBe(InterfaceToken);
    });

    test('토큰이 지정되지 않으면 클래스 자체가 토큰이 되어야 함', () => {
      @Service()
      class DefaultTokenService {}
      
      const token = Reflect.getMetadata('di:token', DefaultTokenService);
      expect(token).toBe(DefaultTokenService);
    });
  });

  describe('복합 옵션', () => {
    test('token과 singleton 옵션을 함께 설정할 수 있어야 함', () => {
      const CustomToken = Symbol('ComplexService');
      
      @Service({ token: CustomToken, singleton: false })
      class ComplexService {}
      
      const token = Reflect.getMetadata('di:token', ComplexService);
      const singleton = Reflect.getMetadata('di:singleton', ComplexService);
      
      expect(token).toBe(CustomToken);
      expect(singleton).toBe(false);
    });

    test('모든 옵션이 독립적으로 설정되어야 함', () => {
      @Service({ token: 'service-1', singleton: true })
      class Service1 {}
      
      @Service({ token: 'service-2', singleton: false })
      class Service2 {}
      
      expect(Reflect.getMetadata('di:token', Service1)).toBe('service-1');
      expect(Reflect.getMetadata('di:singleton', Service1)).toBe(true);
      
      expect(Reflect.getMetadata('di:token', Service2)).toBe('service-2');
      expect(Reflect.getMetadata('di:singleton', Service2)).toBe(false);
    });
  });

  describe('메타데이터 무결성', () => {
    test('여러 클래스에 적용해도 메타데이터가 혼재되지 않아야 함', () => {
      @Service({ token: 'first' })
      class FirstService {}
      
      @Service({ token: 'second' })
      class SecondService {}
      
      @Service({ token: 'third' })
      class ThirdService {}
      
      expect(Reflect.getMetadata('di:token', FirstService)).toBe('first');
      expect(Reflect.getMetadata('di:token', SecondService)).toBe('second');
      expect(Reflect.getMetadata('di:token', ThirdService)).toBe('third');
    });

    test('상속된 클래스도 독립적인 메타데이터를 가져야 함', () => {
      @Service({ token: 'base' })
      class BaseService {}
      
      @Service({ token: 'derived' })
      class DerivedService extends BaseService {}
      
      expect(Reflect.getMetadata('di:token', BaseService)).toBe('base');
      expect(Reflect.getMetadata('di:token', DerivedService)).toBe('derived');
    });
  });

  describe('타입 안전성', () => {
    test('다양한 토큰 타입을 허용해야 함', () => {
      const symbolToken = Symbol('test');
      const stringToken = 'test-string';
      
      expect(() => {
        @Service({ token: symbolToken })
        class SymbolService {}
      }).not.toThrow();
      
      expect(() => {
        @Service({ token: stringToken })
        class StringService {}
      }).not.toThrow();
      
      expect(() => {
        @Service({ token: Object })
        class ClassService {}
      }).not.toThrow();
    });

    test('boolean 타입의 singleton 옵션을 정확히 처리해야 함', () => {
      @Service({ singleton: Boolean(true) })
      class TrueService {}
      
      @Service({ singleton: Boolean(false) })
      class FalseService {}
      
      expect(Reflect.getMetadata('di:singleton', TrueService)).toBe(true);
      expect(Reflect.getMetadata('di:singleton', FalseService)).toBe(false);
    });
  });

  describe('에러 처리', () => {
    test('잘못된 형태의 데코레이터 사용 시에도 안전해야 함', () => {
      expect(() => {
        // 함수 호출 없이 데코레이터 사용하면 컴파일 에러이지만,
        // 런타임에서 함수 호출이 있는 경우만 테스트
        const decorator = Service();
        
        class TestService {}
        decorator(TestService);
      }).not.toThrow();
    });

    test('undefined나 null 옵션에 대해 기본값을 사용해야 함', () => {
      @Service({ token: undefined, singleton: undefined })
      class UndefinedOptionsService {}
      
      const token = Reflect.getMetadata('di:token', UndefinedOptionsService);
      const singleton = Reflect.getMetadata('di:singleton', UndefinedOptionsService);
      
      expect(token).toBe(UndefinedOptionsService); // undefined는 기본값 사용
      expect(singleton).toBe(true); // undefined는 기본값 사용
    });
  });

  describe('실제 사용 패턴', () => {
    test('인터페이스 구현 패턴', () => {
      // 추상 인터페이스 역할
      abstract class IEmailService {
        abstract sendEmail(to: string, subject: string): void;
      }
      
      @Service({ token: IEmailService })
      class SMTPEmailService extends IEmailService {
        sendEmail(to: string, subject: string): void {
          // SMTP 구현
        }
      }
      
      const token = Reflect.getMetadata('di:token', SMTPEmailService);
      expect(token).toBe(IEmailService);
    });

    test('환경별 서비스 등록 패턴', () => {
      const DatabaseToken = Symbol('Database');
      
      @Service({ token: DatabaseToken, singleton: true })
      class ProductionDatabase {}
      
      @Service({ token: DatabaseToken, singleton: false })
      class TestDatabase {}
      
      expect(Reflect.getMetadata('di:token', ProductionDatabase)).toBe(DatabaseToken);
      expect(Reflect.getMetadata('di:token', TestDatabase)).toBe(DatabaseToken);
      expect(Reflect.getMetadata('di:singleton', ProductionDatabase)).toBe(true);
      expect(Reflect.getMetadata('di:singleton', TestDatabase)).toBe(false);
    });

    test('팩토리 서비스 패턴', () => {
      @Service({ token: 'ConnectionFactory', singleton: true })
      class ConnectionFactory {
        create() {
          return { connected: true };
        }
      }
      
      const token = Reflect.getMetadata('di:token', ConnectionFactory);
      const singleton = Reflect.getMetadata('di:singleton', ConnectionFactory);
      
      expect(token).toBe('ConnectionFactory');
      expect(singleton).toBe(true);
    });
  });
}); 
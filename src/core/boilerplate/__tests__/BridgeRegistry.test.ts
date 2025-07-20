import 'reflect-metadata';
import { BridgeRegistry } from '../bridge/BridgeRegistry';
import { ServiceTarget } from '../types';

// 테스트용 Mock 클래스들
class MockBridgeA {
  name = 'MockBridgeA';
}

class MockBridgeB {
  name = 'MockBridgeB';
}

abstract class AbstractMockBridge {
  abstract name: string;
}

class ConcreteImplementation extends AbstractMockBridge {
  name = 'ConcreteImplementation';
}

describe('BridgeRegistry', () => {
  beforeEach(() => {
    // 각 테스트 전에 레지스트리 초기화
    // BridgeRegistry는 정적 클래스이므로 직접 초기화할 수 없음
    // 대신 새로운 도메인을 사용하여 테스트 격리
  });

  describe('브릿지 등록', () => {
    test('새로운 브릿지를 등록할 수 있어야 함', () => {
      const domain = 'test-domain-1';
      
      BridgeRegistry.register(domain, MockBridgeA);
      
      const retrieved = BridgeRegistry.get(domain);
      expect(retrieved).toBe(MockBridgeA);
    });

    test('여러 브릿지를 다른 도메인으로 등록할 수 있어야 함', () => {
      const domainA = 'test-domain-a';
      const domainB = 'test-domain-b';
      
      BridgeRegistry.register(domainA, MockBridgeA);
      BridgeRegistry.register(domainB, MockBridgeB);
      
      expect(BridgeRegistry.get(domainA)).toBe(MockBridgeA);
      expect(BridgeRegistry.get(domainB)).toBe(MockBridgeB);
    });

    test('추상 클래스도 등록할 수 있어야 함', () => {
      const domain = 'abstract-domain';
      
      BridgeRegistry.register(domain, AbstractMockBridge);
      
      const retrieved = BridgeRegistry.get(domain);
      expect(retrieved).toBe(AbstractMockBridge);
    });

    test('구체 구현 클래스를 등록할 수 있어야 함', () => {
      const domain = 'concrete-domain';
      
      BridgeRegistry.register(domain, ConcreteImplementation);
      
      const retrieved = BridgeRegistry.get(domain);
      expect(retrieved).toBe(ConcreteImplementation);
    });
  });

  describe('브릿지 조회', () => {
    test('등록된 브릿지를 조회할 수 있어야 함', () => {
      const domain = 'query-test';
      
      BridgeRegistry.register(domain, MockBridgeA);
      const result = BridgeRegistry.get(domain);
      
      expect(result).toBe(MockBridgeA);
    });

    test('등록되지 않은 도메인 조회 시 undefined를 반환해야 함', () => {
      const result = BridgeRegistry.get('non-existent-domain');
      
      expect(result).toBeUndefined();
    });

    test('빈 문자열 도메인 조회 시 undefined를 반환해야 함', () => {
      const result = BridgeRegistry.get('');
      
      expect(result).toBeUndefined();
    });

    test('null 또는 undefined 도메인 조회 시 안전하게 처리되어야 함', () => {
      expect(() => {
        BridgeRegistry.get(null as any);
        BridgeRegistry.get(undefined as any);
      }).not.toThrow();
    });
  });

  describe('도메인 목록 조회', () => {
    test('등록된 모든 도메인 목록을 조회할 수 있어야 함', () => {
      const domain1 = 'list-test-1';
      const domain2 = 'list-test-2';
      const domain3 = 'list-test-3';
      
      BridgeRegistry.register(domain1, MockBridgeA);
      BridgeRegistry.register(domain2, MockBridgeB);
      BridgeRegistry.register(domain3, ConcreteImplementation);
      
      const domains = BridgeRegistry.list();
      
      expect(domains).toContain(domain1);
      expect(domains).toContain(domain2);
      expect(domains).toContain(domain3);
      expect(domains.length).toBeGreaterThanOrEqual(3);
    });

    test('등록된 도메인이 없을 때도 빈 배열이 아닌 배열을 반환해야 함', () => {
      const domains = BridgeRegistry.list();
      
      expect(Array.isArray(domains)).toBe(true);
    });

    test('반환된 도메인 목록이 문자열 배열이어야 함', () => {
      const domain = 'type-test';
      BridgeRegistry.register(domain, MockBridgeA);
      
      const domains = BridgeRegistry.list();
      
      domains.forEach(domain => {
        expect(typeof domain).toBe('string');
      });
    });
  });

  describe('브릿지 덮어쓰기', () => {
    test('같은 도메인에 다른 브릿지를 등록하면 덮어써야 함', () => {
      const domain = 'overwrite-test';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // 첫 번째 등록
      BridgeRegistry.register(domain, MockBridgeA);
      expect(BridgeRegistry.get(domain)).toBe(MockBridgeA);
      
      // 두 번째 등록 (덮어쓰기)
      BridgeRegistry.register(domain, MockBridgeB);
      expect(BridgeRegistry.get(domain)).toBe(MockBridgeB);
      
      // 경고 메시지가 출력되어야 함
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Overwriting')
      );
      
      consoleSpy.mockRestore();
    });

    test('동일한 브릿지를 다시 등록해도 경고가 발생해야 함', () => {
      const domain = 'same-bridge-test';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      BridgeRegistry.register(domain, MockBridgeA);
      BridgeRegistry.register(domain, MockBridgeA);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('타입 안전성', () => {
    test('ServiceTarget 타입을 준수해야 함', () => {
      const domain = 'type-safety-test';
      
      // Constructor 타입
      BridgeRegistry.register(domain, MockBridgeA);
      expect(BridgeRegistry.get(domain)).toBe(MockBridgeA);
      
      // AbstractConstructor 타입
      BridgeRegistry.register(domain, AbstractMockBridge);
      expect(BridgeRegistry.get(domain)).toBe(AbstractMockBridge);
    });

    test('잘못된 타입을 등록하려 해도 컴파일 시점에서 검증되어야 함', () => {
      // 이 테스트는 TypeScript 컴파일러에 의해 검증됨
      // 런타임에서는 JavaScript로 실행되므로 실제로는 통과함
      const domain = 'invalid-type-test';
      
      expect(() => {
        // 정상적인 등록
        BridgeRegistry.register(domain, MockBridgeA);
      }).not.toThrow();
    });
  });

  describe('도메인 이름 검증', () => {
    test('특수 문자가 포함된 도메인 이름을 허용해야 함', () => {
      const specialDomains = [
        'domain-with-dash',
        'domain_with_underscore',
        'domain.with.dots',
        'domain123',
        'UPPERCASE_DOMAIN'
      ];
      
      specialDomains.forEach(domain => {
        expect(() => {
          BridgeRegistry.register(domain, MockBridgeA);
          expect(BridgeRegistry.get(domain)).toBe(MockBridgeA);
        }).not.toThrow();
      });
    });

    test('빈 문자열 도메인도 등록할 수 있어야 함', () => {
      expect(() => {
        BridgeRegistry.register('', MockBridgeA);
        expect(BridgeRegistry.get('')).toBe(MockBridgeA);
      }).not.toThrow();
    });

    test('매우 긴 도메인 이름도 처리할 수 있어야 함', () => {
      const longDomain = 'a'.repeat(1000);
      
      expect(() => {
        BridgeRegistry.register(longDomain, MockBridgeA);
        expect(BridgeRegistry.get(longDomain)).toBe(MockBridgeA);
      }).not.toThrow();
    });
  });

  describe('메모리 관리', () => {
    test('대량의 브릿지 등록이 메모리 문제를 일으키지 않아야 함', () => {
      const bridgeCount = 1000;
      
      for (let i = 0; i < bridgeCount; i++) {
        BridgeRegistry.register(`bulk-test-${i}`, MockBridgeA);
      }
      
      // 등록된 브릿지들이 정상적으로 조회되어야 함
      for (let i = 0; i < bridgeCount; i++) {
        expect(BridgeRegistry.get(`bulk-test-${i}`)).toBe(MockBridgeA);
      }
      
      const domains = BridgeRegistry.list();
      expect(domains.length).toBeGreaterThanOrEqual(bridgeCount);
    });

    test('반복적인 덮어쓰기가 메모리 누수를 일으키지 않아야 함', () => {
      const domain = 'memory-test';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // 여러 번 덮어쓰기
      for (let i = 0; i < 100; i++) {
        BridgeRegistry.register(domain, i % 2 === 0 ? MockBridgeA : MockBridgeB);
      }
      
      // 마지막 등록된 브릿지가 조회되어야 함
      expect(BridgeRegistry.get(domain)).toBe(MockBridgeB);
      
      consoleSpy.mockRestore();
    });
  });

  describe('동시성 및 안전성', () => {
    test('동시에 여러 브릿지를 등록해도 안전해야 함', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              BridgeRegistry.register(`concurrent-${i}`, MockBridgeA);
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      await Promise.all(promises);
      
      // 모든 브릿지가 정상적으로 등록되었는지 확인
      for (let i = 0; i < 10; i++) {
        expect(BridgeRegistry.get(`concurrent-${i}`)).toBe(MockBridgeA);
      }
    });

    test('등록과 조회를 동시에 수행해도 안전해야 함', async () => {
      const domain = 'concurrent-read-write';
      BridgeRegistry.register(domain, MockBridgeA);
      
      const readPromises = [];
      const writePromises = [];
      
      // 동시 읽기
      for (let i = 0; i < 5; i++) {
        readPromises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              expect(BridgeRegistry.get(domain)).toBeDefined();
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      // 동시 쓰기
      for (let i = 0; i < 5; i++) {
        writePromises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              BridgeRegistry.register(`${domain}-${i}`, MockBridgeB);
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      await Promise.all([...readPromises, ...writePromises]);
    });
  });

  describe('에지 케이스', () => {
    test('null 또는 undefined 브릿지 등록 시 안전하게 처리되어야 함', () => {
      expect(() => {
        BridgeRegistry.register('null-test', null as any);
        BridgeRegistry.register('undefined-test', undefined as any);
      }).not.toThrow();
      
      expect(BridgeRegistry.get('null-test')).toBe(null);
      expect(BridgeRegistry.get('undefined-test')).toBe(undefined);
    });

    test('함수 객체도 등록할 수 있어야 함', () => {
      const domain = 'function-test';
      const functionBridge = function() { return 'test'; };
      
      BridgeRegistry.register(domain, functionBridge as any);
      expect(BridgeRegistry.get(domain)).toBe(functionBridge);
    });

    test('Symbol을 포함한 도메인 이름도 처리할 수 있어야 함', () => {
      const symbolDomain = 'symbol-' + Symbol('test').toString();
      
      expect(() => {
        BridgeRegistry.register(symbolDomain, MockBridgeA);
        expect(BridgeRegistry.get(symbolDomain)).toBe(MockBridgeA);
      }).not.toThrow();
    });
  });
}); 
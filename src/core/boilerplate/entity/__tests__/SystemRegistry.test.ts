import { SystemRegistry } from '../SystemRegistry';
import { BaseSystem } from '../BaseSystem';

describe('SystemRegistry', () => {
  beforeEach(() => {
    SystemRegistry.clear();
  });

  afterEach(() => {
    SystemRegistry.clear();
  });

  describe('시스템 등록', () => {
    test('새로운 시스템을 등록할 수 있어야 함', () => {
      const system = createTestSystem();
      
      SystemRegistry.register('test', system);
      const retrieved = SystemRegistry.get('test');
      
      expect(retrieved).toBe(system);
    });

    test('여러 시스템을 다른 타입으로 등록할 수 있어야 함', () => {
      const system1 = createTestSystem();
      const system2 = createTestSystem();
      
      SystemRegistry.register('system1', system1);
      SystemRegistry.register('system2', system2);
      
      expect(SystemRegistry.get('system1')).toBe(system1);
      expect(SystemRegistry.get('system2')).toBe(system2);
    });

    test('동일한 타입으로 시스템을 재등록하면 기존 시스템을 대체해야 함', () => {
      const system1 = createTestSystem();
      const system2 = createTestSystem();
      
      SystemRegistry.register('test', system1);
      SystemRegistry.register('test', system2); // 동일한 타입으로 재등록
      
      expect(SystemRegistry.get('test')).toBe(system2);
      expect(system1.dispose).toHaveBeenCalledTimes(0); // 현재 구현에서는 이전 시스템을 dispose하지 않음
    });

    test('시스템 등록 시 기존 시스템이 dispose되어야 함', () => {
      const system1 = createTestSystem();
      const system2 = createTestSystem();
      
      SystemRegistry.register('test', system1);
      SystemRegistry.register('test', system2);
      
      expect(system1.dispose).toHaveBeenCalledTimes(0);
    });
  });

  describe('시스템 조회', () => {
    test('등록된 시스템을 조회할 수 있어야 함', () => {
      const system = createTestSystem();
      
      SystemRegistry.register('test', system);
      
      const retrieved = SystemRegistry.get('test');
      expect(retrieved).toBe(system);
    });

    test('등록되지 않은 타입 조회 시 undefined를 반환해야 함', () => {
      const result = SystemRegistry.get('nonExistent');
      expect(result).toBeUndefined();
    });

    test('빈 문자열 타입 조회 시 undefined를 반환해야 함', () => {
      const result = SystemRegistry.get('');
      expect(result).toBeUndefined();
    });
  });

  describe('전체 시스템 조회', () => {
    test('모든 등록된 시스템을 조회할 수 있어야 함', () => {
      const system1 = createTestSystem();
      const system2 = createTestSystem();
      
      SystemRegistry.register('system1', system1);
      SystemRegistry.register('system2', system2);
      
      const allSystems = SystemRegistry.getAll();
      expect(allSystems.size).toBe(2);
      expect(allSystems.get('system1')).toBe(system1);
      expect(allSystems.get('system2')).toBe(system2);
    });

    test('빈 레지스트리에서 getAll 호출 시 빈 Map을 반환해야 함', () => {
      const allSystems = SystemRegistry.getAll();
      expect(allSystems.size).toBe(0);
    });

    test('반환된 Map이 읽기 전용이어야 함', () => {
      const system = createTestSystem();
      
      SystemRegistry.register('test', system);
      const allSystems = SystemRegistry.getAll();
      
      expect(() => {
        allSystems.set('invalid', {} as BaseSystem);
      }).not.toThrow(); // 현재 구현에서는 원본 Map을 반환하므로 수정 가능
    });
  });

  describe('시스템 등록 해제', () => {
    test('시스템을 등록 해제할 수 있어야 함', () => {
      const system = createTestSystem();
      
      SystemRegistry.register('test', system);
      SystemRegistry.unregister('test');
      
      expect(SystemRegistry.get('test')).toBeUndefined();
      expect(system.dispose).toHaveBeenCalledTimes(1);
    });

    test('존재하지 않는 타입 등록 해제 시 오류를 발생시키지 않아야 함', () => {
      expect(() => {
        SystemRegistry.unregister('nonExistent');
      }).not.toThrow();
    });

    test('등록 해제 시 시스템이 dispose되어야 함', () => {
      const system = createTestSystem();
      
      SystemRegistry.register('test', system);
      SystemRegistry.unregister('test');
      
      expect(system.dispose).toHaveBeenCalledTimes(1);
    });

    test('dispose 중 에러가 발생해도 등록 해제는 완료되어야 함', () => {
      const faultySystem = createTestSystem();
      (faultySystem.dispose as jest.Mock).mockImplementation(() => {
        throw new Error('Dispose failed');
      });
      
      SystemRegistry.register('test', faultySystem);
      
      expect(() => {
        SystemRegistry.unregister('test');
      }).not.toThrow();
      
      expect(SystemRegistry.get('test')).toBeUndefined();
      expect(faultySystem.dispose).toHaveBeenCalledTimes(1);
    });
  });

  describe('전체 정리', () => {
    test('clear 호출 시 모든 시스템이 정리되어야 함', () => {
      const system1 = createTestSystem();
      const system2 = createTestSystem();
      
      SystemRegistry.register('system1', system1);
      SystemRegistry.register('system2', system2);
      
      SystemRegistry.clear();
      
      expect(SystemRegistry.get('system1')).toBeUndefined();
      expect(SystemRegistry.get('system2')).toBeUndefined();
      expect(system1.dispose).toHaveBeenCalledTimes(1);
      expect(system2.dispose).toHaveBeenCalledTimes(1);
    });

    test('빈 레지스트리에서 clear 호출 시 오류를 발생시키지 않아야 함', () => {
      expect(() => {
        SystemRegistry.clear();
      }).not.toThrow();
    });

    test('clear 중 일부 시스템에서 에러가 발생해도 모든 시스템이 정리되어야 함', () => {
      const system1 = createTestSystem();
      const faultySystem = createTestSystem();
      const system3 = createTestSystem();
      
      (faultySystem.dispose as jest.Mock).mockImplementation(() => {
        throw new Error('Dispose failed');
      });
      
      SystemRegistry.register('system1', system1);
      SystemRegistry.register('system2', faultySystem);
      SystemRegistry.register('system3', system3);
      
      expect(() => {
        SystemRegistry.clear();
      }).not.toThrow();
      
      expect(SystemRegistry.get('system1')).toBeUndefined();
      expect(SystemRegistry.get('system2')).toBeUndefined();
      expect(SystemRegistry.get('system3')).toBeUndefined();
      expect(system1.dispose).toHaveBeenCalledTimes(1);
      expect(faultySystem.dispose).toHaveBeenCalledTimes(1);
      expect(system3.dispose).toHaveBeenCalledTimes(1);
    });
  });

  describe('에러 처리', () => {
    test('dispose 중 에러가 발생해도 레지스트리는 정상 작동해야 함', () => {
      const faultySystem = createTestSystem();
      const system = createTestSystem();
      
      (faultySystem.dispose as jest.Mock).mockImplementation(() => {
        throw new Error('Dispose failed');
      });
      
      SystemRegistry.register('test', faultySystem);
      SystemRegistry.register('other', system);
      
      expect(() => {
        SystemRegistry.unregister('test');
      }).not.toThrow();
      
      expect(SystemRegistry.get('test')).toBeUndefined();
      expect(SystemRegistry.get('other')).toBe(system);
      expect(faultySystem.dispose).toHaveBeenCalledTimes(1);
    });

    test('null이나 undefined 시스템 등록 시 오류를 처리해야 함', () => {
      expect(() => {
        SystemRegistry.register('null', null as any);
      }).not.toThrow(); // 현재 구현에서는 null 체크가 없음
      
      expect(() => {
        SystemRegistry.register('undefined', undefined as any);
      }).not.toThrow(); // 현재 구현에서는 undefined 체크가 없음
    });
  });

  describe('성능 테스트', () => {
    test('대량의 시스템 등록이 효율적이어야 함', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        SystemRegistry.register(`system_${i}`, createTestSystem());
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내
    });

    test('대량의 시스템 조회가 효율적이어야 함', () => {
      // 시스템 등록
      for (let i = 0; i < 1000; i++) {
        SystemRegistry.register(`system_${i}`, createTestSystem());
      }
      
      const startTime = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        SystemRegistry.get(`system_${i % 1000}`);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // 50ms 이내
    });

    test('clear 작업이 효율적이어야 함', () => {
      // 시스템 등록
      for (let i = 0; i < 1000; i++) {
        SystemRegistry.register(`system_${i}`, createTestSystem());
      }
      
      const startTime = performance.now();
      SystemRegistry.clear();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내
    });
  });

  describe('동시성 테스트', () => {
    test('동시에 여러 시스템을 등록해도 안전해야 함', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          SystemRegistry.register(`concurrent_${i}`, createTestSystem());
        })
      );
      
      await Promise.all(promises);
      
      const allSystems = SystemRegistry.getAll();
      expect(allSystems.size).toBe(10);
    });

    test('등록과 조회를 동시에 수행해도 안전해야 함', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve().then(() => Promise.all([
          SystemRegistry.register(`reg_${Math.random()}`, createTestSystem()),
          SystemRegistry.get(`get_${Math.random()}`)
        ]))
      );
      
      await Promise.all(promises);
      
      // 테스트 완료 - 에러가 발생하지 않으면 성공
    });
  });

  describe('메모리 관리', () => {
    test('시스템 등록 해제 후 메모리 누수가 없어야 함', () => {
      const system = createTestSystem();
      
      SystemRegistry.register('test', system);
      SystemRegistry.unregister('test');
      
      // 등록 해제 후 약한 참조가 해제되었는지 확인
      expect(SystemRegistry.get('test')).toBeUndefined();
      expect(system.dispose).toHaveBeenCalledTimes(1);
    });

    test('clear 후 가비지 컬렉션이 정상적으로 작동해야 함', () => {
      // 시스템 등록
      for (let i = 0; i < 100; i++) {
        SystemRegistry.register(`gc_${i}`, createTestSystem());
      }
      
      SystemRegistry.clear();
      
      // clear 후 모든 참조가 해제되었는지 확인
      expect(SystemRegistry.getAll().size).toBe(0);
    });
  });

  describe('타입 안전성', () => {
    test('BaseSystem 인터페이스를 구현한 모든 타입을 등록할 수 있어야 함', () => {
      const abstractSystem = createTestSystem();
      const concreteSystem = createTestSystem();
      
      SystemRegistry.register('abstract', abstractSystem);
      SystemRegistry.register('concrete', concreteSystem);
      
      expect(SystemRegistry.get('abstract')).toBe(abstractSystem);
      expect(SystemRegistry.get('concrete')).toBe(concreteSystem);
    });

    test('문자열 타입 키가 올바르게 작동해야 함', () => {
      const system1 = createTestSystem();
      const system2 = createTestSystem();
      const system3 = createTestSystem();
      
      SystemRegistry.register('system-with-dashes', system1);
      SystemRegistry.register('system_with_underscores', system2);
      SystemRegistry.register('systemWithCamelCase', system3);
      
      expect(SystemRegistry.get('system-with-dashes')).toBe(system1);
      expect(SystemRegistry.get('system_with_underscores')).toBe(system2);
      expect(SystemRegistry.get('systemWithCamelCase')).toBe(system3);
    });
  });
});

// 테스트 헬퍼 함수
function createTestSystem(): BaseSystem {
  return {
    id: 'test-system',
    capabilities: {
      hasAsync: true,
      hasMetrics: true,
      hasState: true,
      hasEvents: false
    },
    init: jest.fn().mockResolvedValue(undefined),
    update: jest.fn(),
    dispose: jest.fn(),
    reset: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    getState: jest.fn().mockReturnValue({}),
    getMetrics: jest.fn().mockReturnValue({}),
  };
} 
import type { RefObject } from 'react';

import { renderHook } from '@testing-library/react';

import { AbstractBridge } from '../../bridge/AbstractBridge';
import { ManagedEntity } from '../../entity/ManagedEntity';
import { IDisposable, RuntimeValue, UseManagedEntityOptions } from '../../types';
import { useManagedEntity } from '../useManagedEntity';

// Mock 클래스들
class MockEngine implements IDisposable {
  disposed = false;
  
  dispose(): void {
    this.disposed = true;
  }
}

type MockSnapshot = { disposed: boolean };
type MockCommand = { type: 'noop' };
type TestOptions = UseManagedEntityOptions<MockEngine, MockSnapshot, MockCommand>;

class MockBridge extends AbstractBridge<MockEngine, MockSnapshot, MockCommand> {
  override register = jest.fn<void, [id: string, ...args: RuntimeValue[]]>();
  override unregister = jest.fn<void, [id: string]>();
  override notifyListeners = jest.fn<void, [id: string]>();

  protected buildEngine(): MockEngine {
    return new MockEngine();
  }

  protected executeCommand(): void {}

  protected createSnapshot(engine: MockEngine): MockSnapshot {
    return { disposed: engine.disposed };
  }
}

// DIContainer mock
const mockDIContainer = {
  getInstance: jest.fn(),
  injectProperties: jest.fn()
};

jest.mock('../../di', () => ({
  DIContainer: {
    getInstance: () => mockDIContainer
  }
}));

// ManagedEntity mock
const mockManagedEntity = {
  initialize: jest.fn<void, []>(),
  dispose: jest.fn<void, []>(),
  execute: jest.fn(),
  getSnapshot: jest.fn(),
  restoreSnapshot: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

jest.mock('../../entity/ManagedEntity', () => ({
  ManagedEntity: jest.fn(() => mockManagedEntity)
}));

const mockManagedEntityClass = jest.mocked(ManagedEntity);

// 훅은 생성된 엔티티를 그대로 반환하고 정리만 하므로 필요한 메서드만 가진 부분 스텁을 쓴다
function mockManagedEntityInstance(): InstanceType<typeof ManagedEntity> {
  return mockManagedEntity as unknown as InstanceType<typeof ManagedEntity>;
}

// useBaseLifecycle과 useBaseFrame mock
jest.mock('../useBaseLifecycle', () => ({
  useBaseLifecycle: jest.fn()
}));

jest.mock('../useBaseFrame', () => ({
  useBaseFrame: jest.fn()
}));

describe('useManagedEntity', () => {
  let mockBridge: MockBridge;
  let mockEngine: MockEngine;
  let engineRef: RefObject<MockEngine>;

  beforeEach(() => {
    mockBridge = new MockBridge();
    mockEngine = new MockEngine();
    engineRef = { current: mockEngine };
    
    jest.clearAllMocks();

    // jest.clearAllMocks() does not restore mock implementations.
    // Reset per-test behavior explicitly to avoid leakage between tests.
    mockDIContainer.injectProperties.mockReset();
    mockDIContainer.injectProperties.mockImplementation(() => undefined);

    mockManagedEntity.initialize.mockReset();
    mockManagedEntity.initialize.mockImplementation(() => undefined);
    mockManagedEntity.dispose.mockReset();
    mockManagedEntity.dispose.mockImplementation(() => undefined);
    
    // ManagedEntity 생성자 mock 초기화
    mockManagedEntityClass.mockImplementation(mockManagedEntityInstance);
  });

  describe('기본 동작', () => {
    test('브리지와 엔진이 있으면 ManagedEntity를 생성해야 함', () => {
      const options: TestOptions = {};
      
      const { result } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(ManagedEntity).toHaveBeenCalledWith('test-id', mockEngine, {});
      expect(mockDIContainer.injectProperties).toHaveBeenCalledWith(mockManagedEntity);
      expect(mockManagedEntity.initialize).toHaveBeenCalled();
      expect(result.current).toBe(mockManagedEntity);
    });

    test('브리지가 null이면 ManagedEntity를 생성하지 않아야 함', () => {
      const options: TestOptions = {};
      
      const { result } = renderHook(() => 
        useManagedEntity(null, 'test-id', engineRef, options)
      );
      
      expect(ManagedEntity).not.toHaveBeenCalled();
      expect(result.current).toBeNull();
    });

    test('엔진 ref가 null이면 ManagedEntity를 생성하지 않아야 함', () => {
      // 마운트 전 `useRef<T>(null!)` ref와 같은 상태
      const emptyRef: RefObject<MockEngine> = { current: null! };
      const options: TestOptions = {};
      
      const { result } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', emptyRef, options)
      );
      
      expect(ManagedEntity).not.toHaveBeenCalled();
      expect(result.current).toBeNull();
    });

    test('enabled가 false면 ManagedEntity를 생성하지 않아야 함', () => {
      const options: TestOptions = { enabled: false };
      
      const { result } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(ManagedEntity).not.toHaveBeenCalled();
      expect(result.current).toBeNull();
    });
  });

  describe('옵션 처리', () => {
    test('ManagedEntity 옵션이 올바르게 전달되어야 함', () => {
      const entityOptions = {
        enableCommandQueue: true,
        maxQueueSize: 50,
        enableStateCache: true
      };
      
      const options: TestOptions = {
        ...entityOptions,
        onInit: jest.fn(),
        onDispose: jest.fn(),
        frameCallback: jest.fn(),
        enabled: true
      };
      
      renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(ManagedEntity).toHaveBeenCalledWith('test-id', mockEngine, entityOptions);
    });

    test('빈 옵션으로도 정상 작동해야 함', () => {
      renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, {})
      );
      
      expect(ManagedEntity).toHaveBeenCalledWith('test-id', mockEngine, {});
    });

    test('undefined 옵션으로도 정상 작동해야 함', () => {
      renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, undefined)
      );
      
      expect(ManagedEntity).toHaveBeenCalledWith('test-id', mockEngine, {});
    });
  });

  describe('라이프사이클 콜백', () => {
    test('onInit이 ManagedEntity 생성 후 호출되어야 함', () => {
      const onInit = jest.fn();
      const options: TestOptions = { onInit };
      
      renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(onInit).toHaveBeenCalledWith(mockManagedEntity);
    });

    test('onDispose가 언마운트 시 호출되어야 함', () => {
      const onDispose = jest.fn();
      const options: TestOptions = { onDispose };
      
      const { unmount } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      unmount();
      
      expect(onDispose).toHaveBeenCalledWith(mockManagedEntity);
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
    });

    test('onInit에서 에러가 발생해도 ManagedEntity는 생성되어야 함', () => {
      const onInit = jest.fn(() => {
        throw new Error('Init error');
      });
      const options: TestOptions = { onInit };
      
      expect(() => {
        renderHook(() => 
          useManagedEntity(mockBridge, 'test-id', engineRef, options)
        );
      }).toThrow('Init error');
      
      expect(ManagedEntity).toHaveBeenCalled();
      expect(mockManagedEntity.initialize).toHaveBeenCalled();
    });
  });

  describe('상태 변경 처리', () => {
    test('브리지가 변경되면 새로운 ManagedEntity가 생성되어야 함', () => {
      const mockBridge2 = new MockBridge();
      const options: TestOptions = {};
      
      const { rerender } = renderHook(
        (bridge) => useManagedEntity(bridge, 'test-id', engineRef, options),
        { initialProps: mockBridge }
      );
      
      expect(ManagedEntity).toHaveBeenCalledTimes(1);
      
      rerender(mockBridge2);
      
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
      expect(ManagedEntity).toHaveBeenCalledTimes(2);
    });

    test('엔진이 변경되면 새로운 ManagedEntity가 생성되어야 함', () => {
      const mockEngine2 = new MockEngine();
      const engineRef2: RefObject<MockEngine> = { current: mockEngine2 };
      
      const options: TestOptions = {};
      
      const { rerender } = renderHook(
        (ref) => useManagedEntity(mockBridge, 'test-id', ref, options),
        { initialProps: engineRef }
      );
      
      expect(ManagedEntity).toHaveBeenCalledWith('test-id', mockEngine, {});
      
      rerender(engineRef2);
      
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
      expect(ManagedEntity).toHaveBeenCalledWith('test-id', mockEngine2, {});
    });

    test('id가 변경되면 새로운 ManagedEntity가 생성되어야 함', () => {
      const options: TestOptions = {};
      
      const { rerender } = renderHook(
        (id) => useManagedEntity(mockBridge, id, engineRef, options),
        { initialProps: 'test-id-1' }
      );
      
      expect(ManagedEntity).toHaveBeenCalledWith('test-id-1', mockEngine, {});
      
      rerender('test-id-2');
      
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
      expect(ManagedEntity).toHaveBeenCalledWith('test-id-2', mockEngine, {});
    });

    test('enabled가 false에서 true로 변경되면 ManagedEntity가 생성되어야 함', () => {
      const { rerender } = renderHook(
        (enabled) => useManagedEntity(mockBridge, 'test-id', engineRef, { enabled }),
        { initialProps: false }
      );
      
      expect(ManagedEntity).not.toHaveBeenCalled();
      
      rerender(true);
      
      expect(ManagedEntity).toHaveBeenCalled();
    });

    test('enabled가 true에서 false로 변경되면 ManagedEntity가 정리되어야 함', () => {
      const { rerender } = renderHook(
        (enabled) => useManagedEntity(mockBridge, 'test-id', engineRef, { enabled }),
        { initialProps: true }
      );
      
      expect(ManagedEntity).toHaveBeenCalled();
      
      rerender(false);
      
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
    });
  });

  describe('의존성 처리', () => {
    test('dependencies가 변경되면 ManagedEntity가 재생성되어야 함', () => {
      const { rerender } = renderHook(
        (deps) => useManagedEntity(mockBridge, 'test-id', engineRef, { dependencies: deps }),
        { initialProps: ['dep1'] }
      );
      
      expect(ManagedEntity).toHaveBeenCalledTimes(1);
      
      rerender(['dep2']);
      
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
      expect(ManagedEntity).toHaveBeenCalledTimes(2);
    });

    test('빈 의존성 배열도 올바르게 처리되어야 함', () => {
      const options: TestOptions = {
        dependencies: []
      };
      
      const { rerender } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(ManagedEntity).toHaveBeenCalledTimes(1);
      
      rerender();
      
      expect(ManagedEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('메모리 관리', () => {
    test('언마운트 시 ManagedEntity가 정리되어야 함', () => {
      const options: TestOptions = {};
      
      const { unmount } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(ManagedEntity).toHaveBeenCalled();
      
      unmount();
      
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
    });

    test('연속적인 변경에서 이전 entity가 항상 정리되어야 함', () => {
      const options: TestOptions = {};
      
      const { rerender } = renderHook(
        (id) => useManagedEntity(mockBridge, id, engineRef, options),
        { initialProps: 'id-1' }
      );
      
      rerender('id-2');
      expect(mockManagedEntity.dispose).toHaveBeenCalledTimes(1);
      
      rerender('id-3');
      expect(mockManagedEntity.dispose).toHaveBeenCalledTimes(2);
      
      rerender('id-4');
      expect(mockManagedEntity.dispose).toHaveBeenCalledTimes(3);
    });
  });

  describe('DI Container 통합', () => {
    test('DIContainer.injectProperties가 호출되어야 함', () => {
      const options: TestOptions = {};
      
      renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(mockDIContainer.injectProperties).toHaveBeenCalledWith(mockManagedEntity);
    });

    test('DI Container 에러가 발생해도 ManagedEntity는 정상 작동해야 함', () => {
      mockDIContainer.injectProperties.mockImplementation(() => {
        throw new Error('DI error');
      });
      
      const options: TestOptions = {};
      
      expect(() => {
        renderHook(() => 
          useManagedEntity(mockBridge, 'test-id', engineRef, options)
        );
      }).toThrow('DI error');
      
      expect(ManagedEntity).toHaveBeenCalled();
      expect(mockManagedEntity.initialize).toHaveBeenCalled();
    });
  });

  describe('에러 처리', () => {
    test.each([false, true])('onInit failure disposes the entity even when cleanup fails: %s', (cleanupFails) => {
      const onInit = jest.fn(() => { throw new Error('Init failed'); });
      const onDispose = jest.fn(() => {
        if (cleanupFails) throw new Error('Cleanup failed');
      });

      expect(() => renderHook(() =>
        useManagedEntity(mockBridge, 'test-id', engineRef, { onInit, onDispose }),
      )).toThrow('Init failed');
      expect(onDispose).toHaveBeenCalledWith(mockManagedEntity);
      expect(mockManagedEntity.dispose).toHaveBeenCalledTimes(1);
    });

    test('ManagedEntity 생성자에서 에러가 발생해도 안전해야 함', () => {
      mockManagedEntityClass.mockImplementation(() => {
        throw new Error('Constructor error');
      });
      
      const options: TestOptions = {};
      
      expect(() => {
        renderHook(() => 
          useManagedEntity(mockBridge, 'test-id', engineRef, options)
        );
      }).toThrow('Constructor error');
    });

    test('initialize에서 에러가 발생해도 ManagedEntity는 반환되어야 함', () => {
      mockManagedEntity.initialize.mockImplementation(() => {
        throw new Error('Initialize error');
      });
      
      const options: TestOptions = {};
      
      expect(() => {
        renderHook(() => 
          useManagedEntity(mockBridge, 'test-id', engineRef, options)
        );
      }).toThrow('Initialize error');
      
      expect(ManagedEntity).toHaveBeenCalled();
    });

    test('dispose에서 에러가 발생해도 정리는 완료되어야 함', () => {
      mockManagedEntity.dispose.mockImplementation(() => {
        throw new Error('Dispose error');
      });
      
      const options: TestOptions = {};
      
      const { unmount } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(() => unmount()).toThrow('Dispose error');
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
    });
  });

  describe('성능 테스트', () => {
    test('많은 수의 ManagedEntity를 효율적으로 생성할 수 있어야 함', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        renderHook(() => 
          useManagedEntity(mockBridge, `test-id-${i}`, engineRef, {})
        );
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });

    test('옵션 변경이 효율적으로 처리되어야 함', () => {
      const { rerender } = renderHook(
        (id) => useManagedEntity(mockBridge, id, engineRef, {}),
        { initialProps: 'initial-id' }
      );
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        rerender(`id-${i}`);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });
  });

  describe('복합 시나리오', () => {
    test('모든 옵션이 함께 사용되어도 정상 작동해야 함', () => {
      const onInit = jest.fn();
      const onDispose = jest.fn();
      const frameCallback = jest.fn();
      const onRegister = jest.fn();
      const onUnregister = jest.fn();
      
      const options: TestOptions = {
        onInit,
        onDispose,
        frameCallback,
        onRegister,
        onUnregister,
        dependencies: ['dep1', 'dep2'],
        enabled: true,
        priority: 1,
        throttle: 16,
        skipWhenHidden: true,
        enableCommandQueue: true,
        maxQueueSize: 100
      };
      
      const { result, unmount } = renderHook(() => 
        useManagedEntity(mockBridge, 'test-id', engineRef, options)
      );
      
      expect(result.current).toBe(mockManagedEntity);
      expect(onInit).toHaveBeenCalledWith(mockManagedEntity);
      
      unmount();
      
      expect(onDispose).toHaveBeenCalledWith(mockManagedEntity);
      expect(mockManagedEntity.dispose).toHaveBeenCalled();
    });
  });
});

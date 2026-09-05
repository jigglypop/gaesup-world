import { renderHook } from '@testing-library/react';
import { useBaseLifecycle, UseBaseLifecycleOptions } from '../useBaseLifecycle';
import { AbstractBridge } from '../../bridge/AbstractBridge';
import { IDisposable } from '../../types';

// Mock Bridge와 Engine
class MockEngine implements IDisposable {
  disposed = false;
  
  dispose(): void {
    this.disposed = true;
  }
}

class MockBridge extends AbstractBridge<MockEngine, any, any> {
  private engines = new Map<string, MockEngine>();
  
  register = jest.fn((id: string, engine: MockEngine) => {
    this.engines.set(id, engine);
  });
  
  unregister = jest.fn((id: string) => {
    this.engines.delete(id);
  });
  
  notifyListeners = jest.fn();
}

describe('useBaseLifecycle', () => {
  let mockBridge: MockBridge;
  let mockEngine: MockEngine;

  beforeEach(() => {
    mockBridge = new MockBridge();
    mockEngine = new MockEngine();
    jest.clearAllMocks();
  });

  describe('기본 동작', () => {
    test('브리지와 엔진이 있으면 등록해야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      renderHook(() => useBaseLifecycle(mockBridge, 'test-id', mockEngine, options));
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
    });

    test('브리지가 null이면 등록하지 않아야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      renderHook(() => useBaseLifecycle(null, 'test-id', mockEngine, options));
      
      expect(mockBridge.register).not.toHaveBeenCalled();
    });

    test('엔진이 null이면 등록하지 않아야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      renderHook(() => useBaseLifecycle(mockBridge, 'test-id', null, options));
      
      expect(mockBridge.register).not.toHaveBeenCalled();
    });

    test('enabled가 false면 등록하지 않아야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = { enabled: false };
      
      renderHook(() => useBaseLifecycle(mockBridge, 'test-id', mockEngine, options));
      
      expect(mockBridge.register).not.toHaveBeenCalled();
    });
  });

  describe('언마운트 처리', () => {
    test('언마운트 시 브리지에서 등록 해제해야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
      
      unmount();
      
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
    });

    test('브리지가 null인 경우 언마운트 시 에러가 발생하지 않아야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(null, 'test-id', mockEngine, options)
      );
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('onRegister 콜백', () => {
    test('onRegister가 호출되어야 함', () => {
      const onRegister = jest.fn();
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister };
      
      renderHook(() => useBaseLifecycle(mockBridge, 'test-id', mockEngine, options));
      
      expect(onRegister).toHaveBeenCalledWith(mockEngine);
    });

    test('onRegister에서 cleanup 함수를 반환하면 언마운트 시 호출되어야 함', () => {
      const cleanup = jest.fn();
      const onRegister = jest.fn(() => cleanup);
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(onRegister).toHaveBeenCalledWith(mockEngine);
      
      unmount();
      
      expect(cleanup).toHaveBeenCalled();
    });

    test('onRegister에서 cleanup 함수가 아닌 값을 반환해도 안전해야 함', () => {
      const onRegister = jest.fn(() => 'not a function');
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(() => unmount()).not.toThrow();
    });

    test('onRegister에서 undefined를 반환해도 안전해야 함', () => {
      const onRegister = jest.fn(() => undefined);
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('onUnregister 콜백', () => {
    test('onUnregister가 언마운트 시 호출되어야 함', () => {
      const onUnregister = jest.fn();
      const options: UseBaseLifecycleOptions<MockEngine> = { onUnregister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      unmount();
      
      expect(onUnregister).toHaveBeenCalledWith(mockEngine);
    });

    test('onRegister cleanup과 onUnregister가 모두 호출되어야 함', () => {
      const cleanup = jest.fn();
      const onRegister = jest.fn(() => cleanup);
      const onUnregister = jest.fn();
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister, onUnregister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      unmount();
      
      expect(cleanup).toHaveBeenCalled();
      expect(onUnregister).toHaveBeenCalledWith(mockEngine);
    });

    test('cleanup이 onUnregister보다 먼저 호출되어야 함', () => {
      const callOrder: string[] = [];
      const cleanup = jest.fn(() => callOrder.push('cleanup'));
      const onRegister = jest.fn(() => cleanup);
      const onUnregister = jest.fn(() => callOrder.push('unregister'));
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister, onUnregister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      unmount();
      
      expect(callOrder).toEqual(['cleanup', 'unregister']);
    });
  });

  describe('의존성 처리', () => {
    test('의존성이 변경되면 재등록되어야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = { 
        dependencies: ['dep1'] 
      };
      
      const { rerender } = renderHook(
        (deps) => useBaseLifecycle(mockBridge, 'test-id', mockEngine, { dependencies: deps }),
        { initialProps: ['dep1'] }
      );
      
      expect(mockBridge.register).toHaveBeenCalledTimes(1);
      
      rerender(['dep2']);
      
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
      expect(mockBridge.register).toHaveBeenCalledTimes(2);
    });

    test('의존성이 변경되지 않으면 재등록되지 않아야 함', () => {
      const deps = ['dep1', 'dep2'];
      const options: UseBaseLifecycleOptions<MockEngine> = { 
        dependencies: deps 
      };
      
      const { rerender } = renderHook(
        () => useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(mockBridge.register).toHaveBeenCalledTimes(1);
      
      rerender();
      
      expect(mockBridge.register).toHaveBeenCalledTimes(1);
      expect(mockBridge.unregister).not.toHaveBeenCalled();
    });

    test('빈 의존성 배열도 올바르게 처리되어야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = { 
        dependencies: [] 
      };
      
      const { rerender } = renderHook(
        () => useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(mockBridge.register).toHaveBeenCalledTimes(1);
      
      rerender();
      
      expect(mockBridge.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('브리지/엔진 변경', () => {
    test('브리지가 변경되면 이전 브리지에서 해제하고 새 브리지에 등록해야 함', () => {
      const mockBridge2 = new MockBridge();
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      const { rerender } = renderHook(
        (bridge) => useBaseLifecycle(bridge, 'test-id', mockEngine, options),
        { initialProps: mockBridge }
      );
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
      
      rerender(mockBridge2);
      
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
      expect(mockBridge2.register).toHaveBeenCalledWith('test-id', mockEngine);
    });

    test('엔진이 변경되면 재등록되어야 함', () => {
      const mockEngine2 = new MockEngine();
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      const { rerender } = renderHook(
        (engine) => useBaseLifecycle(mockBridge, 'test-id', engine, options),
        { initialProps: mockEngine }
      );
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
      
      rerender(mockEngine2);
      
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine2);
    });

    test('id가 변경되면 이전 id로 해제하고 새 id로 등록해야 함', () => {
      const options: UseBaseLifecycleOptions<MockEngine> = {};
      
      const { rerender } = renderHook(
        (id) => useBaseLifecycle(mockBridge, id, mockEngine, options),
        { initialProps: 'test-id-1' }
      );
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id-1', mockEngine);
      
      rerender('test-id-2');
      
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id-1');
      expect(mockBridge.register).toHaveBeenCalledWith('test-id-2', mockEngine);
    });
  });

  describe('enabled 옵션', () => {
    test('enabled가 false에서 true로 변경되면 등록되어야 함', () => {
      const { rerender } = renderHook(
        (enabled) => useBaseLifecycle(mockBridge, 'test-id', mockEngine, { enabled }),
        { initialProps: false }
      );
      
      expect(mockBridge.register).not.toHaveBeenCalled();
      
      rerender(true);
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
    });

    test('enabled가 true에서 false로 변경되면 해제되어야 함', () => {
      const { rerender } = renderHook(
        (enabled) => useBaseLifecycle(mockBridge, 'test-id', mockEngine, { enabled }),
        { initialProps: true }
      );
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
      
      rerender(false);
      
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
    });
  });

  describe('에러 처리', () => {
    test('onRegister에서 에러가 발생해도 등록은 완료되어야 함', () => {
      const onRegister = jest.fn(() => {
        throw new Error('onRegister error');
      });
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister };
      
      expect(() => {
        renderHook(() => useBaseLifecycle(mockBridge, 'test-id', mockEngine, options));
      }).toThrow('onRegister error');
      
      expect(mockBridge.register).toHaveBeenCalledWith('test-id', mockEngine);
    });

    test('cleanup 함수에서 에러가 발생해도 언마운트는 완료되어야 함', () => {
      const cleanup = jest.fn(() => {
        throw new Error('cleanup error');
      });
      const onRegister = jest.fn(() => cleanup);
      const options: UseBaseLifecycleOptions<MockEngine> = { onRegister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(() => unmount()).toThrow('cleanup error');
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
    });

    test('onUnregister에서 에러가 발생해도 브리지 해제는 완료되어야 함', () => {
      const onUnregister = jest.fn(() => {
        throw new Error('onUnregister error');
      });
      const options: UseBaseLifecycleOptions<MockEngine> = { onUnregister };
      
      const { unmount } = renderHook(() => 
        useBaseLifecycle(mockBridge, 'test-id', mockEngine, options)
      );
      
      expect(() => unmount()).toThrow('onUnregister error');
      expect(mockBridge.unregister).toHaveBeenCalledWith('test-id');
    });
  });

  describe('메모리 관리', () => {
    test('cleanup 함수가 올바르게 관리되어야 함', () => {
      const cleanup1 = jest.fn();
      const cleanup2 = jest.fn();
      const onRegister1 = jest.fn(() => cleanup1);
      const onRegister2 = jest.fn(() => cleanup2);
      
      const { rerender, unmount } = renderHook(
        (onRegister) => useBaseLifecycle(mockBridge, 'test-id', mockEngine, { onRegister }),
        { initialProps: onRegister1 }
      );
      
      // 첫 번째 등록
      expect(onRegister1).toHaveBeenCalled();
      
      // 옵션 변경으로 재등록
      rerender(onRegister2);
      
      expect(cleanup1).toHaveBeenCalled(); // 이전 cleanup 호출
      expect(onRegister2).toHaveBeenCalled(); // 새 등록
      
      // 언마운트
      unmount();
      
      expect(cleanup2).toHaveBeenCalled(); // 최종 cleanup 호출
    });
  });

  describe('성능 테스트', () => {
    test('많은 수의 useBaseLifecycle 훅을 생성해도 성능 문제가 없어야 함', () => {
      const startTime = performance.now();
      
      // Keep this test stable across slower CI machines.
      for (let i = 0; i < 200; i++) {
        renderHook(() => useBaseLifecycle(mockBridge, `test-id-${i}`, mockEngine, {}));
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });
  });
}); 
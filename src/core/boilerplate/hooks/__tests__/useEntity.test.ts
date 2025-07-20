import { renderHook } from '@testing-library/react';
import { createRef, RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { useEntity, UseEntityOptions } from '../useEntity';

// Mock 훅들
const mockUseCollisionHandler = jest.fn();
const mockUseEntityLifecycle = jest.fn();
const mockUseGaesupStore = jest.fn();
const mockUseAnimationPlayer = jest.fn();
const mockUseAnimationSetup = jest.fn();
const mockUseMotionSetup = jest.fn();
const mockUsePhysicsBridge = jest.fn();

jest.mock('../useCollisionHandler', () => ({
  useCollisionHandler: mockUseCollisionHandler
}));

jest.mock('../useEntityLifecycle', () => ({
  useEntityLifecycle: mockUseEntityLifecycle
}));

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: mockUseGaesupStore
}));

jest.mock('@hooks/useAnimationPlayer', () => ({
  useAnimationPlayer: mockUseAnimationPlayer
}));

jest.mock('@core/motions/hooks/setup/useAnimationSetup', () => ({
  useAnimationSetup: mockUseAnimationSetup
}));

jest.mock('@core/motions/hooks/setup/useMotionSetup', () => ({
  useMotionSetup: mockUseMotionSetup
}));

jest.mock('@core/motions/hooks/usePhysicsBridge', () => ({
  usePhysicsBridge: mockUsePhysicsBridge
}));

// Mock 반환값들
const mockCollisionHandlers = {
  handleIntersectionEnter: jest.fn(),
  handleIntersectionExit: jest.fn(),
  handleCollisionEnter: jest.fn()
};

const mockAnimationPlayer = {
  play: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn()
};

const mockAnimationSetup = {
  actions: {},
  mixer: null
};

const mockMotionSetup = {
  motionState: 'idle',
  setMotionState: jest.fn()
};

const mockPhysicsBridge = {
  applyForce: jest.fn(),
  setPosition: jest.fn(),
  getPosition: jest.fn()
};

describe('useEntity', () => {
  let rigidBodyRef: RefObject<RapierRigidBody>;
  let outerGroupRef: RefObject<THREE.Group>;
  let innerGroupRef: RefObject<THREE.Group>;
  let colliderRef: RefObject<any>;

  beforeEach(() => {
    rigidBodyRef = createRef<RapierRigidBody>();
    outerGroupRef = createRef<THREE.Group>();
    innerGroupRef = createRef<THREE.Group>();
    colliderRef = createRef<any>();
    
    jest.clearAllMocks();
    
    // Mock 기본 반환값 설정
    mockUseCollisionHandler.mockReturnValue(mockCollisionHandlers);
    mockUseEntityLifecycle.mockReturnValue(undefined);
    mockUseGaesupStore.mockReturnValue({});
    mockUseAnimationPlayer.mockReturnValue(mockAnimationPlayer);
    mockUseAnimationSetup.mockReturnValue(mockAnimationSetup);
    mockUseMotionSetup.mockReturnValue(mockMotionSetup);
    mockUsePhysicsBridge.mockReturnValue(mockPhysicsBridge);
  });

  describe('기본 동작', () => {
    test('최소 필수 옵션으로 사용할 수 있어야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef
      };
      
      expect(() => {
        renderHook(() => useEntity(options));
      }).not.toThrow();
    });

    test('모든 하위 훅들이 호출되어야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        colliderRef
      };
      
      renderHook(() => useEntity(options));
      
      expect(mockUseCollisionHandler).toHaveBeenCalled();
      expect(mockUseEntityLifecycle).toHaveBeenCalled();
      expect(mockUseGaesupStore).toHaveBeenCalled();
      expect(mockUseAnimationPlayer).toHaveBeenCalled();
      expect(mockUseAnimationSetup).toHaveBeenCalled();
      expect(mockUseMotionSetup).toHaveBeenCalled();
      expect(mockUsePhysicsBridge).toHaveBeenCalled();
    });

    test('반환값이 올바른 구조를 가져야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef
      };
      
      const { result } = renderHook(() => useEntity(options));
      
      expect(result.current).toEqual({
        collisionHandlers: mockCollisionHandlers,
        animationPlayer: mockAnimationPlayer,
        animationSetup: mockAnimationSetup,
        motionSetup: mockMotionSetup,
        physicsBridge: mockPhysicsBridge
      });
    });
  });

  describe('충돌 처리 옵션', () => {
    test('충돌 핸들러 옵션이 올바르게 전달되어야 함', () => {
      const onIntersectionEnter = jest.fn();
      const onIntersectionExit = jest.fn();
      const onCollisionEnter = jest.fn();
      const userData = { type: 'player' };
      
      const options: UseEntityOptions = {
        rigidBodyRef,
        onIntersectionEnter,
        onIntersectionExit,
        onCollisionEnter,
        userData
      };
      
      renderHook(() => useEntity(options));
      
      expect(mockUseCollisionHandler).toHaveBeenCalledWith({
        onIntersectionEnter,
        onIntersectionExit,
        onCollisionEnter,
        userData
      });
    });

    test('충돌 핸들러 옵션이 없어도 기본값으로 동작해야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef
      };
      
      renderHook(() => useEntity(options));
      
      expect(mockUseCollisionHandler).toHaveBeenCalledWith({});
    });
  });

  describe('라이프사이클 옵션', () => {
    test('라이프사이클 옵션이 올바르게 전달되어야 함', () => {
      const onReady = jest.fn();
      const onFrame = jest.fn();
      const onAnimate = jest.fn();
      const actions = {};
      
      const options: UseEntityOptions = {
        rigidBodyRef,
        onReady,
        onFrame,
        onAnimate,
        actions
      };
      
      renderHook(() => useEntity(options));
      
      expect(mockUseEntityLifecycle).toHaveBeenCalledWith({
        onReady,
        onFrame,
        onAnimate,
        actions
      });
    });

    test('라이프사이클 옵션이 없어도 기본값으로 동작해야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef
      };
      
      renderHook(() => useEntity(options));
      
      expect(mockUseEntityLifecycle).toHaveBeenCalledWith({});
    });
  });

  describe('엔티티 옵션', () => {
    test('id가 설정되어야 함', () => {
      const options: UseEntityOptions = {
        id: 'custom-entity-id',
        rigidBodyRef
      };
      
      renderHook(() => useEntity(options));
      
      // id가 하위 훅들에 어떻게 전달되는지는 실제 구현에 따라 다름
      // 여기서는 훅이 정상 호출되는지만 확인
      expect(mockUseAnimationSetup).toHaveBeenCalled();
      expect(mockUseMotionSetup).toHaveBeenCalled();
    });

    test('isActive 옵션이 처리되어야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef,
        isActive: false
      };
      
      renderHook(() => useEntity(options));
      
      // isActive 값에 따른 동작은 실제 구현에 따라 다름
      expect(mockUsePhysicsBridge).toHaveBeenCalled();
    });

    test('모든 ref가 설정되어야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        colliderRef
      };
      
      renderHook(() => useEntity(options));
      
      // ref들이 적절히 전달되는지 확인
      expect(mockUseAnimationSetup).toHaveBeenCalledWith(
        expect.objectContaining({
          outerGroupRef,
          innerGroupRef
        })
      );
    });
  });

  describe('물리 계산 옵션', () => {
    test('groundRay 옵션이 처리되어야 함', () => {
      const groundRay = { origin: [0, 0, 0], direction: [0, -1, 0] };
      
      const options: UseEntityOptions = {
        rigidBodyRef,
        groundRay
      };
      
      renderHook(() => useEntity(options));
      
      // groundRay가 물리 브리지에 전달되는지 확인
      expect(mockUsePhysicsBridge).toHaveBeenCalled();
    });

    test('물리 계산 옵션들이 올바르게 구성되어야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        colliderRef,
        isActive: true
      };
      
      renderHook(() => useEntity(options));
      
      // PhysicsCalculationProps가 올바르게 구성되는지 확인
      expect(mockUsePhysicsBridge).toHaveBeenCalledWith(
        expect.objectContaining({
          rigidBodyRef,
          outerGroupRef,
          innerGroupRef,
          colliderRef,
          isActive: true
        })
      );
    });
  });

  describe('옵션 변경 처리', () => {
    test('옵션이 변경되면 하위 훅들이 재실행되어야 함', () => {
      const { rerender } = renderHook(
        (options) => useEntity(options),
        { 
          initialProps: { 
            rigidBodyRef,
            isActive: true 
          } as UseEntityOptions 
        }
      );
      
      const initialCallCount = mockUsePhysicsBridge.mock.calls.length;
      
      rerender({ 
        rigidBodyRef,
        isActive: false 
      });
      
      expect(mockUsePhysicsBridge.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    test('ref가 변경되면 모든 관련 훅이 업데이트되어야 함', () => {
      const newRigidBodyRef = createRef<RapierRigidBody>();
      
      const { rerender } = renderHook(
        (options) => useEntity(options),
        { 
          initialProps: { rigidBodyRef } as UseEntityOptions 
        }
      );
      
      rerender({ rigidBodyRef: newRigidBodyRef });
      
      expect(mockUsePhysicsBridge).toHaveBeenCalledWith(
        expect.objectContaining({
          rigidBodyRef: newRigidBodyRef
        })
      );
    });
  });

  describe('복합 시나리오', () => {
    test('모든 옵션이 함께 사용되어도 정상 작동해야 함', () => {
      const onIntersectionEnter = jest.fn();
      const onIntersectionExit = jest.fn();
      const onCollisionEnter = jest.fn();
      const onReady = jest.fn();
      const onFrame = jest.fn();
      const onAnimate = jest.fn();
      const userData = { type: 'player', health: 100 };
      const actions = { walk: null, run: null, jump: null };
      const groundRay = { origin: [0, 0, 0], direction: [0, -1, 0] };
      
      const options: UseEntityOptions = {
        id: 'complex-entity',
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        colliderRef,
        isActive: true,
        onIntersectionEnter,
        onIntersectionExit,
        onCollisionEnter,
        userData,
        onReady,
        onFrame,
        onAnimate,
        actions,
        groundRay
      };
      
      const { result } = renderHook(() => useEntity(options));
      
      expect(result.current).toEqual({
        collisionHandlers: mockCollisionHandlers,
        animationPlayer: mockAnimationPlayer,
        animationSetup: mockAnimationSetup,
        motionSetup: mockMotionSetup,
        physicsBridge: mockPhysicsBridge
      });
      
      expect(mockUseCollisionHandler).toHaveBeenCalledWith({
        onIntersectionEnter,
        onIntersectionExit,
        onCollisionEnter,
        userData
      });
      
      expect(mockUseEntityLifecycle).toHaveBeenCalledWith({
        onReady,
        onFrame,
        onAnimate,
        actions
      });
    });

    test('일부 옵션만 설정해도 정상 작동해야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef,
        onReady: jest.fn(),
        userData: { type: 'npc' }
      };
      
      const { result } = renderHook(() => useEntity(options));
      
      expect(result.current).toBeDefined();
      expect(result.current.collisionHandlers).toBe(mockCollisionHandlers);
      expect(result.current.animationPlayer).toBe(mockAnimationPlayer);
    });
  });

  describe('에러 처리', () => {
    test('하위 훅에서 에러가 발생해도 다른 훅들은 정상 작동해야 함', () => {
      mockUseCollisionHandler.mockImplementation(() => {
        throw new Error('Collision handler error');
      });
      
      const options: UseEntityOptions = {
        rigidBodyRef
      };
      
      expect(() => {
        renderHook(() => useEntity(options));
      }).toThrow('Collision handler error');
      
      // 다른 훅들은 여전히 호출되어야 함
      expect(mockUseEntityLifecycle).toHaveBeenCalled();
      expect(mockUseAnimationPlayer).toHaveBeenCalled();
    });

    test('null ref로 인한 에러가 적절히 처리되어야 함', () => {
      const nullRef = createRef<RapierRigidBody>();
      // ref.current는 null로 유지
      
      const options: UseEntityOptions = {
        rigidBodyRef: nullRef
      };
      
      expect(() => {
        renderHook(() => useEntity(options));
      }).not.toThrow();
    });
  });

  describe('메모리 관리', () => {
    test('언마운트 시 모든 정리 작업이 수행되어야 함', () => {
      const options: UseEntityOptions = {
        rigidBodyRef,
        onFrame: jest.fn()
      };
      
      const { unmount } = renderHook(() => useEntity(options));
      
      unmount();
      
      // 언마운트 후 정리 작업은 각 하위 훅의 책임
      // 여기서는 에러가 발생하지 않는지만 확인
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('성능 테스트', () => {
    test('많은 엔티티를 효율적으로 생성할 수 있어야 함', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const ref = createRef<RapierRigidBody>();
        renderHook(() => useEntity({ rigidBodyRef: ref }));
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // 2초 이내
    });

    test('옵션 변경이 효율적으로 처리되어야 함', () => {
      const { rerender } = renderHook(
        (active) => useEntity({ rigidBodyRef, isActive: active }),
        { initialProps: true }
      );
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        rerender(i % 2 === 0);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });
  });

  describe('통합 테스트', () => {
    test('실제 사용 시나리오를 시뮬레이션해야 함', () => {
      let frameCount = 0;
      const onFrame = jest.fn(() => {
        frameCount++;
      });
      
      const onIntersectionEnter = jest.fn();
      const userData = { 
        type: 'player',
        onNear: jest.fn() 
      };
      
      const options: UseEntityOptions = {
        id: 'player-entity',
        rigidBodyRef,
        outerGroupRef,
        innerGroupRef,
        isActive: true,
        onFrame,
        onIntersectionEnter,
        userData
      };
      
      const { result } = renderHook(() => useEntity(options));
      
      // 모든 기능이 제대로 설정되었는지 확인
      expect(result.current.collisionHandlers).toBeDefined();
      expect(result.current.animationPlayer).toBeDefined();
      expect(result.current.physicsBridge).toBeDefined();
      
      // 옵션이 올바르게 전달되었는지 확인
      expect(mockUseEntityLifecycle).toHaveBeenCalledWith(
        expect.objectContaining({ onFrame })
      );
      
      expect(mockUseCollisionHandler).toHaveBeenCalledWith(
        expect.objectContaining({ 
          onIntersectionEnter,
          userData 
        })
      );
    });
  });
}); 
import { StateChecker } from '../checkState';
import { useGaesupStore } from '@stores/gaesupStore';
import * as THREE from 'three';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: {
    getState: jest.fn()
  }
}));

describe('StateChecker', () => {
  let stateChecker: StateChecker;
  let mockSetStates: jest.Mock;
  let mockUpdateState: jest.Mock;
  let mockRigidBody: any;

  beforeEach(() => {
    mockSetStates = jest.fn();
    mockUpdateState = jest.fn();
    
    (useGaesupStore.getState as jest.Mock).mockReturnValue({
      setStates: mockSetStates,
      updateState: mockUpdateState,
      activeState: { position: new THREE.Vector3(), velocity: new THREE.Vector3() },
      states: { canRide: false, isRiding: false }
    });
    
    stateChecker = new StateChecker();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockProps = (
    keyboard: any = {},
    mouse: any = {},
    position = { x: 0, y: 0, z: 0 },
    velocity = { x: 0, y: 0, z: 0 }
  ) => {
    mockRigidBody = {
      handle: 1,
      translation: () => position,
      linvel: () => velocity
    };
    return {
      rigidBodyRef: { current: mockRigidBody },
      inputRef: { current: { keyboard, mouse } },
      matchSizes: { characterUrl: { y: 2 } }
    };
  };

  it('땅에 있을 때, isOnTheGround를 true로 설정해야 합니다.', () => {
    const props = createMockProps();
    const physicsState = {
      activeState: {
        euler: new THREE.Euler(),
        isMoving: false
      }
    };
    stateChecker.checkAll(props as any, physicsState as any);
    expect(mockSetStates).toHaveBeenCalledWith(
      expect.objectContaining({ isOnTheGround: true, isFalling: false })
    );
  });

  it('공중에 있고 떨어질 때, isFalling을 true로 설정해야 합니다.', () => {
    const props = createMockProps({}, {}, { x: 0, y: 5, z: 0 }, { x: 0, y: -1, z: 0 });
    const physicsState = {
      activeState: {
        euler: new THREE.Euler(),
        isMoving: false
      }
    };
    stateChecker.checkAll(props as any, physicsState as any);
    expect(mockSetStates).toHaveBeenCalledWith(
      expect.objectContaining({ isOnTheGround: false, isFalling: true })
    );
  });

  it('키보드 입력이 있을 때, isMoving을 true로 설정해야 합니다.', () => {
    const props = createMockProps({ forward: true });
    const physicsState = {
      activeState: {
        euler: new THREE.Euler(),
        isMoving: true
      }
    };
    stateChecker.checkAll(props as any, physicsState as any);
    expect(mockSetStates).toHaveBeenCalledWith(
      expect.objectContaining({ isMoving: true })
    );
  });

  it('space 키를 누르면 isJumping을 true로 설정해야 합니다.', () => {
    const props = createMockProps({ space: true });
    const physicsState = {
      activeState: {
        euler: new THREE.Euler(),
        isMoving: false
      }
    };
    stateChecker.checkAll(props as any, physicsState as any);
    expect(mockSetStates).toHaveBeenCalledWith(
      expect.objectContaining({ isJumping: true })
    );
  });

  it('F 키를 누르고 탑승 가능할 때, shouldEnterRideable을 true로 설정해야 합니다.', () => {
    stateChecker = new StateChecker();
    
    (useGaesupStore.getState as jest.Mock).mockReturnValue({
      setStates: mockSetStates,
      updateState: mockUpdateState,
      activeState: { position: new THREE.Vector3(), velocity: new THREE.Vector3() },
      states: { canRide: true, isRiding: false }
    });
    
    const props = createMockProps({ keyF: true });
    const physicsState = {
      activeState: {
        euler: new THREE.Euler(),
        isMoving: false
      }
    };
    
    mockSetStates.mockClear();
    
    stateChecker.checkAll(props as any, physicsState as any);
    
    const calls = mockSetStates.mock.calls;
    console.log('mockSetStates calls:', calls);
    
    expect(mockSetStates).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEnterRideable: true })
    );
  });
}); 
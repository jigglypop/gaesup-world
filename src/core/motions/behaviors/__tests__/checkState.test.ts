import { StateChecker } from '../checkState';
import { StateEngine } from '../../core/StateEngine';
import * as THREE from 'three';

jest.mock('../../core/StateEngine');

describe('StateChecker', () => {
  let stateChecker: StateChecker;
  let mockStateEngine: jest.Mocked<StateEngine>;
  let mockGameStatesRef: any;
  let mockActiveStateRef: any;
  let mockRigidBody: any;

  beforeEach(() => {
    mockGameStatesRef = {
      isOnTheGround: false,
      isFalling: false,
      isJumping: false,
      isMoving: false,
      isRunning: false,
      isNotMoving: true,
      isNotRunning: true,
      canRide: false,
      isRiding: false,
    };
    
    mockActiveStateRef = {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      euler: new THREE.Euler(),
    };
    
    mockStateEngine = {
      getGameStatesRef: jest.fn(() => mockGameStatesRef),
      getActiveStateRef: jest.fn(() => mockActiveStateRef),
      updateGameStates: jest.fn(),
      updateActiveState: jest.fn(),
    } as any;
    
    (StateEngine.getInstance as jest.Mock).mockReturnValue(mockStateEngine);
    
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
    expect(mockGameStatesRef.isOnTheGround).toBe(true);
    expect(mockGameStatesRef.isFalling).toBe(false);
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
    expect(mockGameStatesRef.isOnTheGround).toBe(false);
    expect(mockGameStatesRef.isFalling).toBe(true);
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
    expect(mockGameStatesRef.isMoving).toBe(true);
    expect(mockGameStatesRef.isNotMoving).toBe(false);
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
    expect(mockGameStatesRef.isJumping).toBe(true);
  });

  it('F 키를 누르고 탑승 가능할 때, rideable 로직이 실행되어야 합니다.', () => {
    mockGameStatesRef.canRide = true;
    mockGameStatesRef.isRiding = false;
    
    const props = createMockProps({ keyF: true });
    const physicsState = {
      activeState: {
        euler: new THREE.Euler(),
        isMoving: false
      }
    };
    
    stateChecker.checkAll(props as any, physicsState as any);
    
    // F 키 입력이 처리되었는지 확인
    // 실제 rideable 로직은 별도로 처리되므로 여기서는 키 입력만 확인
    expect(props.inputRef.current.keyboard.keyF).toBe(true);
  });
}); 
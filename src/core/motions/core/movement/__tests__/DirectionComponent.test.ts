import { DirectionComponent } from '@core/motions/core/movement/DirectionComponent';
import * as THREE from 'three';
import { PhysicsState } from '@core/motions/types';
import { InteractionEngine } from '@core/interactions/core/InteractionEngine';

jest.mock('@core/interactions/core/InteractionEngine');

describe('DirectionComponent', () => {
  let directionComponent: DirectionComponent;
  let mockInteractionEngine: jest.Mocked<InteractionEngine>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInteractionEngine = {
      getKeyboardRef: jest.fn().mockReturnValue({
        forward: false,
        backward: false,
        leftward: false,
        rightward: false,
        shift: false,
        space: false,
        keyZ: false,
        keyR: false,
        keyF: false,
        keyE: false,
        escape: false
      }),
      getMouseRef: jest.fn().mockReturnValue({
        target: new THREE.Vector3(),
        angle: 0,
        isActive: false,
        shouldRun: false,
        buttons: { left: false, right: false, middle: false },
        wheel: 0,
        position: new THREE.Vector2()
      })
    } as any;
    
    (InteractionEngine.getInstance as jest.Mock).mockReturnValue(mockInteractionEngine);
    directionComponent = new DirectionComponent();
  });

  const createMockState = (
    modeType: 'character' | 'vehicle' | 'airplane',
    keyboard: any = {},
    mouse: any = {}
  ): PhysicsState => ({
    modeType,
    keyboard,
    mouse,
    activeState: {
      dir: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      euler: new THREE.Euler(),
      velocity: new THREE.Vector3()
    },
    characterConfig: {},
    vehicleConfig: {},
    airplaneConfig: {}
  } as any);

  it('캐릭터 모드 + 키보드 입력 시 activeState.dir과 euler.y가 변경되어야 합니다.', () => {
    mockInteractionEngine.getKeyboardRef.mockReturnValue({
      forward: true,
      leftward: true,
      backward: false,
      rightward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false
    });
    
    const state = createMockState('character');
    directionComponent.updateDirection(state);
    expect(state.activeState.dir.length()).not.toBe(0);
    expect(state.activeState.euler.y).not.toBe(0);
  });

  it('캐릭터 모드 + 마우스 입력 시 activeState.dir과 euler.y가 변경되어야 합니다.', () => {
    mockInteractionEngine.getMouseRef.mockReturnValue({
      isActive: true,
      angle: Math.PI / 4,
      target: new THREE.Vector3(10, 0, 10),
      shouldRun: false,
      buttons: { left: false, right: false, middle: false },
      wheel: 0,
      position: new THREE.Vector2()
    });
    
    const state = createMockState('character');
    const props = {
      worldContext: { automation: { settings: {} } },
      rigidBodyRef: { current: { translation: () => ({ x: 0, y: 0, z: 0 }) } }
    } as any;
    directionComponent.updateDirection(state, 'normal', props);
    expect(state.activeState.dir.length()).not.toBe(0);
    expect(state.activeState.euler.y).not.toBe(0);
  });

  it('차량 모드 + 키보드 입력 시 activeState.direction과 euler.y가 변경되어야 합니다.', () => {
    mockInteractionEngine.getKeyboardRef.mockReturnValue({
      forward: true,
      rightward: true,
      backward: false,
      leftward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false
    });
    
    const state = createMockState('vehicle');
    directionComponent.updateDirection(state);
    expect(state.activeState.direction.length()).not.toBe(0);
    expect(state.activeState.euler.y).not.toBe(0);
  });

  it('비행기 모드 + 키보드 입력 시 activeState.direction과 euler가 변경되어야 합니다.', () => {
    mockInteractionEngine.getKeyboardRef.mockReturnValue({
      forward: true,
      leftward: true,
      backward: false,
      rightward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false
    });
    
    const state = createMockState('airplane');
    const innerGroupRef = { current: new THREE.Group() };
    directionComponent.updateDirection(state, 'normal', undefined, innerGroupRef);
    expect(state.activeState.direction.length()).not.toBe(0);
  });

  it('자동화(automation) 큐가 있을 때 마우스 방향을 덮어써야 합니다.', () => {
    mockInteractionEngine.getMouseRef.mockReturnValue({
      isActive: true,
      angle: 0,
      target: new THREE.Vector3(),
      shouldRun: false,
      buttons: { left: false, right: false, middle: false },
      wheel: 0,
      position: new THREE.Vector2()
    });
    
    const state = createMockState('character');
    const target = new THREE.Vector3(10, 0, 10);
    const props = {
      worldContext: {
        automation: {
          settings: { trackProgress: true },
          queue: { actions: [{ type: 'move', target }] }
        }
      },
      body: { translation: () => ({ x: 0, y: 0, z: 0 }) },
      memo: {},
      rigidBodyRef: { current: { translation: () => ({ x: 0, y: 0, z: 0 }) } }
    } as any;
    directionComponent.updateDirection(state, 'normal', props);
    // target(10,0,10)을 향하는 정규화된 벡터 (약 0.707, 0, 0.707)
    expect(props.memo.direction.x).toBeCloseTo(0.707, 1);
    expect(props.memo.direction.z).toBeCloseTo(0.707, 1);
  });
}); 
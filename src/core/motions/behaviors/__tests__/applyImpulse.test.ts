import { ImpulseController } from '../applyImpulse';
import { RapierRigidBody } from '@react-three/rapier';
import { useGaesupStore } from '@stores/gaesupStore';
import * as THREE from 'three';

const mockSetStates = jest.fn();

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: {
    getState: jest.fn(() => ({
      setStates: mockSetStates
    }))
  }
}));

describe('ImpulseController', () => {
  let impulseController: ImpulseController;
  let mockRigidBody: jest.Mocked<RapierRigidBody>;

  beforeEach(() => {
    mockSetStates.mockClear();
    impulseController = new ImpulseController();
    mockRigidBody = {
      applyImpulse: jest.fn(),
      setLinvel: jest.fn(),
      linvel: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
      mass: jest.fn(() => 1)
    } as unknown as jest.Mocked<RapierRigidBody>;
  });

  const createMockState = (modeType: 'character' | 'vehicle' | 'airplane') => ({
    modeType,
    gameStates: {
      isMoving: true,
      isRunning: false,
      isOnTheGround: true,
      isJumping: false
    },
    activeState: {
      dir: new THREE.Vector3(-1, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      direction: new THREE.Vector3(0, 0, -1)
    },
    characterConfig: { walkSpeed: 5, jumpSpeed: 10 },
    vehicleConfig: { maxSpeed: 10, accelRatio: 2 },
    airplaneConfig: { maxSpeed: 20 },
    keyboard: { shift: false }
  });

  it('캐릭터가 움직일 때, impulse를 적용해야 합니다.', () => {
    const state = createMockState('character');
    impulseController.applyImpulse({ current: mockRigidBody }, state as any);
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });

  it('캐릭터가 점프할 때, linvel을 설정하고 store 상태를 변경해야 합니다.', () => {
    const state = createMockState('character');
    state.gameStates.isJumping = true;
    impulseController.applyImpulse({ current: mockRigidBody }, state as any);
    expect(mockRigidBody.setLinvel).toHaveBeenCalledWith(
      { x: 0, y: 10, z: 0 },
      true
    );
    expect(mockSetStates).toHaveBeenCalledWith({
      isJumping: false,
      isOnTheGround: true
    });
  });

  it('차량이 최대 속도보다 느릴 때, impulse를 적용해야 합니다.', () => {
    const state = createMockState('vehicle');
    impulseController.applyImpulse({ current: mockRigidBody }, state as any);
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });

  it('비행기가 최대 속도보다 느릴 때, impulse를 적용해야 합니다.', () => {
    const state = createMockState('airplane');
    impulseController.applyImpulse({ current: mockRigidBody }, state as any);
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });
});
 
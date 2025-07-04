import { ImpulseComponent } from '@core/motions/core/movement/ImpulseComponent';
import { StateEngine } from '@core/motions/core/StateEngine';
import { RapierRigidBody } from '@react-three/rapier';

jest.mock('@core/motions/core/StateEngine');

describe('ImpulseComponent', () => {
  let impulseComponent: ImpulseComponent;
  let mockStateEngine: jest.Mocked<StateEngine>;
  let mockRigidBody: jest.Mocked<RapierRigidBody>;

  beforeEach(() => {
    mockStateEngine = {
      updateGameStates: jest.fn()
    } as any;
    (StateEngine.getInstance as jest.Mock).mockReturnValue(mockStateEngine);
    
    impulseComponent = new ImpulseComponent();
    mockRigidBody = {
      applyImpulse: jest.fn(),
      setLinvel: jest.fn(),
      linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      mass: jest.fn().mockReturnValue(1)
    } as any;
  });

  it('캐릭터가 움직일 때, impulse를 적용해야 합니다.', () => {
    const state = {
      modeType: 'character',
      gameStates: { isMoving: true, isRunning: false, isOnTheGround: true, isJumping: false },
      activeState: { dir: { x: -1, z: 0 }, velocity: { x: 0, y: 0, z: 0 } },
      characterConfig: { walkSpeed: 10 }
    } as any;
    impulseComponent.applyImpulse({ current: mockRigidBody }, state);
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });

  it('캐릭터가 점프할 때, linvel을 설정하고 isOnTheGround를 false로 변경해야 합니다.', () => {
    const state = {
      modeType: 'character',
      gameStates: { isJumping: true, isOnTheGround: true },
      activeState: {},
      characterConfig: { jumpSpeed: 15 }
    } as any;
    impulseComponent.applyImpulse({ current: mockRigidBody }, state);
    expect(mockRigidBody.setLinvel).toHaveBeenCalledWith({ x: 0, y: 15, z: 0 }, true);
    expect(mockStateEngine.updateGameStates).toHaveBeenCalledWith({ isOnTheGround: false });
  });

  it('차량이 최대 속도보다 느릴 때, impulse를 적용해야 합니다.', () => {
    const state = {
      modeType: 'vehicle',
      activeState: { dir: { x: 1, z: 0 } },
      vehicleConfig: { maxSpeed: 10, accelRatio: 2 }
    } as any;
    impulseComponent.applyImpulse({ current: mockRigidBody }, state);
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });

  it('비행기가 최대 속도보다 느릴 때, impulse를 적용해야 합니다.', () => {
    const state = {
      modeType: 'airplane',
      activeState: { direction: { x: 1, y: 0, z: 0 } },
      airplaneConfig: { maxSpeed: 20 }
    } as any;
    impulseComponent.applyImpulse({ current: mockRigidBody }, state);
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });
}); 
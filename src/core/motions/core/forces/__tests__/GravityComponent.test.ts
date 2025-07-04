import { GravityComponent } from '@core/motions/core/forces/GravityComponent';
import { RapierRigidBody } from '@react-three/rapier';

describe('GravityComponent', () => {
  let gravityComponent: GravityComponent;
  let mockRigidBody: jest.Mocked<RapierRigidBody>;

  beforeEach(() => {
    gravityComponent = new GravityComponent();
    mockRigidBody = {
      setGravityScale: jest.fn()
    } as any;
  });

  it('캐릭터가 점프 중일 때, jumpGravityScale을 적용해야 합니다.', () => {
    const state = {
      modeType: 'character',
      gameStates: { isJumping: true, isFalling: false },
      characterConfig: { jumpGravityScale: 2.0 }
    } as any;
    gravityComponent.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(2.0, false);
  });

  it('캐릭터가 떨어지는 중일 때, jumpGravityScale을 적용해야 합니다.', () => {
    const state = {
      modeType: 'character',
      gameStates: { isJumping: false, isFalling: true },
      characterConfig: { jumpGravityScale: 2.0 }
    } as any;
    gravityComponent.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(2.0, false);
  });

  it('캐릭터가 땅에 있을 때, normalGravityScale을 적용해야 합니다.', () => {
    const state = {
      modeType: 'character',
      gameStates: { isJimming: false, isFalling: false },
      characterConfig: { normalGravityScale: 1.0 }
    } as any;
    gravityComponent.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(1.0, false);
  });

  it('비행기 모드일 때, airplane의 gravityScale을 적용해야 합니다.', () => {
    const state = {
      modeType: 'airplane',
      airplaneConfig: { gravityScale: 0.5 }
    } as any;
    gravityComponent.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(0.5, false);
  });

  it('차량 모드일 때, vehicle의 normalGravityScale을 적용해야 합니다.', () => {
    const state = {
      modeType: 'vehicle',
      vehicleConfig: { normalGravityScale: 1.2 }
    } as any;
    gravityComponent.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(1.2, false);
  });

  it('rigidBody가 없으면 아무 동작도 하지 않아야 합니다.', () => {
    const state = {
      modeType: 'character',
      gameStates: { isJumping: true, isFalling: false },
      characterConfig: { jumpGravityScale: 2.0 }
    } as any;
    gravityComponent.applyGravity({ current: null }, state);
    expect(mockRigidBody.setGravityScale).not.toHaveBeenCalled();
  });
}); 
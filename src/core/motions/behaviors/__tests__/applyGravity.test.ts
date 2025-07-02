import { GravityController } from '../applyGravity';
import { RapierRigidBody } from '@react-three/rapier';
import { ModeType } from '../../../stores/types';

type GravityPhysicsState = {
  modeType: ModeType;
  gameStates: {
    isJumping: boolean;
    isFalling: boolean;
  };
  characterConfig: {
    jumpGravityScale?: number;
    normalGravityScale?: number;
  };
  airplaneConfig: {
    gravityScale?: number;
  };
};

describe('GravityController', () => {
  let gravityController: GravityController;
  let mockRigidBody: jest.Mocked<RapierRigidBody>;

  beforeEach(() => {
    gravityController = new GravityController();
    mockRigidBody = {
      setGravityScale: jest.fn()
    } as unknown as jest.Mocked<RapierRigidBody>;
  });

  const createMockState = (
    modeType: ModeType,
    isJumping = false,
    isFalling = false
  ): GravityPhysicsState => ({
    modeType,
    gameStates: { isJumping, isFalling },
    characterConfig: { jumpGravityScale: 2.0, normalGravityScale: 1.0 },
    airplaneConfig: { gravityScale: 0.5 }
  });

  it('캐릭터가 점프 중일 때, jumpGravityScale을 적용해야 합니다.', () => {
    const state = createMockState('character', true, false);
    gravityController.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(2.0, false);
  });

  it('캐릭터가 떨어지는 중일 때, jumpGravityScale을 적용해야 합니다.', () => {
    const state = createMockState('character', false, true);
    gravityController.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(2.0, false);
  });

  it('캐릭터가 땅에 있을 때, normalGravityScale을 적용해야 합니다.', () => {
    const state = createMockState('character', false, false);
    gravityController.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(1.0, false);
  });

  it('비행기 모드일 때, airplane의 gravityScale을 적용해야 합니다.', () => {
    const state = createMockState('airplane');
    gravityController.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).toHaveBeenCalledWith(0.5, false);
  });

  it('차량 모드일 때, 중력을 변경하지 않아야 합니다.', () => {
    const state = createMockState('vehicle');
    gravityController.applyGravity({ current: mockRigidBody }, state);
    expect(mockRigidBody.setGravityScale).not.toHaveBeenCalled();
  });

  it('rigidBody가 없으면 아무 동작도 하지 않아야 합니다.', () => {
    const state = createMockState('character');
    gravityController.applyGravity({ current: null }, state);
    expect(mockRigidBody.setGravityScale).not.toHaveBeenCalled();
  });
}); 
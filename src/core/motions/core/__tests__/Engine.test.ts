import { PhysicsEngine } from '../Engine';
import { DirectionController } from '../../behaviors/updateDirection';
import { ImpulseController } from '../../behaviors/applyImpulse';
import { GravityController } from '../../behaviors/applyGravity';
import { StateChecker } from '../../behaviors/checkState';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

jest.mock('../../behaviors/updateDirection');
jest.mock('../../behaviors/applyImpulse');
jest.mock('../../behaviors/applyGravity');
jest.mock('../../behaviors/checkState');

describe('PhysicsEngine', () => {
  let engine: PhysicsEngine;
  let mockRigidBody: RapierRigidBody;
  let mockDirectionController: jest.Mocked<DirectionController>;
  let mockImpulseController: jest.Mocked<ImpulseController>;
  let mockGravityController: jest.Mocked<GravityController>;
  let mockStateChecker: jest.Mocked<StateChecker>;

  beforeEach(() => {
    engine = new PhysicsEngine();
    mockRigidBody = {
      linvel: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
      setLinearDamping: jest.fn(),
      setRotation: jest.fn(),
      setEnabledRotations: jest.fn()
    } as unknown as jest.Mocked<RapierRigidBody>;

    (DirectionController as jest.Mock).mockClear();
    (ImpulseController as jest.Mock).mockClear();
    (GravityController as jest.Mock).mockClear();
    (StateChecker as jest.Mock).mockClear();

    mockDirectionController = new (DirectionController as any)();
    mockImpulseController = new (ImpulseController as any)();
    mockGravityController = new (GravityController as any)();
    mockStateChecker = new (StateChecker as any)();
  });

  const createMockState = (modeType: 'character' | 'vehicle' | 'airplane') => ({
    modeType,
    activeState: { velocity: new THREE.Vector3(), euler: new THREE.Euler() },
    gameStates: { isJumping: false, isFalling: false, isNotMoving: true },
    characterConfig: {},
    vehicleConfig: {},
    airplaneConfig: {},
    keyboard: {}
  });

  it('캐릭터 모드일 때 올바른 behavior들을 호출해야 합니다.', () => {
    const state = createMockState('character');
    const props = { rigidBodyRef: { current: mockRigidBody } } as any;

    engine.calculate(props, state);

    expect(mockStateChecker.checkAll).toHaveBeenCalledWith(props, state);
    expect(mockDirectionController.updateDirection).toHaveBeenCalled();
    expect(mockImpulseController.applyImpulse).toHaveBeenCalled();
    expect(mockGravityController.applyGravity).toHaveBeenCalled();
  });

  it('차량 모드일 때 중력(gravity)을 적용하지 않아야 합니다.', () => {
    const state = createMockState('vehicle');
    const props = { rigidBodyRef: { current: mockRigidBody } } as any;
    
    engine.calculate(props, state);

    expect(mockGravityController.applyGravity).not.toHaveBeenCalled();
    expect(mockRigidBody.setLinearDamping).toHaveBeenCalled();
    expect(mockRigidBody.setRotation).toHaveBeenCalled();
  });

  it('비행기 모드일 때 모든 behavior들을 호출해야 합니다.', () => {
    const state = createMockState('airplane');
    const props = { rigidBodyRef: { current: mockRigidBody } } as any;

    engine.calculate(props, state);
    
    expect(mockStateChecker.checkAll).toHaveBeenCalled();
    expect(mockDirectionController.updateDirection).toHaveBeenCalled();
    expect(mockImpulseController.applyImpulse).toHaveBeenCalled();
    expect(mockGravityController.applyGravity).toHaveBeenCalled();
    expect(mockRigidBody.setLinearDamping).toHaveBeenCalled();
  });
  
  it('rigidBody가 없으면 아무 동작도 하지 않아야 합니다.', () => {
    const state = createMockState('character');
    const props = { rigidBodyRef: { current: null } } as any;

    engine.calculate(props, state);

    expect(mockStateChecker.checkAll).not.toHaveBeenCalled();
    expect(mockDirectionController.updateDirection).not.toHaveBeenCalled();
    expect(mockImpulseController.applyImpulse).not.toHaveBeenCalled();
    expect(mockGravityController.applyGravity).not.toHaveBeenCalled();
  });
}); 
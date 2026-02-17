import 'reflect-metadata';
import * as THREE from 'three';

import { PhysicsSystem } from '../PhysicsSystem';
import type { PhysicsCalcProps, PhysicsState } from '../../../types';
import type { PhysicsConfigType } from '@stores/slices/physics/types';
import type { GameStatesType } from '@core/world/components/Rideable/types';
import type { ActiveStateType } from '../../types';

jest.mock('@core/motions/core/movement/DirectionComponent', () => ({
  DirectionComponent: jest.fn().mockImplementation(() => ({
    updateDirection: jest.fn(),
  })),
}));

jest.mock('@core/motions/core/movement/ImpulseComponent', () => ({
  ImpulseComponent: jest.fn().mockImplementation(() => ({
    applyImpulse: jest.fn(),
  })),
}));

jest.mock('@core/motions/core/forces/GravityComponent', () => ({
  GravityComponent: jest.fn().mockImplementation(() => ({
    applyGravity: jest.fn(),
  })),
}));

jest.mock('@core/motions/controller/AnimationController', () => ({
  AnimationController: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
  })),
}));

const createMockRigidBody = (overrides: Record<string, unknown> = {}) => ({
  linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
  translation: jest.fn().mockReturnValue({ x: 0, y: 0.5, z: 0 }),
  setLinearDamping: jest.fn(),
  setEnabledRotations: jest.fn(),
  setRotation: jest.fn(),
  setLinvel: jest.fn(),
  handle: 1,
  ...overrides,
});

const createMockActiveState = (): ActiveStateType => ({
  euler: new THREE.Euler(),
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  isGround: false,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  angular: new THREE.Vector3(),
});

const createMockGameStates = (): GameStatesType => ({
  canRide: false,
  isRiding: false,
  isJumping: false,
  isFalling: false,
  isMoving: false,
  isRunning: false,
  isNotMoving: true,
  isNotRunning: true,
  isOnTheGround: true,
});

const createDefaultConfig = (): PhysicsConfigType => ({
  walkSpeed: 4,
  runSpeed: 8,
  jumpSpeed: 12,
  linearDamping: 0.9,
  airDamping: 0.2,
  stopDamping: 1,
  maxSpeed: 10,
  accelRatio: 5,
  brakeRatio: 2,
});

const createPhysicsState = (
  overrides: Partial<PhysicsState> = {}
): PhysicsState => ({
  activeState: createMockActiveState(),
  gameStates: createMockGameStates(),
  keyboard: {
    forward: false, backward: false, leftward: false, rightward: false,
    shift: false, space: false, keyZ: false, keyR: false, keyF: false,
    keyE: false, escape: false,
  },
  mouse: {
    target: new THREE.Vector3(), angle: 0, isActive: false, shouldRun: false,
  },
  automationOption: {} as PhysicsState['automationOption'],
  modeType: 'character',
  delta: 0.016,
  ...overrides,
});

describe('PhysicsSystem', () => {
  let system: PhysicsSystem;
  let config: PhysicsConfigType;

  beforeEach(() => {
    config = createDefaultConfig();
    system = new PhysicsSystem(config);
  });

  afterEach(() => {
    if (!system.isDisposed) system.dispose();
  });

  describe('constructor', () => {
    it('기본 상태가 올바르게 초기화되어야 합니다', () => {
      const state = system.getState();
      expect(state.isJumping).toBe(false);
      expect(state.isMoving).toBe(false);
      expect(state.isRunning).toBe(false);
    });

    it('기본 메트릭이 올바르게 초기화되어야 합니다', () => {
      const metrics = system.getMetrics();
      expect(metrics.forcesApplied).toBe(0);
      expect(metrics.dampingChanges).toBe(0);
    });
  });

  describe('updateConfig', () => {
    it('설정을 부분 업데이트할 수 있어야 합니다', () => {
      system.updateConfig({ maxSpeed: 20 });
      const movement = system.calculateMovement(
        { forward: true, backward: false, leftward: false, rightward: false, shift: false, space: false },
        { ...config, maxSpeed: 20 },
        createMockGameStates(),
        0.016,
      );
      expect(movement.length()).toBeGreaterThan(0);
    });
  });

  describe('calculate', () => {
    it('rigidBodyRef.current가 null이면 early return해야 합니다', () => {
      const calcProp = { rigidBodyRef: { current: null } } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState();
      expect(() => system.calculate(calcProp, physicsState)).not.toThrow();
    });

    it('character 모드에서 정상적으로 계산되어야 합니다', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({ modeType: 'character' });

      system.calculate(calcProp, physicsState);
      expect(mockRigidBody.setLinearDamping).toHaveBeenCalled();
      expect(mockRigidBody.setEnabledRotations).toHaveBeenCalled();
    });

    it('vehicle 모드에서 정상적으로 계산되어야 합니다', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({ modeType: 'vehicle' });

      system.calculate(calcProp, physicsState);
      expect(mockRigidBody.setLinearDamping).toHaveBeenCalled();
      expect(mockRigidBody.setEnabledRotations).toHaveBeenCalled();
      expect(mockRigidBody.setRotation).toHaveBeenCalled();
    });

    it('airplane 모드에서 정상적으로 계산되어야 합니다', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({ modeType: 'airplane' });

      system.calculate(calcProp, physicsState);
      expect(mockRigidBody.setEnabledRotations).toHaveBeenCalled();
    });
  });

  describe('checkGround (via calculate)', () => {
    it('지면 가까이에 있고 낙하 속도가 낮으면 isOnTheGround = true', () => {
      const mockRigidBody = createMockRigidBody({
        translation: jest.fn().mockReturnValue({ x: 0, y: 0.5, z: 0 }),
        linvel: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      });
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState();

      system.calculate(calcProp, physicsState);
      expect(physicsState.gameStates.isOnTheGround).toBe(true);
      expect(physicsState.gameStates.isFalling).toBe(false);
    });

    it('높이 있고 떨어지고 있으면 isFalling = true', () => {
      const mockRigidBody = createMockRigidBody({
        translation: jest.fn().mockReturnValue({ x: 0, y: 10, z: 0 }),
        linvel: jest.fn().mockReturnValue({ x: 0, y: -5, z: 0 }),
      });
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState();

      system.calculate(calcProp, physicsState);
      expect(physicsState.gameStates.isOnTheGround).toBe(false);
      expect(physicsState.gameStates.isFalling).toBe(true);
    });
  });

  describe('checkMoving (via calculate)', () => {
    it('키보드 forward 입력 시 isMoving = true', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({
        keyboard: {
          forward: true, backward: false, leftward: false, rightward: false,
          shift: false, space: false, keyZ: false, keyR: false, keyF: false,
          keyE: false, escape: false,
        },
      });

      system.calculate(calcProp, physicsState);
      expect(physicsState.gameStates.isMoving).toBe(true);
      expect(physicsState.gameStates.isNotMoving).toBe(false);
    });

    it('shift + 이동 시 isRunning = true', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({
        keyboard: {
          forward: true, backward: false, leftward: false, rightward: false,
          shift: true, space: false, keyZ: false, keyR: false, keyF: false,
          keyE: false, escape: false,
        },
      });

      system.calculate(calcProp, physicsState);
      expect(physicsState.gameStates.isRunning).toBe(true);
    });

    it('space 입력 시 isJumping = true', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({
        keyboard: {
          forward: false, backward: false, leftward: false, rightward: false,
          shift: false, space: true, keyZ: false, keyR: false, keyF: false,
          keyE: false, escape: false,
        },
      });

      system.calculate(calcProp, physicsState);
      expect(physicsState.gameStates.isJumping).toBe(true);
    });
  });

  describe('calculateMovement', () => {
    it('입력 없으면 zero 벡터를 반환해야 합니다', () => {
      const input = { forward: false, backward: false, leftward: false, rightward: false, shift: false, space: false };
      const result = system.calculateMovement(input, config, createMockGameStates(), 0.016);
      expect(result.length()).toBe(0);
    });

    it('forward 입력 시 z 방향으로 이동해야 합니다', () => {
      const input = { forward: true, backward: false, leftward: false, rightward: false, shift: false, space: false };
      const result = system.calculateMovement(input, config, createMockGameStates(), 0.016);
      expect(result.z).toBeGreaterThan(0);
    });

    it('shift 입력 시 속도가 2배여야 합니다', () => {
      const input = { forward: true, backward: false, leftward: false, rightward: false, shift: false, space: false };
      const normal = system.calculateMovement(input, config, createMockGameStates(), 0.016);

      const shiftInput = { ...input, shift: true };
      const fast = system.calculateMovement(shiftInput, config, createMockGameStates(), 0.016);

      expect(fast.length()).toBeCloseTo(normal.length() * 2, 3);
    });

    it('대각선 이동 시 정규화되어야 합니다', () => {
      const input = { forward: true, backward: false, leftward: true, rightward: false, shift: false, space: false };
      const result = system.calculateMovement(input, config, createMockGameStates(), 1);
      const singleInput = { forward: true, backward: false, leftward: false, rightward: false, shift: false, space: false };
      const single = system.calculateMovement(singleInput, config, createMockGameStates(), 1);
      expect(result.length()).toBeCloseTo(single.length(), 3);
    });
  });

  describe('calculateJump', () => {
    it('지면에 있을 때 점프 벡터를 반환해야 합니다', () => {
      const gameStates = createMockGameStates();
      const result = system.calculateJump(config, gameStates, true);
      expect(result.y).toBe(config.jumpSpeed);
      expect(gameStates.isJumping).toBe(true);
    });

    it('공중에 있을 때 zero 벡터를 반환해야 합니다', () => {
      const gameStates = createMockGameStates();
      const result = system.calculateJump(config, gameStates, false);
      expect(result.length()).toBe(0);
    });
  });

  describe('applyForce', () => {
    it('힘을 적용하면 velocity가 변경되어야 합니다', () => {
      const mockRigidBody = createMockRigidBody({
        linvel: jest.fn().mockReturnValue({ x: 1, y: 0, z: 0 }),
      });
      const force = new THREE.Vector3(2, 0, 0);
      system.applyForce(force, mockRigidBody as any);
      expect(mockRigidBody.setLinvel).toHaveBeenCalledWith(
        expect.objectContaining({ x: 3, y: 0, z: 0 }),
        true,
      );
    });

    it('rigidBody가 null이면 에러 없이 처리해야 합니다', () => {
      const force = new THREE.Vector3(1, 0, 0);
      expect(() => system.applyForce(force, null as any)).not.toThrow();
    });
  });

  describe('addForceComponent', () => {
    it('ForceComponent를 추가할 수 있어야 합니다', () => {
      const mockForce = { update: jest.fn() };
      system.addForceComponent(mockForce as any);
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState();

      system.calculate(calcProp, physicsState);
      expect(mockForce.update).toHaveBeenCalled();
    });
  });

  describe('damping', () => {
    it('character 모드에서 점프/낙하 시 airDamping이 적용되어야 합니다', () => {
      const mockRigidBody = createMockRigidBody({
        translation: jest.fn().mockReturnValue({ x: 0, y: 10, z: 0 }),
        linvel: jest.fn().mockReturnValue({ x: 0, y: -5, z: 0 }),
      });
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState();

      system.calculate(calcProp, physicsState);
      expect(mockRigidBody.setLinearDamping).toHaveBeenCalledWith(config.airDamping);
    });

    it('vehicle 모드에서 space(브레이크) 시 brakeRatio가 적용되어야 합니다', () => {
      const mockRigidBody = createMockRigidBody();
      const calcProp = {
        rigidBodyRef: { current: mockRigidBody },
        innerGroupRef: { current: new THREE.Group() },
      } as unknown as PhysicsCalcProps;
      const physicsState = createPhysicsState({
        modeType: 'vehicle',
        keyboard: {
          forward: false, backward: false, leftward: false, rightward: false,
          shift: false, space: true, keyZ: false, keyR: false, keyF: false,
          keyE: false, escape: false,
        },
      });

      system.calculate(calcProp, physicsState);
      expect(mockRigidBody.setLinearDamping).toHaveBeenCalledWith(config.brakeRatio);
    });
  });
});

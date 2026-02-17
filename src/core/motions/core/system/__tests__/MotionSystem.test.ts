import 'reflect-metadata';
import * as THREE from 'three';

import { MotionSystem } from '../MotionSystem';
import type { ActiveStateType } from '../../types';
import type { GameStatesType } from '@core/world/components/Rideable/types';

const mockMotionService = {
  calculateSpeed: jest.fn((v: THREE.Vector3) =>
    Math.sqrt(v.x * v.x + v.z * v.z)
  ),
  calculateJumpForce: jest.fn(
    (isGrounded: boolean, jumpSpeed: number) =>
      isGrounded ? new THREE.Vector3(0, jumpSpeed, 0) : new THREE.Vector3()
  ),
  calculateMovementForce: jest.fn(
    (movement: THREE.Vector3, _vel: THREE.Vector3, _config: unknown, out?: THREE.Vector3) => {
      const f = out ?? new THREE.Vector3();
      return f.copy(movement);
    }
  ),
  getDefaultConfig: jest.fn().mockReturnValue({
    maxSpeed: 10,
    acceleration: 5,
    jumpForce: 12,
  }),
};

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

const createMockRigidBody = (
  translation = { x: 5, y: 0, z: 10 },
  linvel = { x: 1, y: 0, z: 2 },
  rotation = { x: 0, y: 0, z: 0, w: 1 },
) => ({
  translation: jest.fn().mockReturnValue(translation),
  linvel: jest.fn().mockReturnValue(linvel),
  rotation: jest.fn().mockReturnValue(rotation),
  applyImpulse: jest.fn(),
});

describe('MotionSystem', () => {
  let system: MotionSystem;

  beforeEach(() => {
    system = new MotionSystem({ type: 'character' });
    // @Autowired로 주입되는 motionService를 수동으로 설정
    (system as any).motionService = mockMotionService;
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (!system.isDisposed) system.dispose();
  });

  describe('constructor', () => {
    it('기본 상태가 올바르게 초기화되어야 합니다', () => {
      const state = system.getState();
      expect(state.position).toEqual(new THREE.Vector3());
      expect(state.velocity).toEqual(new THREE.Vector3());
      expect(state.isGrounded).toBe(false);
      expect(state.isMoving).toBe(false);
      expect(state.speed).toBe(0);
    });

    it('기본 메트릭이 올바르게 초기화되어야 합니다', () => {
      const metrics = system.getMetrics();
      expect(metrics.currentSpeed).toBe(0);
      expect(metrics.averageSpeed).toBe(0);
      expect(metrics.totalDistance).toBe(0);
      expect(metrics.isAccelerating).toBe(false);
      expect(metrics.groundContact).toBe(false);
    });
  });

  describe('updatePosition', () => {
    it('위치가 state와 activeState 모두에 업데이트되어야 합니다', () => {
      const pos = new THREE.Vector3(10, 5, 20);
      const activeState = createMockActiveState();
      system.updatePosition(pos, activeState);

      expect(system.getState().position.x).toBe(10);
      expect(system.getState().position.y).toBe(5);
      expect(system.getState().position.z).toBe(20);
      expect(activeState.position.x).toBe(10);
    });

    it('이전 위치가 metrics.lastPosition에 저장되어야 합니다', () => {
      const activeState = createMockActiveState();
      system.updatePosition(new THREE.Vector3(1, 0, 0), activeState);
      system.updatePosition(new THREE.Vector3(5, 0, 0), activeState);

      expect(system.getMetrics().lastPosition.x).toBe(1);
    });
  });

  describe('updateVelocity', () => {
    it('속도가 state와 activeState에 업데이트되어야 합니다', () => {
      const vel = new THREE.Vector3(3, 0, 4);
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();

      system.updateVelocity(vel, activeState, gameStates);
      expect(system.getState().velocity.x).toBe(3);
      expect(system.getState().speed).toBe(5);
      expect(activeState.velocity.z).toBe(4);
    });

    it('속도 > 0.1이면 isMoving = true, gameStates에 반영', () => {
      const vel = new THREE.Vector3(1, 0, 0);
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();

      system.updateVelocity(vel, activeState, gameStates);
      expect(system.getState().isMoving).toBe(true);
      expect(gameStates.isMoving).toBe(true);
      expect(gameStates.isNotMoving).toBe(false);
    });

    it('속도 <= 0.1이면 isMoving = false, gameStates에 반영', () => {
      const vel = new THREE.Vector3(0.05, 0, 0);
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();

      system.updateVelocity(vel, activeState, gameStates);
      expect(system.getState().isMoving).toBe(false);
      expect(gameStates.isNotMoving).toBe(true);
    });

    it('같은 상태면 콜백이 실행되지 않아야 합니다 (updateStateIfChanged)', () => {
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();
      gameStates.isMoving = false;
      gameStates.isNotMoving = true;

      system.updateVelocity(new THREE.Vector3(0, 0, 0), activeState, gameStates);
      expect(gameStates.isNotMoving).toBe(true);
    });
  });

  describe('updateRotation', () => {
    it('회전이 state와 activeState에 업데이트되어야 합니다', () => {
      const rot = new THREE.Euler(0, Math.PI / 4, 0);
      const activeState = createMockActiveState();

      system.updateRotation(rot, activeState);
      expect(system.getState().rotation.y).toBeCloseTo(Math.PI / 4, 5);
      expect(activeState.euler.y).toBeCloseTo(Math.PI / 4, 5);
    });
  });

  describe('setGrounded', () => {
    it('grounded 상태를 모든 참조에 업데이트해야 합니다', () => {
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();

      system.setGrounded(true, activeState, gameStates);
      expect(system.getState().isGrounded).toBe(true);
      expect(system.getMetrics().groundContact).toBe(true);
      expect(activeState.isGround).toBe(true);
      expect(gameStates.isOnTheGround).toBe(true);
    });

    it('false로도 설정할 수 있어야 합니다', () => {
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();

      system.setGrounded(false, activeState, gameStates);
      expect(system.getState().isGrounded).toBe(false);
      expect(gameStates.isOnTheGround).toBe(false);
    });
  });

  describe('performUpdate (via updateWithArgs pattern)', () => {
    it('rigidBody에서 물리 상태를 추출하여 업데이트해야 합니다', () => {
      const mockRigidBody = createMockRigidBody(
        { x: 10, y: 2, z: 15 },
        { x: 3, y: 0, z: 4 },
      );
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();

      system.update({
        deltaTime: 0.016,
        rigidBody: mockRigidBody,
        activeState,
        gameStates,
      } as any);

      const state = system.getState();
      expect(state.position.x).toBe(10);
      expect(state.position.z).toBe(15);
      expect(state.velocity.x).toBe(3);
      expect(state.velocity.z).toBe(4);
    });
  });

  describe('calculateJump', () => {
    it('지면에 있을 때 점프 힘을 반환해야 합니다', () => {
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();
      system.setGrounded(true, activeState, gameStates);

      const jump = system.calculateJump({ jumpSpeed: 15 }, gameStates);
      expect(jump).toBeDefined();
      expect(jump!.y).toBe(15);
    });

    it('공중에 있을 때 zero를 반환해야 합니다', () => {
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();
      system.setGrounded(false, activeState, gameStates);

      const jump = system.calculateJump({ jumpSpeed: 15 }, gameStates);
      expect(jump).toBeDefined();
      expect(jump!.length()).toBe(0);
    });

    it('motionService.calculateJumpForce가 호출되어야 합니다', () => {
      const activeState = createMockActiveState();
      const gameStates = createMockGameStates();
      system.setGrounded(true, activeState, gameStates);

      system.calculateJump({ jumpSpeed: 12 }, gameStates);
      expect(mockMotionService.calculateJumpForce).toHaveBeenCalledWith(true, 12, gameStates);
    });
  });

  describe('applyForce', () => {
    it('motionService를 통해 힘을 계산하고 impulse를 적용해야 합니다', () => {
      const mockRigidBody = createMockRigidBody();
      const movement = new THREE.Vector3(1, 0, 0);
      system.applyForce(movement, mockRigidBody as any);
      expect(mockMotionService.getDefaultConfig).toHaveBeenCalled();
      expect(mockMotionService.calculateMovementForce).toHaveBeenCalled();
      expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('dispose 후 lastPosition이 초기화되어야 합니다', () => {
      const activeState = createMockActiveState();
      system.updatePosition(new THREE.Vector3(100, 50, 200), activeState);
      system.dispose();
      expect(system.getMetrics().lastPosition.x).toBe(0);
    });

    it('dispose 후 update하면 에러가 발생해야 합니다', () => {
      system.dispose();
      expect(() =>
        system.update({
          deltaTime: 0.016,
          rigidBody: createMockRigidBody(),
          activeState: createMockActiveState(),
          gameStates: createMockGameStates(),
        } as any),
      ).toThrow();
    });
  });
});

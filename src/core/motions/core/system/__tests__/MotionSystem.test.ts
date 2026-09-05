import 'reflect-metadata';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { SystemContext } from '@core/boilerplate';
import type { GameStatesType } from '@core/world/components/Rideable/types';

import type { ActiveStateType } from '../../types';
import { MotionSystem, type MotionUpdateArgs } from '../MotionSystem';

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

const injectMockMotionService = (target: MotionSystem): void => {
  (target as unknown as { motionService: typeof mockMotionService }).motionService = mockMotionService;
};

class ForeignVector3Seed {
  readonly isVector3 = true as const;

  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}
}

class ForeignEulerSeed {
  readonly isEuler = true as const;

  constructor(
    public x: number,
    public y: number,
    public z: number,
    public order: THREE.EulerOrder,
  ) {}
}

const createMotionUpdateContext = (
  rigidBody: RapierRigidBody,
  activeState = createMockActiveState(),
  gameStates = createMockGameStates(),
): SystemContext & MotionUpdateArgs => ({
  deltaTime: 0.016,
  totalTime: 0.016,
  frameCount: 1,
  rigidBody,
  activeState,
  gameStates,
});

describe('MotionSystem', () => {
  let system: MotionSystem;

  beforeEach(() => {
    system = new MotionSystem({ type: 'character' });
    // @Autowired로 주입되는 motionService를 수동으로 설정
    injectMockMotionService(system);
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

    it('owns mutable state and metrics references per instance', () => {
      const other = new MotionSystem({ type: 'vehicle' });

      try {
        const state = system.getState();
        const otherState = other.getState();
        const metrics = system.getMetrics();
        const otherMetrics = other.getMetrics();

        expect(state.position).not.toBe(otherState.position);
        expect(state.velocity).not.toBe(otherState.velocity);
        expect(state.rotation).not.toBe(otherState.rotation);
        expect(state.direction).not.toBe(otherState.direction);
        expect(metrics.lastPosition).not.toBe(otherMetrics.lastPosition);

        state.position.set(1, 2, 3);
        state.velocity.set(4, 5, 6);
        state.rotation.set(0.1, 0.2, 0.3);
        state.direction.set(7, 8, 9);
        metrics.lastPosition.set(10, 11, 12);
        otherMetrics.lastPosition.set(13, 14, 15);

        expect(otherState.position).toEqual(new THREE.Vector3());
        expect(otherState.velocity).toEqual(new THREE.Vector3());
        expect(otherState.rotation).toEqual(new THREE.Euler());
        expect(otherState.direction).toEqual(new THREE.Vector3());

        system.dispose();
        expect(otherMetrics.lastPosition).toEqual(new THREE.Vector3(13, 14, 15));
      } finally {
        other.dispose();
      }
    });

    it('copies branded structural seeds into local Three.js instances', () => {
      const position = new ForeignVector3Seed(1, 2, 3);
      const velocity = new ForeignVector3Seed(4, 5, 6);
      const direction = new ForeignVector3Seed(0, 0, -1);
      const lastPosition = new ForeignVector3Seed(-1, -2, -3);
      const rotation = new ForeignEulerSeed(0.1, 0.2, 0.3, 'ZYX');
      const structuralSystem = new MotionSystem({
        type: 'character',
        initialState: { position, velocity, rotation, direction },
        initialMetrics: { lastPosition },
      });

      try {
        const initialState = structuralSystem.getState();
        const initialMetrics = structuralSystem.getMetrics();
        expect(position).not.toBeInstanceOf(THREE.Vector3);
        expect(rotation).not.toBeInstanceOf(THREE.Euler);
        expect(initialState.position).toBeInstanceOf(THREE.Vector3);
        expect(initialState.velocity).toBeInstanceOf(THREE.Vector3);
        expect(initialState.direction).toBeInstanceOf(THREE.Vector3);
        expect(initialState.rotation).toBeInstanceOf(THREE.Euler);
        expect(initialMetrics.lastPosition).toBeInstanceOf(THREE.Vector3);
        expect(initialState.position).not.toBe(position);
        expect(initialState.velocity).not.toBe(velocity);
        expect(initialState.direction).not.toBe(direction);
        expect(initialState.rotation).not.toBe(rotation);
        expect(initialMetrics.lastPosition).not.toBe(lastPosition);

        position.x = 101;
        velocity.y = 105;
        direction.z = 1;
        rotation.order = 'XYZ';
        lastPosition.z = -103;
        initialState.position.set(10, 20, 30);
        initialState.velocity.set(40, 50, 60);
        initialState.direction.set(1, 0, 0);
        initialState.rotation.set(1, 1, 1, 'XYZ');
        initialMetrics.lastPosition.set(-10, -20, -30);
        structuralSystem.reset();

        const resetState = structuralSystem.getState();
        const resetMetrics = structuralSystem.getMetrics();
        expect(resetState.position).toEqual(new THREE.Vector3(1, 2, 3));
        expect(resetState.velocity).toEqual(new THREE.Vector3(4, 5, 6));
        expect(resetState.direction).toEqual(new THREE.Vector3(0, 0, -1));
        expect(resetState.rotation).toEqual(new THREE.Euler(0.1, 0.2, 0.3, 'ZYX'));
        expect(resetMetrics.lastPosition).toEqual(new THREE.Vector3(-1, -2, -3));
        expect(Object.getPrototypeOf(resetState.position)).toBe(THREE.Vector3.prototype);
        expect(Object.getPrototypeOf(resetState.rotation)).toBe(THREE.Euler.prototype);
      } finally {
        structuralSystem.dispose();
      }
    });
  });

  describe('reset', () => {
    it('restores configured seeds with fresh owned references and reset counters', () => {
      const callerPosition = new THREE.Vector3(1, 2, 3);
      const callerVelocity = new THREE.Vector3(4, 5, 6);
      const callerRotation = new THREE.Euler(0.1, 0.2, 0.3, 'ZYX');
      const callerDirection = new THREE.Vector3(0, 0, -1);
      const callerLastPosition = new THREE.Vector3(-1, -2, -3);
      const expectedPosition = callerPosition.clone();
      const expectedVelocity = callerVelocity.clone();
      const expectedRotation = callerRotation.clone();
      const expectedDirection = callerDirection.clone();
      const expectedLastPosition = callerLastPosition.clone();
      const initialStateSeed = {
        position: callerPosition,
        velocity: callerVelocity,
        rotation: callerRotation,
        direction: callerDirection,
        isGrounded: true,
        isMoving: true,
        speed: 9,
        lastUpdate: 123,
      };
      const initialMetricsSeed = {
        currentSpeed: 8,
        averageSpeed: 7,
        totalDistance: 6,
        frameTime: 123,
        physicsTime: 5,
        lastPosition: callerLastPosition,
        isAccelerating: true,
        groundContact: true,
      };
      const seededSystem = new MotionSystem({
        type: 'character',
        initialState: initialStateSeed,
        initialMetrics: initialMetricsSeed,
      });
      injectMockMotionService(seededSystem);

      try {
        const constructedState = seededSystem.getState();
        const constructedMetrics = seededSystem.getMetrics();
        const initialReferences = {
          position: constructedState.position,
          velocity: constructedState.velocity,
          rotation: constructedState.rotation,
          direction: constructedState.direction,
          lastPosition: constructedMetrics.lastPosition,
        };

        expect(initialReferences.position).not.toBe(callerPosition);
        expect(initialReferences.velocity).not.toBe(callerVelocity);
        expect(initialReferences.rotation).not.toBe(callerRotation);
        expect(initialReferences.direction).not.toBe(callerDirection);
        expect(initialReferences.lastPosition).not.toBe(callerLastPosition);

        callerPosition.set(101, 102, 103);
        callerVelocity.set(104, 105, 106);
        callerRotation.set(1, 1.1, 1.2, 'XYZ');
        callerDirection.set(1, 0, 0);
        callerLastPosition.set(-101, -102, -103);
        initialStateSeed.isGrounded = false;
        initialStateSeed.isMoving = false;
        initialStateSeed.speed = 99;
        initialMetricsSeed.currentSpeed = 98;
        initialMetricsSeed.averageSpeed = 97;
        initialMetricsSeed.totalDistance = 96;
        initialMetricsSeed.physicsTime = 95;
        initialMetricsSeed.isAccelerating = false;
        initialMetricsSeed.groundContact = false;

        seededSystem.update({
          deltaTime: 0.016,
          totalTime: 0.016,
          frameCount: 1,
          rigidBody: createMockRigidBody(
            { x: 20, y: 30, z: 40 },
            { x: 10, y: 0, z: 0 },
          ) as unknown as RapierRigidBody,
          activeState: createMockActiveState(),
          gameStates: createMockGameStates(),
        });
        seededSystem.getState().direction.set(1, 0, 0);
        seededSystem.setGrounded(false, createMockActiveState(), createMockGameStates());

        expect(seededSystem.updateCount).toBe(1);
        seededSystem.reset();

        const resetState = seededSystem.getState();
        const resetMetrics = seededSystem.getMetrics();
        expect(resetState.position).toEqual(expectedPosition);
        expect(resetState.velocity).toEqual(expectedVelocity);
        expect(resetState.rotation).toEqual(expectedRotation);
        expect(resetState.direction).toEqual(expectedDirection);
        expect(resetState.isGrounded).toBe(true);
        expect(resetState.isMoving).toBe(true);
        expect(resetState.speed).toBe(9);
        expect(resetState.lastUpdate).toBe(0);
        expect(resetMetrics.currentSpeed).toBe(8);
        expect(resetMetrics.averageSpeed).toBe(7);
        expect(resetMetrics.totalDistance).toBe(6);
        expect(resetMetrics.physicsTime).toBe(5);
        expect(resetMetrics.lastPosition).toEqual(expectedLastPosition);
        expect(resetMetrics.isAccelerating).toBe(true);
        expect(resetMetrics.groundContact).toBe(true);
        expect(resetMetrics.frameTime).toBe(0);
        expect(seededSystem.updateCount).toBe(0);

        expect(resetState.position).not.toBe(initialReferences.position);
        expect(resetState.velocity).not.toBe(initialReferences.velocity);
        expect(resetState.rotation).not.toBe(initialReferences.rotation);
        expect(resetState.direction).not.toBe(initialReferences.direction);
        expect(resetMetrics.lastPosition).not.toBe(initialReferences.lastPosition);
        expect(resetState.position).not.toBe(callerPosition);
        expect(resetState.velocity).not.toBe(callerVelocity);
        expect(resetState.rotation).not.toBe(callerRotation);
        expect(resetState.direction).not.toBe(callerDirection);
        expect(resetMetrics.lastPosition).not.toBe(callerLastPosition);

        expect(callerPosition).toEqual(new THREE.Vector3(101, 102, 103));
        expect(callerVelocity).toEqual(new THREE.Vector3(104, 105, 106));
        expect(callerRotation).toEqual(new THREE.Euler(1, 1.1, 1.2, 'XYZ'));
        expect(callerDirection).toEqual(new THREE.Vector3(1, 0, 0));
        expect(callerLastPosition).toEqual(new THREE.Vector3(-101, -102, -103));
        expect(initialStateSeed.speed).toBe(99);
        expect(initialMetricsSeed.currentSpeed).toBe(98);
      } finally {
        seededSystem.dispose();
      }
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

      system.update(
        createMotionUpdateContext(
          mockRigidBody as unknown as RapierRigidBody,
          activeState,
          gameStates,
        ),
      );

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
      system.applyForce(movement, mockRigidBody as unknown as RapierRigidBody);
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
        system.update(
          createMotionUpdateContext(
            createMockRigidBody() as unknown as RapierRigidBody,
          ),
        ),
      ).toThrow();
    });
  });
});

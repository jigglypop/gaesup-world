import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { SystemContext } from '@core/boilerplate';
import type { GameStatesType } from '@core/world/components/Rideable/types';

import type { MotionUpdateArgs } from '../../core/system/MotionSystem';
import type { ActiveStateType } from '../../core/types';
import { MotionBridge } from '../MotionBridge';

const ENTITY_ID = 'motion-entity';

const createActiveState = (): ActiveStateType => ({
  euler: new THREE.Euler(),
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  isGround: false,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  angular: new THREE.Vector3(),
});

const createGameStates = (): GameStatesType => ({
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

function createRigidBodyHarness(initialVelocity = { x: 3, y: 0, z: 4 }) {
  let translation = { x: 6, y: 2, z: -4 };
  let velocity = { ...initialVelocity };
  const rotation = { x: 0, y: 0, z: 0, w: 1 };
  const setTranslation = jest.fn((next: { x: number; y: number; z: number }) => {
    translation = { ...next };
  });
  const setLinvel = jest.fn((next: { x: number; y: number; z: number }) => {
    velocity = { ...next };
  });
  const rigidBody = {
    translation: jest.fn(() => translation),
    linvel: jest.fn(() => velocity),
    rotation: jest.fn(() => rotation),
    setTranslation,
    setLinvel,
    applyImpulse: jest.fn(),
    setRotation: jest.fn(),
  } as unknown as RapierRigidBody;

  return { rigidBody, setTranslation, setLinvel };
}

describe('MotionBridge reset ownership', () => {
  let bridge: MotionBridge;

  beforeEach(() => {
    bridge = new MotionBridge();
  });

  afterEach(() => {
    bridge.dispose();
  });

  it('resets engine values while preserving cached snapshot identities and config', () => {
    const { rigidBody, setTranslation, setLinvel } = createRigidBodyHarness();
    bridge.register(ENTITY_ID, 'character', rigidBody);
    bridge.execute(ENTITY_ID, {
      type: 'setConfig',
      data: {
        config: {
          maxSpeed: 24,
          acceleration: 9,
          jumpForce: 18,
        },
      },
    });

    const entity = bridge.getEngine(ENTITY_ID);
    expect(entity).toBeDefined();
    if (!entity) throw new Error('Expected registered motion entity');

    const updateContext: SystemContext & MotionUpdateArgs = {
      deltaTime: 0.016,
      totalTime: 0.016,
      frameCount: 1,
      rigidBody,
      activeState: createActiveState(),
      gameStates: createGameStates(),
    };
    entity.system.update(updateContext);
    entity.system.setGrounded(true, createActiveState(), createGameStates());

    const beforeReset = bridge.snapshot(ENTITY_ID);
    expect(beforeReset).not.toBeNull();
    if (!beforeReset) throw new Error('Expected motion snapshot');
    expect(beforeReset.speed).toBe(5);
    expect(beforeReset.metrics.currentSpeed).toBe(5);
    expect(beforeReset.metrics.totalDistance).toBeGreaterThan(0);
    expect(beforeReset.isGrounded).toBe(true);

    const identities = {
      position: beforeReset.position,
      velocity: beforeReset.velocity,
      rotation: beforeReset.rotation,
      metrics: beforeReset.metrics,
      config: beforeReset.config,
    };
    const listener = jest.fn();
    bridge.subscribe(listener);

    bridge.execute(ENTITY_ID, { type: 'reset' });

    const afterReset = bridge.snapshot(ENTITY_ID);
    expect(afterReset).toBe(beforeReset);
    expect(afterReset?.position).toBe(identities.position);
    expect(afterReset?.velocity).toBe(identities.velocity);
    expect(afterReset?.rotation).toBe(identities.rotation);
    expect(afterReset?.metrics).toBe(identities.metrics);
    expect(afterReset?.config).toBe(identities.config);
    expect(afterReset?.config).toEqual({
      maxSpeed: 24,
      acceleration: 9,
      jumpForce: 18,
    });
    expect(afterReset?.position).toEqual(new THREE.Vector3());
    expect(afterReset?.velocity).toEqual(new THREE.Vector3());
    expect(afterReset?.rotation.x).toBeCloseTo(0);
    expect(afterReset?.rotation.y).toBeCloseTo(0);
    expect(afterReset?.rotation.z).toBeCloseTo(0);
    expect(afterReset?.isGrounded).toBe(false);
    expect(afterReset?.isMoving).toBe(false);
    expect(afterReset?.speed).toBe(0);
    expect(afterReset?.metrics).toEqual({
      currentSpeed: 0,
      averageSpeed: 0,
      totalDistance: 0,
      frameTime: 0,
      isAccelerating: false,
    });
    expect(entity.system.updateCount).toBe(0);
    expect(setTranslation).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 }, true);
    expect(setLinvel).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 }, true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(beforeReset, ENTITY_ID);
  });
});

describe('MotionBridge player lookup', () => {
  it('is null while no player is mounted, whatever else is registered', () => {
    const bridge = new MotionBridge();
    const { rigidBody } = createRigidBodyHarness();
    try {
      bridge.register('npc', 'character', rigidBody);
      expect(bridge.getPlayerEntityId()).toBeNull();
      bridge.register('player', 'character', rigidBody);
      bridge.setPlayerEntity('player');
      expect(bridge.getPlayerEntityId()).toBe('player');
      // Edit mode unmounts the player entity.
      bridge.unregister('player');
      expect(bridge.getPlayerEntityId()).toBeNull();
    } finally {
      bridge.dispose();
    }
  });
});

describe('MotionBridge command contract', () => {
  const CONFIG = { maxSpeed: 4, acceleration: 2, jumpForce: 7 };
  let bridge: MotionBridge;
  beforeEach(() => { bridge = new MotionBridge(); });
  afterEach(() => bridge.dispose());

  function registered(velocity: { x: number; y: number; z: number }, type: 'character' | 'airplane' = 'character') {
    const harness = createRigidBodyHarness(velocity);
    bridge.register(ENTITY_ID, type, harness.rigidBody);
    bridge.execute(ENTITY_ID, { type: 'setConfig', data: { config: CONFIG } });
    return harness;
  }

  it('move steers toward the configured max speed with the configured acceleration and leaves a fall alone', () => {
    const { rigidBody } = registered({ x: 1, y: -5, z: 0 });
    bridge.execute(ENTITY_ID, { type: 'move', data: { movement: new THREE.Vector3(2, 0, 0) } });
    const [impulse] = jest.mocked(rigidBody.applyImpulse).mock.lastCall ?? [];
    expect(impulse).toMatchObject({ x: (4 - 1) * 2, y: 0, z: 0 });
  });

  it('airplanes steer vertically too', () => {
    const { rigidBody } = registered({ x: 0, y: 0, z: 0 }, 'airplane');
    bridge.execute(ENTITY_ID, { type: 'move', data: { movement: new THREE.Vector3(0, 3, 0) } });
    expect(jest.mocked(rigidBody.applyImpulse).mock.lastCall?.[0]).toMatchObject({ x: 0, y: 4 * 2, z: 0 });
  });

  it('jump leaves the ground at jumpForce and keeps the horizontal speed', () => {
    const { rigidBody, setLinvel } = registered({ x: 3, y: 0, z: 4 });
    bridge.reportGrounded(ENTITY_ID, true);
    bridge.execute(ENTITY_ID, { type: 'jump' });
    expect(setLinvel).toHaveBeenLastCalledWith({ x: 3, y: 7, z: 4 }, true);
    expect(rigidBody.applyImpulse).not.toHaveBeenCalled();
  });

  it('turn faces the body toward the given yaw and ignores a non-finite one', () => {
    const { rigidBody } = registered({ x: 0, y: 0, z: 0 });
    bridge.execute(ENTITY_ID, { type: 'turn', data: { direction: Math.PI / 2 } });
    const rotation = jest.mocked(rigidBody.setRotation).mock.lastCall?.[0];
    const yaw = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(rotation?.x, rotation?.y, rotation?.z, rotation?.w)).y;
    expect(yaw).toBeCloseTo(Math.PI / 2);
    bridge.execute(ENTITY_ID, { type: 'turn', data: { direction: Number.NaN } });
    expect(rigidBody.setRotation).toHaveBeenCalledTimes(1);
  });
});

import 'reflect-metadata';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { GameStatesType } from '@core/world/components/Rideable/types';

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

function createRigidBodyHarness() {
  let translation = { x: 6, y: 2, z: -4 };
  let velocity = { x: 3, y: 0, z: 4 };
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

    entity.system.update({
      deltaTime: 0.016,
      totalTime: 0.016,
      frameCount: 1,
      rigidBody,
      activeState: createActiveState(),
      gameStates: createGameStates(),
    });
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

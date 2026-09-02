import 'reflect-metadata';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { GameStatesType } from '@core/world/components/Rideable/types';

import type { PhysicsConfigType } from '../../core/config';
import type { ActiveStateType } from '../../core/types';
import type { PhysicsCalcProps, PhysicsState } from '../../types';
import { PhysicsBridge } from '../PhysicsBridge';

const ENTITY_ID = 'physics-config-entity';

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

function createPhysicsState(): PhysicsState {
  return {
    activeState: createActiveState(),
    gameStates: createGameStates(),
    keyboard: {
      forward: true,
      backward: false,
      leftward: false,
      rightward: false,
      shift: false,
      space: false,
      keyZ: false,
      keyR: false,
      keyF: false,
      keyE: false,
      escape: false,
    },
    mouse: {
      target: new THREE.Vector3(),
      angle: 0,
      isActive: false,
      shouldRun: false,
    },
    automationOption: {} as PhysicsState['automationOption'],
    modeType: 'character',
    delta: 0.016,
  };
}

function createRigidBodyHarness() {
  const applyImpulse = jest.fn();
  const setGravityScale = jest.fn();
  const setLinearDamping = jest.fn();
  const rigidBody = {
    handle: 1,
    linvel: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
    translation: jest.fn(() => ({ x: 0, y: 0.5, z: 0 })),
    mass: jest.fn(() => 2),
    applyImpulse,
    setGravityScale,
    setLinearDamping,
    setEnabledRotations: jest.fn(),
    setRotation: jest.fn(),
    setLinvel: jest.fn(),
  } as unknown as RapierRigidBody;

  return { rigidBody, applyImpulse, setGravityScale, setLinearDamping };
}

describe('PhysicsBridge config propagation', () => {
  it('applies one update to child and parent calculations in the next frame', () => {
    const bridge = new PhysicsBridge();
    const initialConfig: PhysicsConfigType = {
      walkSpeed: 4,
      normalGravityScale: 1,
      linearDamping: 0.9,
    };
    const nextConfig: PhysicsConfigType = {
      ...initialConfig,
      walkSpeed: 13,
      normalGravityScale: 2.5,
      linearDamping: 0.42,
    };
    const { rigidBody, applyImpulse, setGravityScale, setLinearDamping } =
      createRigidBodyHarness();
    const physicsState = createPhysicsState();
    const calcProp = {
      rigidBodyRef: { current: rigidBody },
      inputRef: {
        current: {
          keyboard: physicsState.keyboard,
          mouse: physicsState.mouse,
        },
      },
    } as unknown as PhysicsCalcProps;

    try {
      bridge.register(ENTITY_ID, initialConfig);
      bridge.execute(ENTITY_ID, { type: 'updateConfig', data: nextConfig });
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expect(bridge.getEngine(ENTITY_ID)).toBeDefined();
      expect(applyImpulse).toHaveBeenCalledWith(
        expect.objectContaining({ x: 0, y: 0, z: -26 }),
        true,
      );
      expect(setGravityScale).toHaveBeenCalledWith(2.5, false);
      expect(setLinearDamping).toHaveBeenCalledWith(0.42);
    } finally {
      bridge.dispose();
    }
  });
});

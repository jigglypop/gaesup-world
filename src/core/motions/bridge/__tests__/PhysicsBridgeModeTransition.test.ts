import 'reflect-metadata';

import type { RootState } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { GameStatesType } from '@core/world/components/Rideable/types';
import { useGaesupStore } from '@stores/gaesupStore';

import type { PhysicsConfigType } from '../../core/config';
import type { ActiveStateType } from '../../core/types';
import type { PhysicsCalcProps, PhysicsState } from '../../types';
import { PhysicsBridge } from '../PhysicsBridge';

const ENTITY_ID = 'physics-mode-transition-entity';

const CONFIG: PhysicsConfigType = {
  walkSpeed: 4,
  runSpeed: 8,
  jumpSpeed: 12,
  linearDamping: 0.4,
  brakeRatio: 0.8,
  normalGravityScale: 1.7,
  gravityScale: 0.25,
  angleDelta: new THREE.Vector3(0.1, 0.1, 0.1),
  maxAngle: new THREE.Vector3(0.5, Math.PI, 0.4),
};

function createActiveState(): ActiveStateType {
  return {
    euler: new THREE.Euler(0, 0.7, 0),
    position: new THREE.Vector3(7, 0.5, -2),
    quaternion: new THREE.Quaternion(),
    isGround: false,
    velocity: new THREE.Vector3(3, 0, 4),
    direction: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    angular: new THREE.Vector3(),
  };
}

function createGameStates(): GameStatesType {
  return {
    canRide: false,
    isRiding: false,
    isJumping: false,
    isFalling: false,
    isMoving: false,
    isRunning: false,
    isNotMoving: true,
    isNotRunning: true,
    isOnTheGround: true,
  };
}

function createPhysicsState(modeType: PhysicsState['modeType']): PhysicsState {
  return {
    activeState: createActiveState(),
    gameStates: createGameStates(),
    keyboard: {
      forward: false,
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
    automationOption: useGaesupStore.getState().automation,
    modeType,
    delta: 0.016,
  };
}

function createRigidBodyHarness() {
  const applyImpulse = jest.fn();
  const setGravityScale = jest.fn<void, [number, boolean]>();
  const setLinearDamping = jest.fn<void, [number]>();
  const setEnabledRotations = jest.fn<void, [boolean, boolean, boolean, boolean]>();
  const setRotation = jest.fn<
    void,
    [{ x: number; y: number; z: number; w: number }, boolean]
  >();
  const rigidBody = {
    handle: 31,
    linvel: jest.fn(() => ({ x: 3, y: 0, z: 4 })),
    translation: jest.fn(() => ({ x: 7, y: 0.5, z: -2 })),
    mass: jest.fn(() => 2),
    applyImpulse,
    setGravityScale,
    setLinearDamping,
    setEnabledRotations,
    setRotation,
    setLinvel: jest.fn(),
  } as unknown as RapierRigidBody;

  return {
    rigidBody,
    applyImpulse,
    setGravityScale,
    setLinearDamping,
    setEnabledRotations,
    setRotation,
  };
}

function createCalcProp(
  rigidBody: RapierRigidBody,
  innerGroup: THREE.Group,
  physicsState: PhysicsState,
): PhysicsCalcProps {
  return {
    rigidBodyRef: { current: rigidBody },
    innerGroupRef: { current: innerGroup },
    state: {} as RootState,
    delta: 0.016,
    worldContext: useGaesupStore.getState(),
    dispatch: jest.fn(),
    inputRef: {
      current: {
        keyboard: physicsState.keyboard,
        mouse: physicsState.mouse,
      },
    },
    setKeyboardInput: jest.fn(),
    setMouseInput: jest.fn(),
  };
}

function expectQuaternionClose(
  actual: { x: number; y: number; z: number; w: number } | undefined,
  expected: THREE.Quaternion,
): void {
  expect(actual?.x).toBeCloseTo(expected.x);
  expect(actual?.y).toBeCloseTo(expected.y);
  expect(actual?.z).toBeCloseTo(expected.z);
  expect(actual?.w).toBeCloseTo(expected.w);
}

describe('PhysicsBridge mode transitions', () => {
  it('normalizes airplane transients and restores vehicle and character ownership', () => {
    const bridge = new PhysicsBridge();
    const physicsState = createPhysicsState('airplane');
    physicsState.keyboard.forward = true;
    physicsState.keyboard.rightward = true;
    const innerGroup = new THREE.Group();
    const {
      rigidBody,
      setGravityScale,
      setLinearDamping,
      setEnabledRotations,
      setRotation,
    } = createRigidBodyHarness();
    const calcProp = createCalcProp(rigidBody, innerGroup, physicsState);

    try {
      bridge.register(ENTITY_ID, CONFIG);
      const retainedEngine = bridge.getEngine(ENTITY_ID);
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expect(setGravityScale).toHaveBeenLastCalledWith(0.25, false);
      expect(physicsState.activeState.direction.lengthSq()).toBeGreaterThan(0);
      expect(Math.abs(physicsState.activeState.euler.x)).toBeGreaterThan(0);
      expect(Math.abs(physicsState.activeState.euler.z)).toBeGreaterThan(0);
      const retainedHeading = physicsState.activeState.euler.y;
      const retainedPosition = physicsState.activeState.position.clone();
      const retainedVelocity = physicsState.activeState.velocity.clone();

      physicsState.modeType = 'vehicle';
      physicsState.keyboard.forward = false;
      physicsState.keyboard.rightward = false;
      physicsState.gameStates.isJumping = true;
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expect(bridge.getEngine(ENTITY_ID)).toBe(retainedEngine);
      expect(setGravityScale).toHaveBeenLastCalledWith(1.7, false);
      expect(setLinearDamping).toHaveBeenLastCalledWith(0.4);
      expect(setEnabledRotations).toHaveBeenLastCalledWith(false, true, false, false);
      expect(physicsState.activeState.direction.lengthSq()).toBe(0);
      expect(physicsState.activeState.dir.lengthSq()).toBe(0);
      expect(physicsState.activeState.euler.x).toBe(0);
      expect(physicsState.activeState.euler.z).toBe(0);
      expect(physicsState.gameStates.isJumping).toBe(false);
      expect(innerGroup.rotation.x).toBe(0);
      expect(innerGroup.rotation.y).toBe(0);
      expect(innerGroup.rotation.z).toBe(0);
      const expectedBodyYaw = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, retainedHeading, 0),
      );
      expectQuaternionClose(setRotation.mock.calls.at(-1)?.[0], expectedBodyYaw);
      expect(physicsState.activeState.position).toEqual(retainedPosition);
      expect(physicsState.activeState.velocity).toEqual(retainedVelocity);

      innerGroup.rotation.set(0.3, -0.4, -0.2);
      physicsState.activeState.direction.set(1, 2, 3);
      physicsState.activeState.dir.set(3, 2, 1);
      physicsState.gameStates.isJumping = true;
      physicsState.keyboard.space = true;
      physicsState.modeType = 'character';
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expect(bridge.getEngine(ENTITY_ID)).toBe(retainedEngine);
      expectQuaternionClose(setRotation.mock.calls.at(-1)?.[0], new THREE.Quaternion());
      expectQuaternionClose(innerGroup.quaternion, expectedBodyYaw);
      expect(physicsState.activeState.euler.y).toBe(retainedHeading);
      expect(physicsState.activeState.euler.x).toBe(0);
      expect(physicsState.activeState.euler.z).toBe(0);
      expect(physicsState.activeState.direction.lengthSq()).toBe(0);
      expect(physicsState.activeState.dir.lengthSq()).toBe(0);
      expect(physicsState.gameStates.isJumping).toBe(false);
      expect(setEnabledRotations).toHaveBeenLastCalledWith(false, false, false, false);
      expect(physicsState.activeState.position).toEqual(retainedPosition);
      expect(physicsState.activeState.velocity).toEqual(retainedVelocity);
    } finally {
      bridge.dispose();
    }
  });

  it('transfers yaw while focused and keeps the direct PhysicsState mode authoritative', () => {
    const bridge = new PhysicsBridge();
    const physicsState = createPhysicsState('airplane');
    const innerGroup = new THREE.Group();
    const {
      rigidBody,
      applyImpulse,
      setGravityScale,
      setLinearDamping,
      setEnabledRotations,
      setRotation,
    } = createRigidBodyHarness();
    const calcProp = createCalcProp(rigidBody, innerGroup, physicsState);
    const expectedYaw = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, physicsState.activeState.euler.y, 0),
    );

    try {
      bridge.register(ENTITY_ID, CONFIG);
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });
      expect(setGravityScale).toHaveBeenLastCalledWith(0.25, false);
      expect(setLinearDamping).toHaveBeenLastCalledWith(0.4);
      const initialImpulseCount = applyImpulse.mock.calls.length;
      const retainedPosition = physicsState.activeState.position.clone();
      const retainedVelocity = physicsState.activeState.velocity.clone();

      calcProp.worldContext = {
        ...calcProp.worldContext,
        cameraOption: {
          ...calcProp.worldContext.cameraOption,
          focus: true,
        },
        mode: {
          ...calcProp.worldContext.mode,
          type: 'airplane',
        },
      };
      physicsState.modeType = 'vehicle';
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expectQuaternionClose(setRotation.mock.calls.at(-1)?.[0], expectedYaw);
      expectQuaternionClose(innerGroup.quaternion, new THREE.Quaternion());
      expect(setGravityScale).toHaveBeenLastCalledWith(1.7, false);
      expect(setLinearDamping).toHaveBeenLastCalledWith(0.4);
      expect(setEnabledRotations).toHaveBeenLastCalledWith(false, true, false, false);
      expect(applyImpulse).toHaveBeenCalledTimes(initialImpulseCount);
      expect(physicsState.activeState.position).toEqual(retainedPosition);
      expect(physicsState.activeState.velocity).toEqual(retainedVelocity);

      calcProp.worldContext = {
        ...calcProp.worldContext,
        cameraOption: {
          ...calcProp.worldContext.cameraOption,
          focus: false,
        },
      };
      physicsState.modeType = 'airplane';
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expect(setGravityScale).toHaveBeenLastCalledWith(0.25, false);
      expect(setLinearDamping).toHaveBeenLastCalledWith(0.4);
      expect(setEnabledRotations).toHaveBeenLastCalledWith(false, false, false, false);
      const airplaneImpulseCount = applyImpulse.mock.calls.length;

      calcProp.worldContext = {
        ...calcProp.worldContext,
        cameraOption: {
          ...calcProp.worldContext.cameraOption,
          focus: true,
        },
      };
      physicsState.modeType = 'character';
      bridge.updateEntity(ENTITY_ID, {
        deltaTime: 0.016,
        calcProp,
        physicsState,
      });

      expectQuaternionClose(setRotation.mock.calls.at(-1)?.[0], new THREE.Quaternion());
      expectQuaternionClose(innerGroup.quaternion, expectedYaw);
      expect(setGravityScale).toHaveBeenLastCalledWith(1.7, false);
      expect(setLinearDamping).toHaveBeenLastCalledWith(0.4);
      expect(setEnabledRotations).toHaveBeenLastCalledWith(false, false, false, false);
      expect(applyImpulse).toHaveBeenCalledTimes(airplaneImpulseCount);
      expect(physicsState.activeState.position).toEqual(retainedPosition);
      expect(physicsState.activeState.velocity).toEqual(retainedVelocity);
    } finally {
      bridge.dispose();
    }
  });
});

import * as THREE from 'three';

import { createMemoryInputBackend } from '../../../../interactions/core/adapter';
import type { PhysicsCalcProps, PhysicsInputState, PhysicsState } from '../../../types';
import { DirectionComponent, steeringTickScale } from '../DirectionComponent';

function fixture(modeType: 'vehicle' | 'airplane', delta: number) {
  const backend = createMemoryInputBackend();
  const input: PhysicsInputState = { keyboard: backend.getKeyboard(), mouse: backend.getMouse(), gamepad: backend.getGamepad!() };
  const props = { inputRef: { current: input }, state: {}, delta } as unknown as PhysicsCalcProps;
  const state = {
    modeType,
    activeState: { dir: new THREE.Vector3(), direction: new THREE.Vector3(), euler: new THREE.Euler() },
  } as PhysicsState;
  const innerGroup = new THREE.Group();
  const component = new DirectionComponent(undefined, backend);
  return {
    backend,
    state,
    innerGroup,
    tick: () => component.updateDirection(state, 'normal', props, { current: innerGroup }),
  };
}

function simulate(modeType: 'vehicle' | 'airplane', hz: number, seconds: number, stick: THREE.Vector2) {
  const f = fixture(modeType, 1 / hz);
  f.backend.updateGamepad!({ connected: true, leftStick: stick });
  const ticks = Math.round(hz * seconds);
  for (let i = 0; i < ticks; i++) f.tick();
  return f;
}

test('steeringTickScale maps elapsed time to 60 Hz ticks and bounds stalls', () => {
  expect(steeringTickScale(undefined)).toBe(1);
  expect(steeringTickScale(Number.NaN)).toBe(1);
  expect(steeringTickScale(1 / 60)).toBeCloseTo(1);
  expect(steeringTickScale(1 / 144)).toBeCloseTo(60 / 144);
  expect(steeringTickScale(-1)).toBe(0);
  expect(steeringTickScale(2)).toBe(4);
});

test('vehicle yaw per second is identical at 30, 60 and 144 Hz', () => {
  const stick = new THREE.Vector2(1, -1);
  const yaw = [30, 60, 144].map((hz) => simulate('vehicle', hz, 1, stick).state.activeState.euler.y);
  expect(yaw[1]).toBeCloseTo(-Math.PI / 64 * 60, 6);
  expect(yaw[0]).toBeCloseTo(yaw[1]!, 6);
  expect(yaw[2]).toBeCloseTo(yaw[1]!, 6);
});

test('airplane heading and tilt converge the same way regardless of tick rate', () => {
  const stick = new THREE.Vector2(1, 1);
  // 1/3 s is a whole number of ticks at every rate (10, 20 and 48).
  const results = [30, 60, 144].map((hz) => simulate('airplane', hz, 1 / 3, stick));
  const [slow, reference, fast] = results.map((f) => ({
    heading: f.state.activeState.euler.y,
    roll: f.innerGroup.rotation.z,
    pitch: f.innerGroup.rotation.x,
  }));
  expect(reference!.heading).not.toBe(0);
  expect(reference!.roll).not.toBe(0);
  for (const other of [slow!, fast!]) {
    expect(other.heading).toBeCloseTo(reference!.heading, 6);
    expect(other.roll).toBeCloseTo(reference!.roll, 2);
    expect(other.pitch).toBeCloseTo(reference!.pitch, 2);
  }
});

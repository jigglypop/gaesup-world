import * as THREE from 'three';

import { DirectionComponent } from '../DirectionComponent';
import { createMemoryInputBackend } from '../../../../interactions/core/adapter';
import type { PhysicsCalcProps, PhysicsInputState, PhysicsState } from '../../../types';

function fixture() {
  const backend = createMemoryInputBackend(); const camera = new THREE.PerspectiveCamera(); camera.lookAt(1, 0, 0); camera.updateMatrixWorld();
  const input: PhysicsInputState = { keyboard: backend.getKeyboard(), mouse: backend.getMouse(), gamepad: backend.getGamepad!() };
  const props = { inputRef: { current: input }, state: { camera } } as unknown as PhysicsCalcProps;
  const state = { modeType: 'character', activeState: { dir: new THREE.Vector3(), direction: new THREE.Vector3(), euler: new THREE.Euler() } } as PhysicsState;
  const component = new DirectionComponent(undefined, backend);
  return { backend, input, props, state, tick: () => component.updateDirection(state, 'normal', props), component };
}

test('camera-relative character motion retains half/full analog strength and caps mixed diagonal input', () => {
  const f = fixture();
  f.backend.updateGamepad!({ connected: true, leftStick: new THREE.Vector2(0, -0.5) }); f.tick();
  expect(f.state.activeState.dir.length()).toBeCloseTo(0.5); expect(f.state.activeState.dir.x).toBeCloseTo(-0.5); expect(f.state.activeState.dir.z).toBeCloseTo(0);
  f.backend.updateGamepad!({ leftStick: new THREE.Vector2(0, -1) }); f.tick(); expect(f.state.activeState.dir.length()).toBeCloseTo(1);
  f.backend.updateKeyboard({ rightward: true }); f.tick(); expect(f.state.activeState.dir.length()).toBeCloseTo(1);
  f.backend.updateKeyboard({ rightward: false }); f.backend.updateGamepad!({ connected: false }); f.tick(); expect(f.state.activeState.dir.length()).toBe(0); f.component.dispose();
});

test('explicit NPC inputs do not inherit player sticks and opposing keys clear old movement', () => {
  const f = fixture(); f.backend.updateGamepad!({ connected: true, leftStick: new THREE.Vector2(1, 0) }); delete f.input.gamepad;
  f.tick(); expect(f.state.activeState.dir.length()).toBe(0);
  f.backend.updateKeyboard({ forward: true }); f.tick(); expect(f.state.activeState.dir.length()).toBe(1);
  f.backend.updateKeyboard({ backward: true }); f.tick(); expect(f.state.activeState.dir.length()).toBe(0); f.component.dispose();
});

test('vehicle steering does not attenuate throttle when both controls are at full strength', () => {
  const f = fixture(); f.state.modeType = 'vehicle'; f.backend.updateGamepad!({ connected: true, leftStick: new THREE.Vector2(1, -1) }); f.tick();
  expect(f.state.activeState.euler.y).toBeCloseTo(-Math.PI / 64); expect(f.state.activeState.direction.length()).toBeCloseTo(1);
  f.backend.updateGamepad!({ leftStick: new THREE.Vector2(0, -0.5) }); f.tick(); expect(f.state.activeState.direction.length()).toBeCloseTo(0.5); f.component.dispose();
});

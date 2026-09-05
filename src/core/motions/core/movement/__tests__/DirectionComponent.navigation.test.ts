import * as THREE from 'three';

import { createInteractionInputAdapter } from '../../../../interactions/core';
import {
  clearClickNavigationRoute,
  getClickNavigationRoute,
  setClickNavigationRoute,
} from '../../../../navigation/ClickNavigationRoute';
import type { PhysicsCalcProps, PhysicsInputState, PhysicsState } from '../../../types';
import { DirectionComponent } from '../DirectionComponent';

function createFixture() {
  const inputBackend = createInteractionInputAdapter();
  const mouse = {
    ...inputBackend.getMouse(),
    target: new THREE.Vector3(),
    isActive: true,
    shouldRun: false,
    angle: 0,
  };
  const input = { keyboard: inputBackend.getKeyboard(), mouse };
  const position = new THREE.Vector3();
  const setMouseInput = jest.fn((updates: Partial<PhysicsInputState['mouse']>) => {
    Object.assign(mouse, updates);
  });
  const props = {
    inputRef: { current: input },
    rigidBodyRef: { current: { translation: () => position } },
    setMouseInput,
  } as unknown as PhysicsCalcProps;
  const state = {
    modeType: 'character',
    activeState: { dir: new THREE.Vector3(), direction: new THREE.Vector3(), euler: new THREE.Euler() },
  } as unknown as PhysicsState;
  const component = new DirectionComponent();
  return { mouse, position, setMouseInput, component, tick: () => component.updateDirection(state, 'normal', props) };
}

afterEach(clearClickNavigationRoute);

test('retains waypoint progression without dispatching identical input on every frame', () => {
  const fixture = createFixture();
  const first = new THREE.Vector3(10, 0, 0);
  const second = new THREE.Vector3(10, 0, 10);
  setClickNavigationRoute([first, second], 0.5, false);
  fixture.tick();
  expect(fixture.setMouseInput).toHaveBeenCalledTimes(1);
  for (let frame = 0; frame < 120; frame++) fixture.tick();
  expect(fixture.setMouseInput).toHaveBeenCalledTimes(1);
  expect(getClickNavigationRoute()).toHaveLength(2);
  fixture.position.copy(first);
  fixture.tick();
  expect(fixture.mouse.target).toEqual(second);
  expect(fixture.setMouseInput).toHaveBeenCalledTimes(2);
  fixture.position.copy(second);
  fixture.tick();
  expect(fixture.mouse.isActive).toBe(false);
  expect(getClickNavigationRoute()).toHaveLength(0);
  fixture.component.dispose();
});

test('updates steering after displacement and propagates changed run settings', () => {
  const fixture = createFixture();
  const target = new THREE.Vector3(10, 0, 0);
  setClickNavigationRoute([target], 0.5, false);
  fixture.tick();
  fixture.position.z = 2;
  fixture.tick();
  expect(fixture.mouse.angle).toBeCloseTo(Math.atan2(-2, 10));
  expect(fixture.setMouseInput).toHaveBeenCalledTimes(2);
  setClickNavigationRoute([target], 0.5, true);
  fixture.tick();
  expect(fixture.mouse.shouldRun).toBe(true);
  expect(fixture.setMouseInput).toHaveBeenCalledTimes(3);
  fixture.component.dispose();
});

test('honors a sub-meter threshold at intermediate and final waypoints', () => {
  const fixture = createFixture();
  const first = new THREE.Vector3(10, 0, 0);
  const second = new THREE.Vector3(10, 0, 10);
  setClickNavigationRoute([first, second], 0.5, false);
  fixture.position.set(9.25, 0, 0);
  fixture.tick();
  expect(fixture.mouse.isActive).toBe(true);
  expect(getClickNavigationRoute()).toHaveLength(2);
  fixture.position.set(9.75, 0, 0);
  fixture.tick();
  expect(fixture.mouse.target).toEqual(second);
  expect(getClickNavigationRoute()).toHaveLength(1);
  fixture.position.set(10, 0, 9.25);
  fixture.tick();
  expect(fixture.mouse.isActive).toBe(true);
  fixture.position.set(10, 0, 9.75);
  fixture.tick();
  expect(fixture.mouse.isActive).toBe(false);
  expect(getClickNavigationRoute()).toHaveLength(0);
  expect(fixture.setMouseInput).toHaveBeenLastCalledWith({
    isActive: false,
    shouldRun: false,
    hasArrived: true,
  });
  fixture.component.dispose();
});

import type { Vector3 } from 'three';

import { CharacterMovementComponent } from '../CharacterMovementComponent';
import type { ComponentContext } from '../../types';

test.each([0, 0.2, 1])('air control %s preserves momentum and is independent of frame rate', (airControl) => {
  const results = [30, 60, 120].map(fps => {
    const component = new CharacterMovementComponent({ walkSpeed: 5, runSpeed: 10, jumpHeight: 1, airControl });
    const velocity = { x: 3, y: -2, z: 0 };
    const context = {
      rigidBodyRef: { current: {
        linvel: () => velocity,
        setLinvel: (next: Vector3) => Object.assign(velocity, next),
      } },
      deltaTime: 1 / fps, entityId: 'air',
      movementInput: { forward: true, isGrounded: false },
    } as unknown as ComponentContext;
    try {
      context.deltaTime = 0;
      component.update(context);
      expect(velocity).toEqual({ x: 3, y: -2, z: 0 });
      context.deltaTime = 1 / fps;
      for (let frame = 0; frame < fps / 10; frame++) component.update(context);
      const steered = { ...velocity };
      context.movementInput = { isGrounded: false };
      component.update(context);
      expect(velocity).toEqual(steered);
      expect(velocity.y).toBe(-2);
      if (airControl === 0) expect(velocity).toEqual({ x: 3, y: -2, z: 0 });
      else expect(velocity.z).toBeLessThan(0);
      return steered;
    } finally {
      component.dispose();
    }
  });
  for (const result of results) {
    expect(result.x).toBeCloseTo(results[0]!.x, 8);
    expect(result.z).toBeCloseTo(results[0]!.z, 8);
  }
});

test('decelerates equally over the same duration at 30, 60 and 120 FPS', () => {
  const speeds = [30, 60, 120].map(fps => {
    const component = new CharacterMovementComponent({ walkSpeed: 5, runSpeed: 10, jumpHeight: 1, airControl: 0.2 });
    let speed = 0;
    const context = {
      rigidBodyRef: { current: {
        linvel: () => ({ x: 0, y: 0, z: 0 }),
        setLinvel: (velocity: Vector3) => { speed = Math.hypot(velocity.x, velocity.z); },
      } },
      deltaTime: 1 / fps,
      entityId: `movement-${fps}`,
      movementInput: { forward: true, isGrounded: true },
    } as unknown as ComponentContext;
    try {
      component.update(context);
      expect(speed).toBeCloseTo(5);
      context.movementInput = { isGrounded: true };
      context.deltaTime = 0;
      component.update(context);
      expect(speed).toBeCloseTo(5);
      context.deltaTime = 1 / fps;
      for (let frame = 0; frame < fps / 2; frame++) component.update(context);
      return speed;
    } finally {
      component.dispose();
    }
  });
  expect(speeds[0]).toBeCloseTo(speeds[1]!, 8);
  expect(speeds[2]).toBeCloseTo(speeds[1]!, 8);
  expect(speeds[1]).toBeLessThan(0.25);
});

test('reuses movement velocity while retaining camera rotation, diagonal speed and gravity', () => {
  const component = new CharacterMovementComponent({
    walkSpeed: 5,
    runSpeed: 10,
    jumpHeight: 1,
    airControl: 0.2,
  });
  const setLinvel = jest.fn((_velocity: Vector3, _wake: boolean) => {});
  const context = {
    rigidBodyRef: { current: { linvel: () => ({ x: 0, y: -3, z: 0 }), setLinvel } },
    deltaTime: 1 / 60,
    entityId: 'movement-test',
  } as unknown as ComponentContext;
  try {
    context.movementInput = { forward: true, cameraYaw: Math.PI / 2, isGrounded: true };
    component.update(context);
    const velocity = setLinvel.mock.calls[0]![0];
    expect(velocity.x).toBeCloseTo(-5);
    expect(velocity.z).toBeCloseTo(0);
    expect(velocity.y).toBe(-3);
    context.movementInput = { forward: true, rightward: true, run: true, cameraYaw: 0, isGrounded: true };
    for (let frame = 0; frame < 120; frame++) component.update(context);
    expect(Math.hypot(velocity.x, velocity.z)).toBeCloseTo(10);
    expect(velocity.x).toBeCloseTo(-velocity.z);
    expect(velocity.y).toBe(-3);
    expect(setLinvel.mock.calls.every(([value]) => value === velocity)).toBe(true);
    context.movementInput = { isGrounded: true };
    component.update(context);
    expect(Math.hypot(velocity.x, velocity.z)).toBeCloseTo(9);
    expect(velocity.y).toBe(-3);
  } finally {
    component.dispose();
  }
});

test('jumps only on a grounded press and leaves uncontrolled bodies untouched', () => {
  const component = new CharacterMovementComponent({ walkSpeed: 5, runSpeed: 10, jumpHeight: 2, airControl: 0.2 });
  const setLinvel = jest.fn();
  const context = {
    rigidBodyRef: { current: { linvel: () => ({ x: 0, y: -3, z: 0 }), setLinvel } },
    deltaTime: 1 / 60,
    entityId: 'jump-test',
  } as unknown as ComponentContext;
  component.update(context);
  expect(setLinvel).not.toHaveBeenCalled();
  context.movementInput = { jump: true, isGrounded: true };
  component.update(context);
  expect(setLinvel.mock.calls.at(-1)?.[0].y).toBeCloseTo(Math.sqrt(2 * 9.81 * 2));
  component.update(context);
  expect(setLinvel.mock.calls.at(-1)?.[0].y).toBe(-3);
  context.movementInput = { jump: false, isGrounded: false };
  component.update(context);
  context.movementInput.jump = true;
  component.update(context);
  expect(setLinvel.mock.calls.at(-1)?.[0].y).toBe(-3);
  context.movementInput = { jump: false, isGrounded: true };
  component.update(context);
  context.movementInput.jump = true;
  component.update(context);
  expect(setLinvel.mock.calls.at(-1)?.[0].y).toBeCloseTo(Math.sqrt(2 * 9.81 * 2));
  setLinvel.mockClear();
  context.movementInput = undefined;
  component.update(context);
  expect(setLinvel).not.toHaveBeenCalled();
  component.dispose();
});

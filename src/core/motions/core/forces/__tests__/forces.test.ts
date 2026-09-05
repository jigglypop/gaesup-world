import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { BuoyancyComponent } from '../BuoyancyComponent';
import { WindComponent } from '../WindComponent';

function createRigidBody(position = { x: 0, y: 0, z: 0 }) {
  return {
    addForce: jest.fn(),
    translation: jest.fn(() => position),
  } as unknown as RapierRigidBody & {
    addForce: jest.Mock;
    translation: jest.Mock;
  };
}

describe('force components', () => {
  test('WindComponent applies normalized directional force', () => {
    const body = createRigidBody();
    const wind = new WindComponent({}, new THREE.Vector3(2, 0, 0), 4);

    wind.update(body, 0.5);

    expect(body.addForce).toHaveBeenCalledWith({ x: 2, y: 0, z: 0 }, true);
  });

  test('WindComponent ignores zero strength', () => {
    const body = createRigidBody();
    const wind = new WindComponent({}, [1, 0, 0], 0);

    wind.update(body, 1);

    expect(body.addForce).not.toHaveBeenCalled();
  });

  test('BuoyancyComponent applies upward force below water level', () => {
    const body = createRigidBody({ x: 0, y: -2, z: 0 });
    const buoyancy = new BuoyancyComponent({ buoyancy: 3 }, 1);

    buoyancy.update(body, 0.5);

    expect(body.addForce).toHaveBeenCalledWith({ x: 0, y: 4.5, z: 0 }, true);
  });

  test('BuoyancyComponent ignores bodies above water level', () => {
    const body = createRigidBody({ x: 0, y: 2, z: 0 });
    const buoyancy = new BuoyancyComponent({ buoyancy: 3 }, 1);

    buoyancy.update(body, 0.5);

    expect(body.addForce).not.toHaveBeenCalled();
  });
});

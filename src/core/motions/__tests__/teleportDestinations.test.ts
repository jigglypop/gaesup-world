import * as THREE from 'three';

import {
  createTeleportDestination,
  findTeleportDestination,
  teleportDestinationToVector3,
} from '../teleportDestinations';

describe('teleport destinations', () => {
  test('normalizes tuple, object, and Vector3 positions', () => {
    expect(createTeleportDestination({ id: 'tuple', name: 'Tuple', position: [1, 2, 3] }).position).toEqual([1, 2, 3]);
    expect(createTeleportDestination({ id: 'object', name: 'Object', position: { x: 4, y: 5, z: 6 } }).position).toEqual([4, 5, 6]);
    expect(createTeleportDestination({ id: 'vector', name: 'Vector', position: new THREE.Vector3(7, 8, 9) }).position).toEqual([7, 8, 9]);
  });

  test('applies marker defaults and preserves explicit marker settings', () => {
    expect(createTeleportDestination({ id: 'default', name: 'Default', position: [0, 0, 0] })).toMatchObject({
      radius: 1.4,
      markerColor: '#61dafb',
    });
    expect(
      createTeleportDestination({
        id: 'custom',
        name: 'Custom',
        position: [0, 0, 0],
        radius: 2,
        markerColor: '#ff0000',
      }),
    ).toMatchObject({
      radius: 2,
      markerColor: '#ff0000',
    });
  });

  test('converts destinations back to Vector3 and finds by id', () => {
    const destination = createTeleportDestination({ id: 'spawn', name: 'Spawn', position: [1, 2, 3] });
    const position = teleportDestinationToVector3(destination);

    expect(position).toBeInstanceOf(THREE.Vector3);
    expect(position.toArray()).toEqual([1, 2, 3]);
    expect(findTeleportDestination([destination], 'spawn')).toBe(destination);
    expect(findTeleportDestination([destination], 'missing')).toBeUndefined();
  });
});

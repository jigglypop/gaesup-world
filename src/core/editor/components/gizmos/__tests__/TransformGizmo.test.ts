import * as THREE from 'three';

import {
  applySceneTransform,
  object3DToSceneTransform,
  snapSceneTransform,
} from '../TransformGizmo';

describe('TransformGizmo helpers', () => {
  test('applies scene transform to Object3D', () => {
    const object = new THREE.Object3D();

    applySceneTransform(object, {
      position: [1, 2, 3],
      rotation: [0.1, 0.2, 0.3],
      scale: [2, 3, 4],
    });

    expect(object.position.toArray()).toEqual([1, 2, 3]);
    expect([object.rotation.x, object.rotation.y, object.rotation.z]).toEqual([0.1, 0.2, 0.3]);
    expect(object.scale.toArray()).toEqual([2, 3, 4]);
  });

  test('reads Object3D transform as scene transform', () => {
    const object = new THREE.Object3D();
    object.position.set(4, 5, 6);
    object.rotation.set(0.4, 0.5, 0.6);
    object.scale.set(1, 2, 3);

    expect(object3DToSceneTransform(object)).toEqual({
      position: [4, 5, 6],
      rotation: [0.4, 0.5, 0.6],
      scale: [1, 2, 3],
    });
  });

  test('snaps transform channels independently', () => {
    expect(snapSceneTransform({
      position: [1.2, 1.7, -0.2],
      rotation: [0.24, 0.51, 0.74],
      scale: [0.9, 1.3, 1.8],
    }, {
      translationSnap: 0.5,
      rotationSnap: 0.25,
      scaleSnap: 0.25,
    })).toEqual({
      position: [1, 1.5, -0],
      rotation: [0.25, 0.5, 0.75],
      scale: [1, 1.25, 1.75],
    });
  });
});

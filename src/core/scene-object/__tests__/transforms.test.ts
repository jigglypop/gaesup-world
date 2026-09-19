import { Euler, Matrix4, Quaternion, Vector3 } from 'three';

import { createSceneDocument } from '../core';
import { loadSceneRuntime } from '../runtime';
import { sceneTransformToMatrix } from '../transforms';
import type { SceneTransform } from '../types';

function reference(transform: SceneTransform) {
  return new Matrix4().compose(new Vector3(...transform.position),
    new Quaternion().setFromEuler(new Euler(...transform.rotation)), new Vector3(...transform.scale));
}

test('rotated and scaled parents move child positions; nested matrices match Three.js', () => {
  const document = createSceneDocument({ id: 'nested', objects: [
    { id: 'root', transform: { rotation: [0, 0, Math.PI / 2], scale: [2, 2, 2] } },
    { id: 'child', parentId: 'root', transform: { position: [1, 0, 0] } },
    { id: 'leaf', parentId: 'child', transform: { rotation: [0.2, -0.5, 1], scale: [-1, 2, 3] } },
  ] });
  const runtime = loadSceneRuntime(document).runtime!;
  const child = runtime.getWorldTransform('child')!;
  expect(child.position[0]).toBeCloseTo(0);
  expect(child.position[1]).toBeCloseTo(2);
  const expected = reference(document.objects[0]!.transform)
    .multiply(reference(document.objects[1]!.transform)).multiply(reference(document.objects[2]!.transform));
  const actual = runtime.getWorldMatrix('leaf')!;
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index]!, 10));
  sceneTransformToMatrix(runtime.getWorldTransform('leaf')!).forEach((value, index) =>
    expect(value).toBeCloseTo(expected.elements[index]!, 10));
});

test('preserves shear through multiple ancestors and rejects lossy TRS conversion', () => {
  const document = createSceneDocument({ id: 'shear', objects: [
    { id: 'root', transform: { scale: [2, 1, 3] } },
    { id: 'child', parentId: 'root', transform: { rotation: [0, 0, Math.PI / 4] } },
    { id: 'leaf', parentId: 'child', transform: { position: [1, 2, 3] } },
  ] });
  const runtime = loadSceneRuntime(document).runtime!;
  const expected = document.objects.reduce((matrix, object) => matrix.multiply(reference(object.transform)), new Matrix4());
  runtime.getWorldMatrix('leaf')!.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index]!, 10));
  expect(() => runtime.getWorldTransform('leaf')).toThrow('Sheared');
});

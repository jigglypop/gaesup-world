import { Matrix4, Quaternion, Vector3 } from 'three';

import { createSceneDocument } from '../core';
import { sceneTransformToMatrix } from '../transforms';
import { exportUnityScene, importUnityScene } from '../unity';

test('Unity bridge round-trips hierarchy, local matrices and opaque component metadata', () => {
  const scene = createSceneDocument({ id: 'unity', name: 'Room', objects: [
    { id: 'parent', transform: { position: [1, 2, 3], rotation: [0.2, 0.7, -0.6], scale: [2, 1, 3] } },
    { id: 'child', parentId: 'parent', tags: ['prop'], transform: { rotation: [0, Math.PI / 2, 0] },
      components: [{ type: 'custom', data: { assetId: 'chair', nested: { text: '안녕' } } }] },
  ] });
  const dto = exportUnityScene(scene);
  expect(dto.objects[0]!.position).toEqual([1, 2, -3]);
  const roundtrip = importUnityScene(JSON.stringify(dto));
  roundtrip.objects.forEach((object, index) => {
    expect(object.components).toEqual(scene.objects[index]!.components);
    expect(object.parentId).toEqual(scene.objects[index]!.parentId);
    const actual = sceneTransformToMatrix(object.transform);
    const original = sceneTransformToMatrix(scene.objects[index]!.transform);
    actual.forEach((value, i) => expect(value).toBeCloseTo(original[i]!, 7));
  });
  const reflection = new Matrix4().makeScale(1, 1, -1);
  const original = new Matrix4().fromArray(sceneTransformToMatrix(scene.objects[0]!.transform));
  const unity = new Matrix4().compose(
    new Vector3(...dto.objects[0]!.position),
    new Quaternion(...dto.objects[0]!.rotation),
    new Vector3(...dto.objects[0]!.scale),
  );
  const expected = reflection.clone().multiply(original).multiply(reflection);
  unity.elements.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index]!, 10));
});

test('rejects unsupported formats, invalid hierarchy and zero quaternions', () => {
  const dto = exportUnityScene(createSceneDocument({ id: 'test', objects: [{ id: 'a' }] }));
  expect(() => importUnityScene({ ...dto, version: 2 })).toThrow();
  dto.objects[0]!.parentId = 'missing';
  expect(() => importUnityScene(dto)).toThrow();
  dto.objects[0]!.parentId = '';
  dto.objects[0]!.rotation = [0, 0, 0, 0];
  expect(() => importUnityScene(dto)).toThrow();
});

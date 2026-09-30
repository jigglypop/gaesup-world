import { createSceneComponent, createSceneDocument } from '../../scene-object/core';
import type { SceneDocument, SceneObject } from '../../scene-object/types';
import { createPrefabDocument } from '../core';
import {
  addPrefabInstance,
  getPrefabInstanceObjects,
  propagatePrefabToDocument,
  replaceWithPrefabInstance,
  revertPrefabInstance,
  revertPrefabInstanceOverride,
} from '../instances';
import { computePrefabOverrides, createPrefabInstance } from '../overrides';

function createLampPrefab(color = '#ffcc00', bulbY = 2) {
  return createPrefabDocument({
    id: 'lamp',
    name: 'Lamp',
    objects: [
      { id: 'root', name: 'Lamp', transform: { position: [0, 0, 0] } },
      {
        id: 'bulb',
        name: 'Bulb',
        parentId: 'root',
        transform: { position: [0, bulbY, 0] },
        components: [createSceneComponent({ id: 'light', type: 'game.light', data: { color } })],
      },
    ],
  });
}

function createVillage(instances: SceneObject[][]): SceneDocument {
  return createSceneDocument({
    id: 'scene',
    objects: [
      { id: 'village', name: 'Village' },
      ...instances.flat(),
      { id: 'tree', name: 'Tree' },
    ],
  });
}

function editBulb(document: SceneDocument, bulbId: string, patch: Partial<SceneObject>): SceneDocument {
  return {
    ...document,
    objects: document.objects.map((object) => (object.id === bulbId ? { ...object, ...patch } : object)),
  };
}

describe('prefab 인스턴스 문서 연산', () => {
  test('override 하나를 되돌리면서 다른 오브젝트, 순서, 외부 부모 연결을 유지한다', () => {
    const prefab = createLampPrefab();
    const { objects, link } = createPrefabInstance(prefab, { idPrefix: 'lamp-1', parentId: 'village' });
    const edited = editBulb(createVillage([objects]), 'lamp-1:bulb', { name: 'Custom', tags: ['lit'] });
    const nameOverride = computePrefabOverrides(prefab, getPrefabInstanceObjects(edited.objects, link), link)
      .find((override) => override.kind === 'property' && override.path === 'name')!;

    const reverted = revertPrefabInstanceOverride(edited, prefab, link, nameOverride);

    expect(reverted.objects.map((object) => object.id)).toEqual(['village', 'lamp-1:root', 'lamp-1:bulb', 'tree']);
    expect(reverted.objects.find((object) => object.id === 'lamp-1:root')?.parentId).toBe('village');
    const bulb = reverted.objects.find((object) => object.id === 'lamp-1:bulb');
    expect(bulb?.name).toBe('Bulb');
    expect(bulb?.tags).toEqual(['lit']);
  });

  test('인스턴스 전체 되돌리기는 수정·추가·삭제를 원본으로 돌리고 루트 위치만 남긴다', () => {
    const prefab = createLampPrefab();
    const { objects, link } = createPrefabInstance(prefab, {
      idPrefix: 'lamp-1',
      rootTransform: { position: [5, 0, 5] },
    });
    const placed = createVillage([objects]);
    const edited: SceneDocument = {
      ...placed,
      objects: [
        ...placed.objects
          .filter((object) => object.id !== 'lamp-1:bulb')
          .map((object) => (object.id === 'lamp-1:root' ? { ...object, name: 'Renamed' } : object)),
        { ...placed.objects[0]!, id: 'lamp-1:extra', name: 'Extra', parentId: 'lamp-1:root' },
      ],
    };

    const reverted = revertPrefabInstance(edited, prefab, link);

    expect(getPrefabInstanceObjects(reverted.objects, link).map((object) => object.id)).toEqual([
      'lamp-1:root',
      'lamp-1:bulb',
    ]);
    const root = reverted.objects.find((object) => object.id === 'lamp-1:root');
    expect(root?.name).toBe('Lamp');
    expect(root?.transform.position).toEqual([5, 0, 5]);
  });

  test('기존 서브트리를 같은 위치와 부모를 가진 prefab 인스턴스로 바꾸고 새 인스턴스를 뒤에 배치한다', () => {
    const prefab = createLampPrefab();
    const scene = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'village', name: 'Village' },
        { id: 'lamp', name: 'Lamp', parentId: 'village', transform: { position: [3, 0, 1] } },
        { id: 'lamp-bulb', name: 'Bulb', parentId: 'lamp' },
        { id: 'tree', name: 'Tree' },
      ],
    });

    const linked = replaceWithPrefabInstance(scene, 'lamp', prefab, 'lamp-1');
    expect(linked.objects.map((object) => object.id)).toEqual(['village', 'lamp-1:root', 'lamp-1:bulb', 'tree']);
    const root = linked.objects[1]!;
    expect(root.parentId).toBe('village');
    expect(root.transform.position).toEqual([3, 0, 1]);
    expect(replaceWithPrefabInstance(scene, 'missing', prefab, 'lamp-1')).toBe(scene);

    const placed = addPrefabInstance(linked, prefab, { idPrefix: 'lamp-2' });
    expect(placed.objects.slice(-2).map((object) => object.id)).toEqual(['lamp-2:root', 'lamp-2:bulb']);
  });

  test('prefab 변경을 같은 prefab의 모든 인스턴스에 전파하고 각자의 override를 유지한다', () => {
    const previous = createLampPrefab('#ffcc00', 2);
    const next = createLampPrefab('#ffffff', 4);
    const first = createPrefabInstance(previous, { idPrefix: 'lamp-1' });
    const second = createPrefabInstance(previous, { idPrefix: 'lamp-2', rootTransform: { position: [9, 0, 0] } });
    const document = editBulb(createVillage([first.objects, second.objects]), 'lamp-2:bulb', { name: 'Custom' });

    const propagated = propagatePrefabToDocument(document, previous, next);

    const find = (id: string) => propagated.objects.find((object) => object.id === id);
    expect(find('lamp-1:bulb')?.transform.position).toEqual([0, 4, 0]);
    expect(find('lamp-1:bulb')?.components[0]?.data).toEqual({ color: '#ffffff' });
    expect(find('lamp-2:bulb')?.name).toBe('Custom');
    expect(find('lamp-2:bulb')?.transform.position).toEqual([0, 4, 0]);
    expect(find('lamp-2:root')?.transform.position).toEqual([9, 0, 0]);
    expect(find('tree')).toBe(document.objects.find((object) => object.id === 'tree'));
  });
});

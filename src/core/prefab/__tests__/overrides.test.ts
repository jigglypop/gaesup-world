import { createSceneComponent } from '../../scene-object/core';
import { createPrefabDocument } from '../core';
import {
  applyInstanceToPrefab,
  computePrefabOverrides,
  createPrefabInstance,
  createPrefabVariant,
  propagatePrefabChanges,
  readPrefabInstanceLink,
  revertPrefabOverride,
} from '../overrides';

function createLampPrefab(color = '#ffcc00') {
  return createPrefabDocument({
    id: 'lamp',
    objects: [
      { id: 'root', name: 'Lamp', transform: { position: [0, 0, 0] } },
      {
        id: 'bulb',
        name: 'Bulb',
        parentId: 'root',
        transform: { position: [0, 2, 0] },
        components: [createSceneComponent({ id: 'light', type: 'game.light', data: { color } })],
      },
    ],
  });
}

describe('prefab override', () => {
  test('인스턴스 루트에 링크를 붙이고 수정이 없으면 override가 없다', () => {
    const prefab = createLampPrefab();
    const { objects, link } = createPrefabInstance(prefab, { idPrefix: 'lamp-1', rootTransform: { position: [5, 0, 5] } });
    expect(readPrefabInstanceLink(objects[0]!)).toEqual({ prefabId: 'lamp', idPrefix: 'lamp-1' });
    expect(computePrefabOverrides(prefab, objects, link)).toEqual([]);
  });

  test('이름, transform, 컴포넌트 데이터, 추가 객체를 override로 추적한다', () => {
    const prefab = createLampPrefab();
    const { objects, link } = createPrefabInstance(prefab, { idPrefix: 'lamp-1' });
    const edited = objects.map((object) => {
      if (object.id !== 'lamp-1:bulb') return object;
      return {
        ...object,
        name: 'Red Bulb',
        transform: { ...object.transform, position: [0, 3, 0] as const },
        components: object.components.map((component) => ({ ...component, data: { color: '#ff0000' } })),
      };
    });
    edited.push({ ...objects[1]!, id: 'lamp-1:extra', name: 'Extra', components: [] });
    const overrides = computePrefabOverrides(prefab, edited, link);
    expect(overrides.map((override) => override.kind)).toEqual(['property', 'property', 'componentData', 'addedObject']);
  });

  test('원본 변경을 전파하면서 인스턴스 override와 루트 위치를 유지한다', () => {
    const previous = createLampPrefab('#ffcc00');
    const { objects, link } = createPrefabInstance(previous, { idPrefix: 'lamp-1', rootTransform: { position: [5, 0, 5] } });
    const renamed = objects.map((object) => (object.id === 'lamp-1:bulb' ? { ...object, name: 'Custom' } : object));
    const next = createPrefabDocument({
      id: 'lamp',
      objects: [
        { id: 'root', name: 'Lamp', transform: { position: [0, 0, 0] } },
        {
          id: 'bulb',
          name: 'Bulb',
          parentId: 'root',
          transform: { position: [0, 4, 0] },
          components: [createSceneComponent({ id: 'light', type: 'game.light', data: { color: '#ffffff' } })],
        },
      ],
    });
    const updated = propagatePrefabChanges(previous, next, renamed, link);
    const bulb = updated.find((object) => object.id === 'lamp-1:bulb');
    expect(bulb?.name).toBe('Custom');
    expect(bulb?.transform.position).toEqual([0, 4, 0]);
    expect(bulb?.components[0]?.data).toEqual({ color: '#ffffff' });
    expect(updated.find((object) => object.id === 'lamp-1:root')?.transform.position).toEqual([5, 0, 5]);
  });

  test('override 하나만 되돌리고 나머지는 유지한다', () => {
    const prefab = createLampPrefab();
    const { objects, link } = createPrefabInstance(prefab, { idPrefix: 'lamp-1' });
    const edited = objects.map((object) =>
      object.id === 'lamp-1:bulb' ? { ...object, name: 'Custom', tags: ['lit'] } : object,
    );
    const nameOverride = computePrefabOverrides(prefab, edited, link).find(
      (override) => override.kind === 'property' && override.path === 'name',
    )!;
    const reverted = revertPrefabOverride(prefab, edited, link, nameOverride);
    const bulb = reverted.find((object) => object.id === 'lamp-1:bulb');
    expect(bulb?.name).toBe('Bulb');
    expect(bulb?.tags).toEqual(['lit']);
  });

  test('인스턴스 변경을 prefab에 반영하고 variant를 만든다', () => {
    const prefab = createLampPrefab();
    const { objects, link } = createPrefabInstance(prefab, { idPrefix: 'lamp-1' });
    const edited = objects.map((object) => (object.id === 'lamp-1:bulb' ? { ...object, name: 'Applied' } : object));
    const applied = applyInstanceToPrefab(prefab, edited, link);
    expect(applied.objects.find((object) => object.id === 'bulb')?.name).toBe('Applied');
    expect(applied.id).toBe('lamp');
    const variant = createPrefabVariant(prefab, {
      id: 'lamp-red',
      overrides: [{ kind: 'componentData', objectId: 'bulb', componentId: 'light', data: { color: '#ff0000' }, enabled: true }],
    });
    expect(variant.objects.find((object) => object.id === 'bulb')?.components[0]?.data).toEqual({ color: '#ff0000' });
    expect(prefab.objects.find((object) => object.id === 'bulb')?.components[0]?.data).toEqual({ color: '#ffcc00' });
  });
});

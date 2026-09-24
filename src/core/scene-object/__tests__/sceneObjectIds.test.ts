import type { SceneDocument } from '../types';

type CoreModule = typeof import('../core');

function loadFreshCore(): CoreModule {
  let core: CoreModule | undefined;
  jest.isolateModules(() => {
    core = jest.requireActual<CoreModule>('../core');
  });
  return core!;
}

describe('scene object ids', () => {
  it('does not collide with objects saved before a reload', () => {
    const before = loadFreshCore();
    const saved: SceneDocument = JSON.parse(JSON.stringify(before.createSceneDocument({
      id: 'saved',
      objects: [before.createSceneObject({ components: [before.createSceneComponent({ type: 'tag' })] })],
    })));

    const after = loadFreshCore();
    const object = after.createSceneObject({ components: [after.createSceneComponent({ type: 'tag' })] });
    const result = after.validateSceneDocument({ ...saved, objects: [...saved.objects, object] });

    expect(result.issues.filter((issue) => issue.code === 'duplicate-object-id')).toEqual([]);
    expect(object.id).not.toBe(saved.objects[0]!.id);
    expect(object.components[0]!.id).not.toBe(saved.objects[0]!.components[0]!.id);
  });

  it('keeps explicit ids', () => {
    const { createSceneObject } = loadFreshCore();
    expect(createSceneObject({ id: 'plant' }).id).toBe('plant');
  });
});

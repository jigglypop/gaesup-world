import { createSceneDocumentController } from '../controller';
import { createSceneDocument } from '../core';
import { SceneDocumentManager, type SceneManagerEvent } from '../manager';

function createManager() {
  const controller = createSceneDocumentController(createSceneDocument({ id: 'world', objects: [{ id: 'ground' }] }));
  const manager = new SceneDocumentManager(controller);
  const events: SceneManagerEvent['type'][] = [];
  manager.subscribe((event) => events.push(event.type));
  return { controller, manager, events };
}

describe('SceneDocumentManager', () => {
  test('단일 로드는 문서를 교체한다', async () => {
    const { controller, manager, events } = createManager();
    manager.register('house', () => createSceneDocument({ id: 'house', objects: [{ id: 'bed' }] }));
    await expect(manager.load('house')).resolves.toBe(true);
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['bed']);
    expect(events).toEqual(['loading', 'loaded']);
  });

  test('additive 로드는 접두사를 붙여 병합하고 언로드하면 해당 객체만 제거한다', async () => {
    const { controller, manager } = createManager();
    manager.register('props', () =>
      JSON.stringify(createSceneDocument({ id: 'props', objects: [{ id: 'table' }, { id: 'cup', parentId: 'table' }] })),
    );
    await manager.load('props', { additive: true });
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['ground', 'props:table', 'props:cup']);
    expect(controller.getSnapshot().objects[2]?.parentId).toBe('props:table');
    expect(manager.unload('props')).toBe(true);
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['ground']);
  });

  test('등록되지 않았거나 잘못된 씬은 실패 이벤트를 내고 문서를 유지한다', async () => {
    const { controller, manager, events } = createManager();
    await expect(manager.load('missing')).resolves.toBe(false);
    manager.register('broken', () => '{not json');
    await expect(manager.load('broken')).resolves.toBe(false);
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['ground']);
    expect(events).toEqual(['failed', 'loading', 'failed']);
  });
});

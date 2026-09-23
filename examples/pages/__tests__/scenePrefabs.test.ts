import { createSceneDocumentController } from 'gaesup-world';
import { createEditorCommandStack, createSceneObjectEditorCommands } from 'gaesup-world/editor';

import { createInitialWorldSceneDocument } from '../world/sceneDocument';
import { createWorldScenePrefabLibrary } from '../world/scenePrefabs';

const ROOT_ID = 'example-prefab-1-1:world-origin-marker';
const DETAIL_ID = 'example-prefab-1-1:world-origin-marker-detail';
const PLACED_ROOT_ID = 'example-prefab-1-2:world-origin-marker';
const PLACED_DETAIL_ID = 'example-prefab-1-2:world-origin-marker-detail';

function setup() {
  const controller = createSceneDocumentController(createInitialWorldSceneDocument());
  const stack = createEditorCommandStack();
  const library = createWorldScenePrefabLibrary({
    controller,
    commands: createSceneObjectEditorCommands(controller),
    execute: async (_label, createCommand) => {
      await stack.execute(createCommand());
      return true;
    },
  });
  const find = (id: string) => controller.getSnapshot().objects.find((object) => object.id === id);
  return { controller, stack, library, find };
}

describe('world scene prefab library', () => {
  test('선택 객체로 prefab을 만들고 배치한 인스턴스에 적용 결과를 전파하며 되돌리기로 라이브러리도 복원한다', async () => {
    const { controller, stack, library, find } = setup();

    expect(await library.create('world-origin-marker')).toBe(ROOT_ID);
    expect(find(ROOT_ID)?.transform.position).toEqual([8, 1, -6]);
    expect(find(DETAIL_ID)?.parentId).toBe(ROOT_ID);
    expect(find('world-origin-marker')).toBeUndefined();
    const prefab = library.getPrefabs()[0]!;

    expect(await library.place(prefab.id)).toBe(true);
    expect(find(PLACED_ROOT_ID)?.transform.position).toEqual([10, 1, -6]);

    controller.dispatch({ type: 'scene-object.update', objectId: DETAIL_ID, patch: { name: 'Custom detail' } });
    expect(await library.apply(ROOT_ID, prefab)).toBe(true);
    expect(find(PLACED_DETAIL_ID)?.name).toBe('Custom detail');
    expect(library.getPrefabs()[0]?.objects.find((object) => object.id === 'world-origin-marker-detail')?.name)
      .toBe('Custom detail');

    await stack.undo();
    expect(library.getPrefabs()[0]).toBe(prefab);
    expect(find(PLACED_DETAIL_ID)?.name).toBe('하위 장면 표식');
  });

  test('없는 객체나 이미 prefab 인스턴스인 객체로는 만들지 않고 없는 prefab은 배치·적용하지 않는다', async () => {
    const { library } = setup();
    expect(await library.create('missing')).toBeNull();
    await library.create('world-origin-marker');
    expect(await library.create(ROOT_ID)).toBeNull();
    expect(library.getPrefabs()).toHaveLength(1);
    expect(await library.place('missing')).toBe(false);
    expect(await library.apply('missing', library.getPrefabs()[0]!)).toBe(false);
  });
});

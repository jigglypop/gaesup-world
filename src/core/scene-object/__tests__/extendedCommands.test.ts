import { applySceneDocumentCommand } from '../commands';
import { registerSceneComponentSchema } from '../componentSchemas';
import { createSceneComponent, createSceneDocument } from '../core';

function createDocument() {
  return createSceneDocument({
    id: 'scene',
    objects: [
      {
        id: 'floor',
        name: 'Floor',
        components: [createSceneComponent({ id: 'tiles', type: 'gaesup.buildingPiece', data: { kind: 'tile' } })],
      },
      { id: 'tree', name: 'Tree' },
    ],
  });
}

describe('SceneDocument 확장 명령', () => {
  test('component.update는 컴포넌트 데이터와 활성 상태를 바꾸고 이벤트를 낸다', () => {
    const document = createDocument();
    const result = applySceneDocumentCommand(document, {
      type: 'scene-object.component.update',
      objectId: 'floor',
      componentId: 'tiles',
      data: { kind: 'tile', cells: [[0, 0, 0]] },
      enabled: false,
    });
    expect(result.accepted).toBe(true);
    if (!result.accepted) return;
    const component = result.document.objects[0]?.components[0];
    expect(component?.data).toEqual({ kind: 'tile', cells: [[0, 0, 0]] });
    expect(component?.enabled).toBe(false);
    expect(result.event).toEqual({
      type: 'scene-object.component.updated',
      documentId: 'scene',
      objectId: 'floor',
      componentId: 'tiles',
    });
    expect(document.objects[0]?.components[0]?.enabled).toBe(true);
  });

  test('없는 대상, 빈 변경, 스키마 위반을 거부하고 원본을 유지한다', () => {
    const document = createDocument();
    const missing = applySceneDocumentCommand(document, {
      type: 'scene-object.component.update',
      objectId: 'floor',
      componentId: 'nope',
      enabled: false,
    });
    expect(missing.accepted).toBe(false);
    const empty = applySceneDocumentCommand(document, {
      type: 'scene-object.component.update',
      objectId: 'floor',
      componentId: 'tiles',
    });
    expect(empty.accepted).toBe(false);
    const unregister = registerSceneComponentSchema('gaesup.buildingPiece', (data) =>
      data['kind'] === 'tile' ? null : 'kind must be tile',
    );
    try {
      const invalid = applySceneDocumentCommand(document, {
        type: 'scene-object.component.update',
        objectId: 'floor',
        componentId: 'tiles',
        data: { kind: 'wall' },
      });
      expect(invalid.accepted).toBe(false);
      if (!invalid.accepted) expect(invalid.issues[0]?.code).toBe('invalid-component-data');
      expect(invalid.document).toBe(document);
    } finally {
      unregister();
    }
  });

  test('batch는 모든 명령을 순서대로 적용하고 하나라도 실패하면 아무것도 바꾸지 않는다', () => {
    const document = createDocument();
    const accepted = applySceneDocumentCommand(document, {
      type: 'scene-document.batch',
      label: '나무 이동',
      commands: [
        { type: 'scene-object.update', objectId: 'tree', patch: { name: 'Oak' } },
        { type: 'scene-object.move', objectId: 'tree', parentId: 'floor' },
      ],
    });
    expect(accepted.accepted).toBe(true);
    if (accepted.accepted) {
      const tree = accepted.document.objects.find((object) => object.id === 'tree');
      expect(tree?.name).toBe('Oak');
      expect(tree?.parentId).toBe('floor');
      expect(accepted.event.type).toBe('scene-document.batch-applied');
      if (accepted.event.type === 'scene-document.batch-applied') {
        expect(accepted.event.label).toBe('나무 이동');
        expect(accepted.event.events.map((event) => event.type)).toEqual([
          'scene-object.updated',
          'scene-object.moved',
        ]);
      }
    }
    const rejected = applySceneDocumentCommand(document, {
      type: 'scene-document.batch',
      commands: [
        { type: 'scene-object.update', objectId: 'tree', patch: { name: 'Oak' } },
        { type: 'scene-object.delete', objectId: 'missing' },
      ],
    });
    expect(rejected.accepted).toBe(false);
    expect(rejected.document).toBe(document);
    expect(applySceneDocumentCommand(document, { type: 'scene-document.batch', commands: [] }).accepted).toBe(false);
  });
});

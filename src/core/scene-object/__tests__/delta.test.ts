import { createSceneDocumentController } from '../controller';
import { createSceneDocument, createSceneObject } from '../core';
import { subscribeSceneObjectDelta, toSceneObjectDelta, type SceneObjectDelta } from '../delta';

const ids = (set: ReadonlySet<string>) => [...set].sort();
const shape = (delta: SceneObjectDelta) => ({ reset: delta.reset, added: ids(delta.added), removed: ids(delta.removed), updated: ids(delta.updated) });

function setup() {
  const controller = createSceneDocumentController(createSceneDocument({
    id: 'scene',
    objects: [createSceneObject({ id: 'a' }), createSceneObject({ id: 'b', parentId: 'a' })],
  }));
  const deltas: ReturnType<typeof shape>[] = [];
  const revisions: number[] = [];
  const off = subscribeSceneObjectDelta(controller, (_snapshot, delta, revision) => {
    deltas.push(shape(delta));
    revisions.push(revision);
  });
  return { controller, deltas, revisions, off };
}

describe('scene object delta', () => {
  it('maps single commands to object ids with the controller revision', () => {
    const { controller, deltas, revisions, off } = setup();
    controller.dispatch({ type: 'scene-object.create', object: createSceneObject({ id: 'c' }) });
    controller.dispatch({ type: 'scene-object.update', objectId: 'a', patch: { name: 'Root' } });
    controller.dispatch({ type: 'scene-object.delete', objectId: 'a' });
    off();
    expect(deltas).toEqual([
      { reset: false, added: ['c'], removed: [], updated: [] },
      { reset: false, added: [], removed: [], updated: ['a'] },
      { reset: false, added: [], removed: ['a', 'b'], updated: [] },
    ]);
    expect(revisions).toEqual([1, 2, 3]);
  });

  it('nets out batch changes per object', () => {
    const { controller, deltas, off } = setup();
    controller.dispatch({
      type: 'scene-document.batch',
      commands: [
        { type: 'scene-object.create', object: createSceneObject({ id: 'temp' }) },
        { type: 'scene-object.update', objectId: 'temp', patch: { name: 'Temp' } },
        { type: 'scene-object.delete', objectId: 'temp' },
        { type: 'scene-object.create', object: createSceneObject({ id: 'kept' }) },
        { type: 'scene-object.update', objectId: 'kept', patch: { name: 'Kept' } },
        { type: 'scene-object.update', objectId: 'b', patch: { name: 'Child' } },
      ],
    });
    off();
    expect(deltas).toEqual([{ reset: false, added: ['kept'], removed: [], updated: ['b'] }]);
  });

  it('treats delete then re-create of the same id as an update and replace as a reset', () => {
    expect(shape(toSceneObjectDelta({
      type: 'scene-document.batch-applied',
      documentId: 'scene',
      events: [
        { type: 'scene-object.deleted', documentId: 'scene', objectIds: ['a'] },
        { type: 'scene-object.created', documentId: 'scene', objectId: 'a' },
      ],
    }))).toEqual({ reset: false, added: [], removed: [], updated: ['a'] });
    expect(toSceneObjectDelta({ type: 'scene-document.replaced', documentId: 'scene' }).reset).toBe(true);
  });
});

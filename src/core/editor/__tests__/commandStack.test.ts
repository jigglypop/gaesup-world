import {
  createEditorCommandStack,
  createEditorTransaction,
  createSceneObjectEditorCommands,
} from '../shell';
import { createSceneDocument } from '../../scene-object';
import type { SceneDocument } from '../../scene-object';

describe('editor command stack', () => {
  test('executes undoable commands and notifies subscribers', async () => {
    const stack = createEditorCommandStack();
    const listener = jest.fn();
    const unsubscribe = stack.subscribe(listener);
    const run = jest.fn();
    const undo = jest.fn();

    await stack.execute({ id: 'set-name', label: 'Set Name', run, undo });

    expect(run).toHaveBeenCalledTimes(1);
    expect(stack.canUndo()).toBe(true);
    expect(stack.getState()).toMatchObject({ undoCount: 1, redoCount: 0 });

    await stack.undo();
    expect(undo).toHaveBeenCalledTimes(1);
    expect(stack.canRedo()).toBe(true);

    await stack.redo();
    expect(run).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  test('runs transactions and undoes commands in reverse order', async () => {
    const events: string[] = [];
    const transaction = createEditorTransaction({
      id: 'batch',
      label: 'Batch',
      commands: [
        { id: 'a', label: 'A', run: () => events.push('run-a'), undo: () => events.push('undo-a') },
        { id: 'b', label: 'B', run: () => events.push('run-b'), undo: () => events.push('undo-b') },
      ],
    });

    await transaction.run();
    await transaction.undo?.();

    expect(events).toEqual(['run-a', 'run-b', 'undo-b', 'undo-a']);
  });
});

describe('scene object editor commands', () => {
  let document: SceneDocument;
  const store = {
    getDocument: () => document,
    setDocument: (next: SceneDocument) => {
      document = next;
    },
  };

  beforeEach(() => {
    document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'root', name: 'Root' },
        { id: 'child', name: 'Child', parentId: 'root' },
      ],
    });
  });

  test('creates, updates, moves, and deletes objects with undo support', async () => {
    const stack = createEditorCommandStack();
    const commands = createSceneObjectEditorCommands(store);

    await stack.execute(commands.createObject({ id: 'crate', name: 'Crate', layer: 'props' }));
    expect(document.objects.map((object) => object.id)).toEqual(['root', 'child', 'crate']);

    await stack.execute(commands.updateObject('crate', { name: 'Box', transform: { position: [1, 2, 3] } }));
    expect(document.objects.find((object) => object.id === 'crate')).toMatchObject({
      name: 'Box',
      transform: { position: [1, 2, 3] },
    });

    await stack.execute(commands.moveObject('child', undefined));
    expect(document.objects.find((object) => object.id === 'child')?.parentId).toBeUndefined();

    await stack.execute(commands.deleteObject('root'));
    expect(document.objects.map((object) => object.id)).toEqual(['child', 'crate']);

    await stack.undo();
    expect(document.objects.map((object) => object.id)).toEqual(['root', 'child', 'crate']);
  });

  test('adds and removes components with undo support', async () => {
    const stack = createEditorCommandStack();
    const commands = createSceneObjectEditorCommands(store);

    await stack.execute(commands.addComponent('root', { id: 'health', type: 'game.health', data: { hp: 10 } }));
    expect(document.objects[0]?.components[0]?.id).toBe('health');

    await stack.execute(commands.removeComponent('root', 'health'));
    expect(document.objects[0]?.components).toEqual([]);

    await stack.undo();
    expect(document.objects[0]?.components[0]?.id).toBe('health');
  });
});

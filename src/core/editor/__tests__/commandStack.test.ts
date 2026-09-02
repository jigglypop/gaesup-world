import { createSceneDocument, createSceneDocumentController } from '../../scene-object';
import type { SceneDocument, SceneDocumentCommand } from '../../scene-object';
import {
  createEditorCommandStack,
  createEditorTransaction,
  createSceneObjectEditorCommands,
} from '../shell';
import type { SceneDocumentCommandStore } from '../shell';

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

  test('keeps undo and redo entries when their operation fails', async () => {
    const stack = createEditorCommandStack();
    let undoFails = true;
    let redoFails = false;
    let runCount = 0;
    const command = {
      id: 'fallible',
      label: 'Fallible',
      run: () => {
        runCount++;
        if (redoFails) throw new Error('redo failed');
      },
      undo: () => {
        if (undoFails) throw new Error('undo failed');
      },
    };

    await stack.execute(command);
    await expect(stack.undo()).rejects.toThrow('undo failed');
    expect(stack.getState()).toMatchObject({ undoCount: 1, redoCount: 0 });

    undoFails = false;
    await stack.undo();
    expect(stack.getState()).toMatchObject({ undoCount: 0, redoCount: 1 });

    redoFails = true;
    await expect(stack.redo()).rejects.toThrow('redo failed');
    expect(stack.getState()).toMatchObject({ undoCount: 0, redoCount: 1 });
    expect(runCount).toBe(2);
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

    await stack.execute(
      commands.updateObject('crate', { name: 'Box', transform: { position: [1, 2, 3] } }),
    );
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

    await stack.execute(
      commands.addComponent('root', { id: 'health', type: 'game.health', data: { hp: 10 } }),
    );
    expect(document.objects[0]?.components[0]?.id).toBe('health');

    await stack.execute(commands.removeComponent('root', 'health'));
    expect(document.objects[0]?.components).toEqual([]);

    await stack.undo();
    expect(document.objects[0]?.components[0]?.id).toBe('health');
  });

  test('preserves every public scene command ID and label', () => {
    const commands = createSceneObjectEditorCommands(store);

    expect(commands.createObject({ id: 'crate', name: 'Crate' })).toMatchObject({
      id: 'scene-object.create.crate',
      label: 'Create Crate',
    });
    expect(commands.updateObject('root', { name: 'Updated' })).toMatchObject({
      id: 'scene-object.update.root',
      label: 'Update root',
    });
    expect(commands.moveObject('child', undefined)).toMatchObject({
      id: 'scene-object.update.child',
      label: 'Update child',
    });
    expect(commands.deleteObject('root')).toMatchObject({
      id: 'scene-object.delete.root',
      label: 'Delete root',
    });
    expect(commands.addComponent('root', { id: 'health', type: 'game.health' })).toMatchObject({
      id: 'scene-object.component.add.root.health',
      label: 'Add game.health',
    });
    expect(commands.removeComponent('root', 'health')).toMatchObject({
      id: 'scene-object.component.remove.root.health',
      label: 'Remove health',
    });
  });

  test('recursively deletes descendants and restores them through canonical replace undo', async () => {
    document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'root', name: 'Root' },
        { id: 'child', name: 'Child', parentId: 'root' },
        { id: 'grandchild', name: 'Grandchild', parentId: 'child' },
        { id: 'other', name: 'Other' },
      ],
    });
    const stack = createEditorCommandStack();
    const commands = createSceneObjectEditorCommands(store);

    await stack.execute(commands.deleteObject('root'));
    expect(document.objects.map((object) => object.id)).toEqual(['other']);

    await stack.undo();
    expect(document.objects.map((object) => object.id)).toEqual([
      'root',
      'child',
      'grandchild',
      'other',
    ]);
  });

  test('captures owned canonical payloads before delayed command execution', async () => {
    const stack = createEditorCommandStack();
    const commands = createSceneObjectEditorCommands(store);
    const createInput = {
      id: 'crate',
      name: 'Crate',
      tags: ['original'],
      transform: { position: [1, 2, 3] as const },
    };
    const createCommand = commands.createObject(createInput);
    createInput.name = 'Mutated';
    createInput.tags.push('mutated');

    await stack.execute(createCommand);
    expect(document.objects.find((object) => object.id === 'crate')).toMatchObject({
      name: 'Crate',
      tags: ['original'],
      transform: { position: [1, 2, 3] },
    });

    const updatePatch = {
      name: 'Updated',
      tags: ['captured'],
      transform: { position: [4, 5, 6] as const },
    };
    const updateCommand = commands.updateObject('crate', updatePatch);
    updatePatch.name = 'Mutated update';
    updatePatch.tags.push('mutated');
    await stack.execute(updateCommand);
    expect(document.objects.find((object) => object.id === 'crate')).toMatchObject({
      name: 'Updated',
      tags: ['captured'],
      transform: { position: [4, 5, 6] },
    });

    const componentInput = {
      id: 'health',
      type: 'game.health',
      data: { stats: { hp: 10 } },
    };
    const componentCommand = commands.addComponent('crate', componentInput);
    componentInput.data.stats.hp = 99;
    await stack.execute(componentCommand);
    expect(document.objects.find((object) => object.id === 'crate')?.components[0]?.data).toEqual({
      stats: { hp: 10 },
    });
  });

  test('accepts the controller directly and keeps command IDs, labels, undo, and redo stable', async () => {
    const controller = createSceneDocumentController(document);
    const events: string[] = [];
    controller.subscribe((_snapshot, event) => events.push(event.type));
    const stack = createEditorCommandStack();
    const commands = createSceneObjectEditorCommands(controller);
    const command = commands.createObject({ id: 'crate', name: 'Crate' });

    expect(command).toMatchObject({
      id: 'scene-object.create.crate',
      label: 'Create Crate',
    });
    await stack.execute(command);
    await stack.undo();
    await stack.redo();

    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual([
      'root',
      'child',
      'crate',
    ]);
    expect(events).toEqual([
      'scene-object.created',
      'scene-document.replaced',
      'scene-object.created',
    ]);
  });

  test('preserves method receivers for class stores and controller-like targets', async () => {
    class ClassSceneStore implements SceneDocumentCommandStore {
      document: SceneDocument;

      constructor(initialDocument: SceneDocument) {
        this.document = initialDocument;
      }

      getDocument(): SceneDocument {
        return this.document;
      }

      setDocument(nextDocument: SceneDocument): void {
        this.document = nextDocument;
      }
    }

    const classStore = new ClassSceneStore(document);
    const classCommand = createSceneObjectEditorCommands(classStore).createObject({
      id: 'class-object',
      name: 'Class Object',
    });
    await classCommand.run();
    expect(classStore.document.objects.at(-1)?.id).toBe('class-object');

    const controller = createSceneDocumentController(document);
    const controllerTarget = {
      controller,
      getSnapshot() {
        return this.controller.getSnapshot();
      },
      dispatch(command: SceneDocumentCommand) {
        return this.controller.dispatch(command);
      },
    };
    const controllerCommand = createSceneObjectEditorCommands(controllerTarget).createObject({
      id: 'controller-object',
      name: 'Controller Object',
    });
    await controllerCommand.run();
    expect(controllerTarget.getSnapshot().objects.at(-1)?.id).toBe('controller-object');
  });

  test('preserves legacy empty parent and layer clear sentinels through canonical null commands', async () => {
    document = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'root', name: 'Root', layer: 'world' },
        { id: 'child', name: 'Child', parentId: 'root' },
      ],
    });
    const commands = createSceneObjectEditorCommands(store);

    await commands.updateObject('child', { parentId: '' }).run();
    expect(document.objects.find((object) => object.id === 'child')?.parentId).toBeUndefined();
    await commands.moveObject('child', 'root').run();
    await commands.moveObject('child', '').run();
    await commands.updateObject('root', { layer: '' }).run();

    expect(document.objects.find((object) => object.id === 'child')?.parentId).toBeUndefined();
    expect(document.objects.find((object) => object.id === 'root')?.layer).toBeUndefined();
  });

  test('throws rejected commands before legacy set or command-stack mutation', async () => {
    const setDocument = jest.fn((next: SceneDocument) => {
      document = next;
    });
    const guardedStore = {
      getDocument: () => document,
      setDocument,
    };
    const stack = createEditorCommandStack();
    const reversible = {
      id: 'reversible',
      label: 'Reversible',
      run: () => undefined,
      undo: () => undefined,
    };
    await stack.execute(reversible);
    await stack.undo();
    expect(stack.getState()).toMatchObject({ undoCount: 0, redoCount: 1 });

    const duplicate = createSceneObjectEditorCommands(guardedStore).createObject({
      id: 'root',
      name: 'Duplicate',
    });
    await expect(stack.execute(duplicate)).rejects.toThrow(TypeError);

    expect(setDocument).not.toHaveBeenCalled();
    expect(stack.getState()).toMatchObject({ undoCount: 0, redoCount: 1 });
    expect(document.objects.map((object) => object.id)).toEqual(['root', 'child']);
  });
});

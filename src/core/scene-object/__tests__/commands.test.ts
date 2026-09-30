import {
  applySceneDocumentCommand,
  createSceneComponent,
  createSceneDocument,
  createSceneDocumentController,
  createSceneObject,
  parseSceneDocument,
} from '..';
import type { SceneDocument, SceneDocumentCommand, SceneJsonObject } from '..';
import * as core from '../core';

function createHierarchyDocument(): SceneDocument {
  return createSceneDocument({
    id: 'scene',
    objects: [
      { id: 'root', name: 'Root', layer: 'world' },
      { id: 'child', name: 'Child', parentId: 'root' },
      { id: 'grandchild', name: 'Grandchild', parentId: 'child' },
      { id: 'other', name: 'Other' },
    ],
  });
}

describe('applySceneDocumentCommand', () => {
  test('shares untouched snapshot objects while owning edited vectors and tags', () => {
    const initial = createHierarchyDocument();
    const first = applySceneDocumentCommand(initial, { type: 'scene-object.update', objectId: 'child', patch: { name: 'First' } });
    if (!first.accepted) throw new Error('Expected initial edit.');
    const position: [number, number, number] = [3, 4, 5];
    const tags = ['edited'];
    const result = applySceneDocumentCommand(first.document, { type: 'scene-object.update', objectId: 'child', patch: { transform: { position }, tags } });
    if (!result.accepted) throw new Error('Expected second edit.');
    expect(result.document.objects[0]).toBe(first.document.objects[0]);
    expect(result.document.objects[1]).not.toBe(first.document.objects[1]);
    expect(result.document.objects[1]!.components).toBe(first.document.objects[1]!.components);
    position[0] = 99; tags.push('caller mutation');
    expect(result.document.objects[1]!.transform.position).toEqual([3, 4, 5]);
    expect(result.document.objects[1]!.tags).toEqual(['edited']);
    expect(first.document.objects[1]!.transform.position).toEqual([0, 0, 0]);
    expect(Object.isFrozen(result.document.objects[1]!.transform.position)).toBe(true);
    expect(Object.isFrozen(initial)).toBe(false);
  });

  test('matches reparsed snapshots through edits, reparenting, rejection and subtree deletion', () => {
    let current = createHierarchyDocument();
    for (let i = 0; i < 100; i++) {
      const commands: SceneDocumentCommand[] = [
        { type: 'scene-object.update', objectId: 'child', patch: { transform: { position: [i, 0, 1] }, tags: ['a', 'b'] } },
        { type: 'scene-object.move', objectId: 'grandchild', parentId: i % 2 ? 'root' : 'child' },
        { type: 'scene-object.update', objectId: 'root', patch: { parentId: 'child' } },
        { type: 'scene-object.update', objectId: 'other', patch: { layer: i % 2 ? 'visible' : null } },
      ];
      for (const command of commands) {
        const result = applySceneDocumentCommand(current, command);
        const reference = applySceneDocumentCommand(JSON.parse(JSON.stringify(current)) as SceneDocument, command);
        expect(result).toEqual(reference);
        if (result.accepted) current = result.document;
      }
    }
    const deleted = applySceneDocumentCommand(current, { type: 'scene-object.delete', objectId: 'root' });
    expect(deleted.accepted).toBe(true);
    expect(deleted.document.objects.map(object => object.id)).toEqual(['other']);
  });

  test('a create reads only its own object, so building a document scales linearly', () => {
    const creates = Array.from({ length: 50 }, (_, index) => ({
      type: 'scene-object.create',
      object: createSceneObject({
        id: `new-${index}`,
        name: 'New',
        parentId: 'seed-0',
        components: [createSceneComponent({ id: 'mesh', type: 'mesh', data: { size: [1, 2, 3] } })],
        tags: ['created'],
      }),
    }) as const);
    const measure = (size: number) => {
      const controller = createSceneDocumentController(createSceneDocument({
        id: 'scene',
        objects: Array.from({ length: size }, (_, index) => ({ id: `seed-${index}`, ...(index ? { parentId: 'seed-0' } : {}) })),
      }));
      const before = controller.getSnapshot();
      const reads = jest.spyOn(Object, 'getOwnPropertyDescriptor');
      const validate = jest.spyOn(core, 'validateSceneDocument');
      try {
        for (const command of creates) expect(controller.dispatch(command).accepted).toBe(true);
        expect(validate).not.toHaveBeenCalled();
        return reads.mock.calls.length;
      } finally {
        reads.mockRestore();
        validate.mockRestore();
        const after = controller.getSnapshot();
        expect(after.objects).toHaveLength(size + creates.length);
        expect(after.objects.slice(0, size).every((object, index) => object === before.objects[index])).toBe(true);
      }
    };
    expect(measure(2000)).toBe(measure(1000));
  });

  test('incremental commands produce the fully parsed document and keep branches independent', () => {
    const controller = createSceneDocumentController(createHierarchyDocument());
    const commands: SceneDocumentCommand[] = [
      { type: 'scene-object.create', object: createSceneObject({ id: 'crate', name: 'Crate', parentId: 'child', components: [createSceneComponent({ id: 'hp', type: 'game.health', data: { hp: 3 } })] }) },
      { type: 'scene-object.update', objectId: 'crate', patch: { name: 'Box', tags: ['prop'], transform: { position: [1, 2, 3] } } },
      { type: 'scene-object.move', objectId: 'crate', parentId: 'other' },
      { type: 'scene-object.update', objectId: 'grandchild', patch: { parentId: null, layer: 'ui' } },
      { type: 'scene-object.component.add', objectId: 'crate', component: createSceneComponent({ id: 'tag', type: 'game.tag', data: { label: 'a' } }) },
      { type: 'scene-object.component.update', objectId: 'crate', componentId: 'hp', data: { hp: 5 }, enabled: false },
      { type: 'scene-object.component.remove', objectId: 'crate', componentId: 'tag' },
      { type: 'scene-document.batch', commands: [
        { type: 'scene-object.create', object: createSceneObject({ id: 'leaf', name: 'Leaf', parentId: 'crate' }) },
        { type: 'scene-object.delete', objectId: 'other' },
      ] },
    ];
    for (const command of commands) {
      const result = controller.dispatch(command);
      expect(result.accepted).toBe(true);
      const reparsed = parseSceneDocument(JSON.parse(JSON.stringify(result.document)));
      expect(reparsed).toEqual({ ok: true, document: result.document, issues: [] });
    }
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['root', 'child', 'grandchild']);

    const base = controller.getSnapshot();
    const left = applySceneDocumentCommand(base, { type: 'scene-object.create', object: createSceneObject({ id: 'left', parentId: 'child' }) });
    const right = applySceneDocumentCommand(base, { type: 'scene-object.create', object: createSceneObject({ id: 'right', parentId: 'left' }) });
    const renamed = applySceneDocumentCommand(base, { type: 'scene-object.update', objectId: 'grandchild', patch: { name: 'Renamed' } });
    expect(left.accepted).toBe(true);
    expect(right).toMatchObject({ accepted: false, issues: [expect.objectContaining({ code: 'missing-parent' })] });
    expect(renamed.document.objects.map((object) => object.id)).toEqual(['root', 'child', 'grandchild']);
    if (!left.accepted) throw new Error('Expected left branch.');
    const cycle = applySceneDocumentCommand(left.document, { type: 'scene-object.move', objectId: 'child', parentId: 'left' });
    expect(cycle).toMatchObject({ accepted: false, document: left.document });
    expect(cycle.accepted ? [] : cycle.issues.map((issue) => issue.code)).toContain('parent-cycle');
  });

  test('validates hostile patches even for trusted snapshots', () => {
    const first = applySceneDocumentCommand(createHierarchyDocument(), { type: 'scene-object.update', objectId: 'root', patch: { name: 'Ready' } });
    if (!first.accepted) throw new Error('Expected edit.');
    const getter = jest.fn(() => 'unsafe');
    const patches = [
      { transform: { position: [NaN, 0, 0] } },
      { transform: { scale: [1, -0, 1] } },
      { parentId: 'missing' },
      { parentId: 'child' },
      { tags: ['ok', undefined] },
      Object.defineProperty({}, 'name', { enumerable: true, get: getter }),
    ];
    for (const patch of patches) {
      const result = applySceneDocumentCommand(first.document, { type: 'scene-object.update', objectId: 'root', patch } as SceneDocumentCommand);
      expect(result.accepted).toBe(false);
      expect(result.document).toBe(first.document);
    }
    expect(getter).not.toHaveBeenCalled();
  });

  test('returns an owned deep-frozen document and deterministic event for accepted commands', () => {
    const document = createHierarchyDocument();
    const object = createSceneObject({ id: 'crate', name: 'Crate', tags: ['prop'] });
    const command = { type: 'scene-object.create', object } as const;

    const first = applySceneDocumentCommand(document, command);
    const second = applySceneDocumentCommand(document, command);

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(true);
    if (!first.accepted || !second.accepted) throw new Error('Expected accepted command.');
    expect(first.document).not.toBe(document);
    expect(first.event).toEqual(second.event);
    expect(first.event).toEqual({
      type: 'scene-object.created',
      documentId: 'scene',
      objectId: 'crate',
    });
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.event)).toBe(true);
    expect(Object.isFrozen(first.document)).toBe(true);
    expect(Object.isFrozen(first.document.objects)).toBe(true);
    expect(Object.isFrozen(first.document.objects.at(-1)?.transform.position)).toBe(true);

    object.name = 'Caller mutation';
    object.tags.push('mutated');
    expect(first.document.objects.at(-1)).toMatchObject({ name: 'Crate', tags: ['prop'] });
  });

  test('preserves the exact unfrozen input identity when a command is rejected', () => {
    const document = createHierarchyDocument();
    const command: SceneDocumentCommand = {
      type: 'scene-object.create',
      object: createSceneObject({ id: 'root', name: 'Duplicate' }),
    };

    const result = applySceneDocumentCommand(document, command);

    expect(result.accepted).toBe(false);
    if (result.accepted) throw new Error('Expected rejected command.');
    expect(result.document).toBe(document);
    expect(Object.isFrozen(document)).toBe(false);
    expect(Object.isFrozen(document.objects)).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'duplicate-object-id' })]),
    );
  });

  test('deletes the complete descendant closure in document order', () => {
    const document = createHierarchyDocument();

    const result = applySceneDocumentCommand(document, {
      type: 'scene-object.delete',
      objectId: 'root',
    });

    expect(result.accepted).toBe(true);
    if (!result.accepted) throw new Error('Expected accepted command.');
    expect(result.document.objects.map((object) => object.id)).toEqual(['other']);
    expect(result.event).toEqual({
      type: 'scene-object.deleted',
      documentId: 'scene',
      objectIds: ['root', 'child', 'grandchild'],
    });
  });

  test('rejects missing targets, missing parents, cycles, and duplicate component IDs', () => {
    const document = createHierarchyDocument();
    const missingObject = applySceneDocumentCommand(document, {
      type: 'scene-object.update',
      objectId: 'missing',
      patch: { name: 'Missing' },
    });
    const missingParent = applySceneDocumentCommand(document, {
      type: 'scene-object.move',
      objectId: 'other',
      parentId: 'missing',
    });
    const cycle = applySceneDocumentCommand(document, {
      type: 'scene-object.move',
      objectId: 'root',
      parentId: 'grandchild',
    });

    const withComponent = applySceneDocumentCommand(document, {
      type: 'scene-object.component.add',
      objectId: 'root',
      component: createSceneComponent({ id: 'health', type: 'game.health', data: { hp: 10 } }),
    });
    if (!withComponent.accepted) throw new Error('Expected component add to be accepted.');
    const duplicateComponent = applySceneDocumentCommand(withComponent.document, {
      type: 'scene-object.component.add',
      objectId: 'root',
      component: createSceneComponent({ id: 'health', type: 'game.health', data: { hp: 20 } }),
    });

    expect(missingObject).toMatchObject({
      accepted: false,
      issues: [expect.objectContaining({ code: 'missing-object' })],
    });
    expect(missingParent).toMatchObject({
      accepted: false,
      issues: [expect.objectContaining({ code: 'missing-parent' })],
    });
    expect(cycle).toMatchObject({
      accepted: false,
      issues: expect.arrayContaining([expect.objectContaining({ code: 'parent-cycle' })]),
    });
    expect(duplicateComponent).toMatchObject({
      accepted: false,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: 'duplicate-component-id', componentId: 'health' }),
      ]),
    });
  });

  test('uses null to clear optional parent and layer fields', () => {
    const document = createHierarchyDocument();
    const moved = applySceneDocumentCommand(document, {
      type: 'scene-object.move',
      objectId: 'child',
      parentId: null,
    });
    if (!moved.accepted) throw new Error('Expected move to be accepted.');
    const updated = applySceneDocumentCommand(moved.document, {
      type: 'scene-object.update',
      objectId: 'root',
      patch: { layer: null },
    });

    expect(updated.accepted).toBe(true);
    if (!updated.accepted) throw new Error('Expected update to be accepted.');
    expect(
      updated.document.objects.find((object) => object.id === 'child')?.parentId,
    ).toBeUndefined();
    expect(updated.document.objects.find((object) => object.id === 'root')?.layer).toBeUndefined();
  });

  test('rejects non-materialized or non-canonical command payloads', () => {
    const document = createHierarchyDocument();
    const missingId = {
      type: 'scene-object.create',
      object: {
        name: 'No id',
        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        components: [],
        tags: [],
      },
    } as unknown as SceneDocumentCommand;
    const invalidData = {
      type: 'scene-object.component.add',
      objectId: 'root',
      component: {
        id: 'invalid',
        type: 'game.invalid',
        enabled: true,
        data: { value: undefined } as unknown as SceneJsonObject,
      },
    } as SceneDocumentCommand;
    const undefinedClear = {
      type: 'scene-object.update',
      objectId: 'root',
      patch: { layer: undefined },
    } as unknown as SceneDocumentCommand;

    for (const command of [missingId, invalidData, undefinedClear]) {
      const result = applySceneDocumentCommand(document, command);
      expect(result).toMatchObject({
        accepted: false,
        document,
        issues: [expect.objectContaining({ code: 'invalid-scene-command' })],
      });
    }
  });

  test('rejects an invalid current document without changing or freezing it', () => {
    const document = createSceneDocument({
      id: 'invalid',
      objects: [
        { id: 'duplicate', name: 'First' },
        { id: 'duplicate', name: 'Second' },
      ],
    });

    const result = applySceneDocumentCommand(document, {
      type: 'scene-object.delete',
      objectId: 'duplicate',
    });

    expect(result.accepted).toBe(false);
    expect(result.document).toBe(document);
    expect(Object.isFrozen(document)).toBe(false);
  });

  test('rejects non-canonical current and replacement document schema instead of stripping fields', () => {
    const invalidCurrent = createHierarchyDocument();
    Object.defineProperty(invalidCurrent, 'extra', {
      configurable: true,
      enumerable: true,
      value: () => undefined,
      writable: true,
    });
    const currentResult = applySceneDocumentCommand(invalidCurrent, {
      type: 'scene-object.delete',
      objectId: 'root',
    });
    expect(currentResult.accepted).toBe(false);
    expect(currentResult.document).toBe(invalidCurrent);
    expect(Object.isFrozen(invalidCurrent)).toBe(false);

    const createReplacement = (): SceneDocument =>
      createSceneDocument({
        id: 'replacement',
        objects: [
          {
            id: 'root',
            name: 'Root',
            components: [
              createSceneComponent({ id: 'health', type: 'game.health', data: { hp: 10 } }),
            ],
          },
        ],
      });
    const replacements = [
      (() => {
        const replacement = createReplacement();
        Object.defineProperty(replacement, 'extra', {
          configurable: true,
          enumerable: true,
          value: () => undefined,
          writable: true,
        });
        return replacement;
      })(),
      (() => {
        const replacement = createReplacement();
        Object.defineProperty(replacement, Symbol('extra'), {
          configurable: true,
          enumerable: true,
          value: true,
          writable: true,
        });
        return replacement;
      })(),
      (() => {
        const replacement = createReplacement();
        Object.defineProperty(replacement.objects, 'custom', {
          configurable: true,
          enumerable: true,
          value: true,
          writable: true,
        });
        return replacement;
      })(),
      (() => {
        const replacement = createReplacement();
        Object.defineProperty(replacement.objects[0], 'extra', {
          configurable: true,
          enumerable: true,
          value: true,
          writable: true,
        });
        return replacement;
      })(),
      (() => {
        const replacement = createReplacement();
        Object.defineProperty(replacement.objects[0]!.transform, 'extra', {
          configurable: true,
          enumerable: true,
          value: true,
          writable: true,
        });
        return replacement;
      })(),
      (() => {
        const replacement = createReplacement();
        Object.defineProperty(replacement.objects[0]!.components[0]!, 'extra', {
          configurable: true,
          enumerable: true,
          value: true,
          writable: true,
        });
        return replacement;
      })(),
    ];
    const current = createHierarchyDocument();

    for (const replacement of replacements) {
      const result = applySceneDocumentCommand(current, {
        type: 'scene-document.replace',
        document: replacement,
      });
      expect(result.accepted).toBe(false);
      expect(result.document).toBe(current);
      expect(current.objects.map((object) => object.id)).toEqual([
        'root',
        'child',
        'grandchild',
        'other',
      ]);
    }
  });
});

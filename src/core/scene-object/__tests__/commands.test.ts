import {
  applySceneDocumentCommand,
  createSceneComponent,
  createSceneDocument,
  createSceneObject,
} from '..';
import type { SceneDocument, SceneDocumentCommand, SceneJsonObject } from '..';

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

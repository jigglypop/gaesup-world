import { createSceneDocument, createSceneDocumentController, createSceneObject } from '..';
import { logger } from '../../utils/logger';

describe('createSceneDocumentController', () => {
  test('rejects stale revisions without mutating state or publishing events', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const listener = jest.fn();
    controller.subscribe(listener);
    const command = { type: 'scene-object.create', object: createSceneObject({ id: 'a', name: 'A' }) } as const;
    expect(controller.getRevision()).toBe(0);
    expect(controller.dispatch(command, { expectedRevision: 0 }).accepted).toBe(true);
    const snapshot = controller.getSnapshot();
    const rejected = controller.dispatch({ type: 'scene-object.delete', objectId: 'a' }, { expectedRevision: 0 });
    expect(rejected.accepted).toBe(false);
    if (!rejected.accepted) expect(rejected.issues[0]?.code).toBe('revision-conflict');
    expect(controller.getSnapshot()).toBe(snapshot);
    expect(controller.getRevision()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(controller.dispatch(command, { expectedRevision: 1 }).accepted).toBe(false);
    expect(controller.getRevision()).toBe(1);
  });

  test('preserves each event revision during reentrant publication and document replacement', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const observed: Array<[string, number]> = [];
    controller.subscribe((_snapshot, _event, context) => {
      if (context.revision === 1) controller.dispatch({ type: 'scene-document.replace', document: createSceneDocument({ id: 'remote' }) }, { expectedRevision: 1 });
    });
    controller.subscribe((snapshot, _event, context) => observed.push([snapshot.id, context.revision]));
    controller.dispatch({ type: 'scene-object.create', object: createSceneObject({ id: 'a', name: 'A' }) });
    expect(observed).toEqual([['scene', 1], ['remote', 2]]);
    expect(controller.getRevision()).toBe(2);
  });

  test('owns a stable deep-frozen snapshot independently from the initial input', () => {
    const initialDocument = createSceneDocument({
      id: 'scene',
      objects: [{ id: 'root', name: 'Root', tags: ['initial'] }],
    });
    const controller = createSceneDocumentController(initialDocument);
    const snapshot = controller.getSnapshot();

    initialDocument.objects[0]?.tags.push('caller-mutation');

    expect(controller.getSnapshot()).toBe(snapshot);
    expect(snapshot).not.toBe(initialDocument);
    expect(snapshot.objects[0]?.tags).toEqual(['initial']);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.objects[0]?.tags)).toBe(true);
  });

  test('commits accepted state before notifying and does not notify rejected commands', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const notifications: string[] = [];
    const before = controller.getSnapshot();
    controller.subscribe((snapshot, event) => {
      expect(controller.getSnapshot()).toBe(snapshot);
      notifications.push(event.type);
    });

    const accepted = controller.dispatch({
      type: 'scene-object.create',
      object: createSceneObject({ id: 'root', name: 'Root' }),
    });
    const acceptedSnapshot = controller.getSnapshot();
    const rejected = controller.dispatch({
      type: 'scene-object.create',
      object: createSceneObject({ id: 'root', name: 'Duplicate' }),
    });

    expect(accepted.accepted).toBe(true);
    expect(acceptedSnapshot).not.toBe(before);
    expect(rejected.accepted).toBe(false);
    expect(rejected.document).toBe(acceptedSnapshot);
    expect(controller.getSnapshot()).toBe(acceptedSnapshot);
    expect(notifications).toEqual(['scene-object.created']);
  });

  test('queues reentrant dispatch so every observer receives A before B with the matching snapshot', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const observations: string[] = [];
    const commandB = {
      type: 'scene-object.create',
      object: createSceneObject({ id: 'b', name: 'B' }),
    } as const;

    controller.subscribe((snapshot, event) => {
      const eventObjectId = 'objectId' in event ? event.objectId : 'document';
      observations.push(`first:${eventObjectId}:${snapshot.objects.at(-1)?.id}`);
      if (event.type === 'scene-object.created' && event.objectId === 'a') {
        controller.dispatch(commandB);
      }
    });
    controller.subscribe((snapshot, event) => {
      const eventObjectId = 'objectId' in event ? event.objectId : 'document';
      observations.push(`second:${eventObjectId}:${snapshot.objects.at(-1)?.id}`);
    });

    controller.dispatch({
      type: 'scene-object.create',
      object: createSceneObject({ id: 'a', name: 'A' }),
    });

    expect(observations).toEqual(['first:a:a', 'second:a:a', 'first:b:b', 'second:b:b']);
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['a', 'b']);
  });

  test('isolates listener failures through the project logger', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => undefined);
    const survivingListener = jest.fn();
    controller.subscribe(() => {
      throw new Error('listener failed');
    });
    controller.subscribe(survivingListener);

    expect(() => {
      controller.dispatch({
        type: 'scene-object.create',
        object: createSceneObject({ id: 'root', name: 'Root' }),
      });
    }).not.toThrow();

    expect(loggerSpy).toHaveBeenCalledWith(
      'Scene document controller listener failed.',
      expect.any(Error),
    );
    expect(survivingListener).toHaveBeenCalledTimes(1);
    loggerSpy.mockRestore();
  });

  test('continues queued notifications even when listener diagnostics also throw', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {
      throw new Error('logger failed');
    });
    const survivingEvents: string[] = [];
    controller.subscribe((_snapshot, event) => {
      if (event.type === 'scene-object.created' && event.objectId === 'a') {
        controller.dispatch({
          type: 'scene-object.create',
          object: createSceneObject({ id: 'b', name: 'B' }),
        });
      }
      throw new Error('listener failed');
    });
    controller.subscribe((_snapshot, event) => survivingEvents.push(event.type));

    expect(() => {
      controller.dispatch({
        type: 'scene-object.create',
        object: createSceneObject({ id: 'a', name: 'A' }),
      });
    }).not.toThrow();

    expect(survivingEvents).toEqual(['scene-object.created', 'scene-object.created']);
    expect(controller.getSnapshot().objects.map((object) => object.id)).toEqual(['a', 'b']);
    loggerSpy.mockRestore();
  });

  test('uses registration ownership so a stale disposer cannot remove a later registration', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const listener = jest.fn();
    const disposeFirst = controller.subscribe(listener);
    const disposeSecond = controller.subscribe(listener);

    disposeFirst();
    controller.dispatch({
      type: 'scene-object.create',
      object: createSceneObject({ id: 'root', name: 'Root' }),
    });
    expect(listener).toHaveBeenCalledTimes(1);

    disposeSecond();
    controller.dispatch({
      type: 'scene-object.create',
      object: createSceneObject({ id: 'other', name: 'Other' }),
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('has a useSyncExternalStore-compatible subscribe signature', () => {
    const controller = createSceneDocumentController(createSceneDocument({ id: 'scene' }));
    const subscribe: (onStoreChange: () => void) => () => void = controller.subscribe;
    const onStoreChange = jest.fn();
    const unsubscribe = subscribe(onStoreChange);

    controller.dispatch({
      type: 'scene-object.create',
      object: createSceneObject({ id: 'root', name: 'Root' }),
    });

    expect(onStoreChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  test('rejects invalid initial documents', () => {
    const invalidDocument = createSceneDocument({
      id: 'scene',
      objects: [
        { id: 'duplicate', name: 'First' },
        { id: 'duplicate', name: 'Second' },
      ],
    });
    expect(() => createSceneDocumentController(invalidDocument)).toThrow(TypeError);
  });
});

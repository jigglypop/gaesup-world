import type {
  SceneDocument,
  SceneDocumentController,
  SceneDocumentEvent,
  SceneObjectId,
} from './types';

/**
 * Object-level change set shared by scene projections (EntityWorld, building delta, render/physics drivers).
 * Consumers read current objects from the snapshot; `reset` means rebuild everything.
 */
export type SceneObjectDelta = {
  readonly reset: boolean;
  readonly added: ReadonlySet<SceneObjectId>;
  readonly removed: ReadonlySet<SceneObjectId>;
  /** Fields, parent or components changed. A moved object's descendants change world transform too. */
  readonly updated: ReadonlySet<SceneObjectId>;
};

type MutableDelta = { reset: boolean; added: Set<SceneObjectId>; removed: Set<SceneObjectId>; updated: Set<SceneObjectId> };

function created(delta: MutableDelta, id: SceneObjectId): void {
  if (delta.removed.delete(id)) delta.updated.add(id);
  else delta.added.add(id);
}

function changed(delta: MutableDelta, id: SceneObjectId): void {
  if (!delta.added.has(id)) delta.updated.add(id);
}

function deleted(delta: MutableDelta, id: SceneObjectId): void {
  if (delta.added.delete(id)) return;
  delta.updated.delete(id);
  delta.removed.add(id);
}

function collect(delta: MutableDelta, event: SceneDocumentEvent): void {
  switch (event.type) {
    case 'scene-document.replaced':
      delta.reset = true;
      return;
    case 'scene-object.created':
      created(delta, event.objectId);
      return;
    case 'scene-object.deleted':
      for (const id of event.objectIds) deleted(delta, id);
      return;
    case 'scene-object.updated':
    case 'scene-object.moved':
    case 'scene-object.component.added':
    case 'scene-object.component.removed':
    case 'scene-object.component.updated':
      changed(delta, event.objectId);
      return;
    case 'scene-document.batch-applied':
      for (const child of event.events) collect(delta, child);
      return;
  }
}

export function toSceneObjectDelta(event: SceneDocumentEvent): SceneObjectDelta {
  const delta: MutableDelta = { reset: false, added: new Set(), removed: new Set(), updated: new Set() };
  collect(delta, event);
  return delta;
}

export type SceneObjectDeltaListener = (snapshot: SceneDocument, delta: SceneObjectDelta, revision: number) => void;

/** Subscribes with object-level deltas instead of raw command events. */
export function subscribeSceneObjectDelta(
  controller: Pick<SceneDocumentController, 'subscribe'>,
  listener: SceneObjectDeltaListener,
): () => void {
  return controller.subscribe((snapshot, event, meta) => listener(snapshot, toSceneObjectDelta(event), meta.revision));
}

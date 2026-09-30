import { deepFreezeOwned } from './ownership';
import type { SceneDocument, SceneObject, SceneObjectId } from './types';

// Only validated, deep-frozen snapshots produced here are trusted; callers cannot brand mutable input.
const trustedSnapshots = new WeakSet<SceneDocument>();
// Object positions per snapshot. A successor that keeps every position takes the map over.
const objectIndexes = new WeakMap<SceneDocument, Map<SceneObjectId, number>>();

export function trustSceneSnapshot<T extends SceneDocument>(document: T): T {
  trustedSnapshots.add(document);
  return document;
}

export function isTrustedSceneSnapshot(document: SceneDocument): boolean {
  return trustedSnapshots.has(document);
}

/** Requires unique object ids, which every validated document has. */
export function getSceneObjectIndex(document: SceneDocument): Map<SceneObjectId, number> {
  let index = objectIndexes.get(document);
  if (!index) {
    index = new Map();
    for (let position = 0; position < document.objects.length; position++) {
      index.set(document.objects[position]!.id, position);
    }
    objectIndexes.set(document, index);
  }
  return index;
}

export function getIndexedSceneObject(document: SceneDocument, objectId: SceneObjectId): SceneObject | undefined {
  const position = getSceneObjectIndex(document).get(objectId);
  return position === undefined ? undefined : document.objects[position];
}

/** Successor with `object` in place of the object with its id. `object` must be owned and validated. */
export function replaceSceneObject(document: SceneDocument, object: SceneObject): SceneDocument {
  const index = takeSceneObjectIndex(document);
  const objects = document.objects.slice();
  objects[index.get(object.id)!] = deepFreezeOwned(object);
  return createSuccessor(document, objects, index);
}

/** Successor with `object` appended. `object` must be owned, validated and have a new id. */
export function appendSceneObject(document: SceneDocument, object: SceneObject): SceneDocument {
  const index = takeSceneObjectIndex(document);
  index.set(object.id, document.objects.length);
  return createSuccessor(document, [...document.objects, deepFreezeOwned(object)], index);
}

export function removeSceneObjects(document: SceneDocument, objectIds: ReadonlySet<SceneObjectId>): SceneDocument {
  return createSuccessor(document, document.objects.filter((object) => !objectIds.has(object.id)));
}

// Later commands on the older snapshot rebuild its index instead of reading the successor's.
function takeSceneObjectIndex(document: SceneDocument): Map<SceneObjectId, number> {
  const index = getSceneObjectIndex(document);
  objectIndexes.delete(document);
  return index;
}

// Unchanged objects are already deep-frozen, so freezing the containers keeps the result deep-frozen.
function createSuccessor(
  document: SceneDocument,
  objects: SceneObject[],
  index?: Map<SceneObjectId, number>,
): SceneDocument {
  const successor: SceneDocument = Object.freeze({
    version: document.version,
    id: document.id,
    ...(document.name !== undefined ? { name: document.name } : {}),
    objects: Object.freeze(objects) as SceneObject[],
  });
  if (index) objectIndexes.set(successor, index);
  return successor;
}

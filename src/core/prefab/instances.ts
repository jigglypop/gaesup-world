import { collectPrefabSubtreeIds } from './core';
import {
  applyPrefabOverrides,
  computePrefabOverrides,
  createPrefabInstance,
  propagatePrefabChanges,
  readPrefabInstanceLink,
  revertPrefabOverride,
} from './overrides';
import type { InstantiatePrefabOptions, PrefabDocument, PrefabInstanceLink, PrefabOverride } from './types';
import type { SceneDocument, SceneObject, SceneObjectId } from '../scene-object/types';

const TRANSFORM_PATH_PREFIX = 'transform.';

export function getPrefabInstanceObjects(
  objects: readonly SceneObject[],
  link: PrefabInstanceLink,
): SceneObject[] {
  const prefix = `${link.idPrefix}:`;
  const seeds = objects.filter((object) => object.id.startsWith(prefix)).map((object) => object.id);
  const ids = collectPrefabSubtreeIds(objects, seeds);
  return objects.filter((object) => ids.has(object.id));
}

export function findPrefabInstanceLink(
  document: SceneDocument,
  objectId: SceneObjectId,
): PrefabInstanceLink | null {
  const object = document.objects.find((candidate) => candidate.id === objectId);
  return object ? readPrefabInstanceLink(object) : null;
}

function keepExternalParents(previous: readonly SceneObject[], next: SceneObject[]): SceneObject[] {
  const previousIds = new Set(previous.map((object) => object.id));
  const externalParents = new Map<SceneObjectId, SceneObjectId>();
  previous.forEach((object) => {
    if (object.parentId !== undefined && !previousIds.has(object.parentId)) {
      externalParents.set(object.id, object.parentId);
    }
  });
  return next.map((object) => {
    const parentId = externalParents.get(object.id);
    return parentId !== undefined && object.parentId === undefined ? { ...object, parentId } : object;
  });
}

function replaceObjects(
  document: SceneDocument,
  removed: readonly SceneObject[],
  inserted: readonly SceneObject[],
): SceneDocument {
  const removedIds = new Set(removed.map((object) => object.id));
  const insertAt = document.objects.findIndex((object) => removedIds.has(object.id));
  const kept = document.objects.filter((object) => !removedIds.has(object.id));
  const at = insertAt < 0 ? kept.length : insertAt;
  return { ...document, objects: [...kept.slice(0, at), ...inserted, ...kept.slice(at)] };
}

function updatePrefabInstance(
  document: SceneDocument,
  link: PrefabInstanceLink,
  update: (instance: SceneObject[]) => SceneObject[],
): SceneDocument {
  const instance = getPrefabInstanceObjects(document.objects, link);
  return replaceObjects(document, instance, keepExternalParents(instance, update(instance)));
}

export function addPrefabInstance(
  document: SceneDocument,
  prefab: PrefabDocument,
  options: InstantiatePrefabOptions,
): SceneDocument {
  return { ...document, objects: [...document.objects, ...createPrefabInstance(prefab, options).objects] };
}

export function replaceWithPrefabInstance(
  document: SceneDocument,
  objectId: SceneObjectId,
  prefab: PrefabDocument,
  idPrefix: string,
): SceneDocument {
  const root = document.objects.find((object) => object.id === objectId);
  if (!root) return document;
  const subtreeIds = collectPrefabSubtreeIds(document.objects, [objectId]);
  const { objects } = createPrefabInstance(prefab, {
    idPrefix,
    rootTransform: root.transform,
    ...(root.parentId !== undefined ? { parentId: root.parentId } : {}),
  });
  return replaceObjects(document, document.objects.filter((object) => subtreeIds.has(object.id)), objects);
}

export function revertPrefabInstanceOverride(
  document: SceneDocument,
  prefab: PrefabDocument,
  link: PrefabInstanceLink,
  override: PrefabOverride,
): SceneDocument {
  return updatePrefabInstance(document, link, (instance) =>
    revertPrefabOverride(prefab, instance, link, override),
  );
}

export function revertPrefabInstance(
  document: SceneDocument,
  prefab: PrefabDocument,
  link: PrefabInstanceLink,
): SceneDocument {
  const rootIds = new Set(prefab.rootObjectIds);
  return updatePrefabInstance(document, link, (instance) => {
    const rootTransforms = computePrefabOverrides(prefab, instance, link, { includeRootTransform: true }).filter(
      (override) =>
        override.kind === 'property' &&
        rootIds.has(override.objectId) &&
        override.path.startsWith(TRANSFORM_PATH_PREFIX),
    );
    return applyPrefabOverrides(prefab, rootTransforms, link);
  });
}

export function propagatePrefabToDocument(
  document: SceneDocument,
  previous: PrefabDocument,
  next: PrefabDocument,
): SceneDocument {
  const links = new Map<string, PrefabInstanceLink>();
  document.objects.forEach((object) => {
    const link = readPrefabInstanceLink(object);
    if (link?.prefabId === next.id) links.set(link.idPrefix, link);
  });
  let result = document;
  links.forEach((link) => {
    result = updatePrefabInstance(result, link, (instance) =>
      propagatePrefabChanges(previous, next, instance, link),
    );
  });
  return result;
}

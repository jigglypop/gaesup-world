import { validateSceneDocument } from './core';
import type {
  SceneDocument,
  SceneObject,
  SceneObjectId,
  SceneTransform,
  SceneValidationIssue,
  SceneVector3,
} from './types';

export interface SceneRuntime {
  document: SceneDocument;
  objects: ReadonlyMap<SceneObjectId, SceneObject>;
  children: ReadonlyMap<SceneObjectId, SceneObject[]>;
  roots: SceneObject[];
  getObject: (id: SceneObjectId) => SceneObject | undefined;
  getChildren: (id?: SceneObjectId) => SceneObject[];
  getWorldTransform: (id: SceneObjectId) => SceneTransform | undefined;
}

const ROOT_PARENT = Symbol('scene-root-parent');

export interface LoadSceneRuntimeResult {
  ok: boolean;
  runtime?: SceneRuntime;
  issues: SceneValidationIssue[];
}

export function loadSceneRuntime(document: SceneDocument): LoadSceneRuntimeResult {
  const validation = validateSceneDocument(document);
  if (!validation.valid) {
    return {
      ok: false,
      issues: validation.issues,
    };
  }

  const objects = new Map<SceneObjectId, SceneObject>();
  const children = new Map<SceneObjectId | typeof ROOT_PARENT, SceneObject[]>();

  for (const object of document.objects) {
    objects.set(object.id, object);
    const parentKey = object.parentId ?? ROOT_PARENT;
    const list = children.get(parentKey) ?? [];
    list.push(object);
    children.set(parentKey, list);
  }

  const runtime: SceneRuntime = {
    document,
    objects,
    children: childrenWithoutRoot(children),
    roots: children.get(ROOT_PARENT) ?? [],
    getObject: (id) => objects.get(id),
    getChildren: (id) => children.get(id ?? ROOT_PARENT) ?? [],
    getWorldTransform: (id) => {
      const object = objects.get(id);
      if (!object) return undefined;
      return computeWorldTransform(object, objects);
    },
  };

  return {
    ok: true,
    runtime,
    issues: [],
  };
}

function childrenWithoutRoot(
  children: ReadonlyMap<SceneObjectId | typeof ROOT_PARENT, SceneObject[]>,
): ReadonlyMap<SceneObjectId, SceneObject[]> {
  const next = new Map<SceneObjectId, SceneObject[]>();
  for (const [key, value] of children) {
    if (key !== ROOT_PARENT) {
      next.set(key, value);
    }
  }
  return next;
}

export function composeSceneTransforms(parent: SceneTransform, child: SceneTransform): SceneTransform {
  return {
    position: addVector3(parent.position, child.position),
    rotation: addVector3(parent.rotation, child.rotation),
    scale: multiplyVector3(parent.scale, child.scale),
  };
}

function computeWorldTransform(
  object: SceneObject,
  objects: ReadonlyMap<SceneObjectId, SceneObject>,
): SceneTransform {
  if (!object.parentId) return object.transform;
  const parent = objects.get(object.parentId);
  if (!parent) return object.transform;
  return composeSceneTransforms(computeWorldTransform(parent, objects), object.transform);
}

function addVector3(left: SceneVector3, right: SceneVector3): SceneVector3 {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
  ];
}

function multiplyVector3(left: SceneVector3, right: SceneVector3): SceneVector3 {
  return [
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2],
  ];
}

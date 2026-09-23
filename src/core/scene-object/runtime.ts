import { parseSceneDocument } from './serialization';
import { multiplySceneMatrices, sceneMatrixToTransform, sceneTransformToMatrix } from './transforms';
import type { SceneMatrix } from './transforms';
import type {
  SceneDocument,
  SceneObject,
  SceneObjectId,
  SceneTransform,
  SceneValidationIssue,
} from './types';

export interface SceneRuntime {
  document: SceneDocument;
  objects: ReadonlyMap<SceneObjectId, SceneObject>;
  children: ReadonlyMap<SceneObjectId, SceneObject[]>;
  roots: SceneObject[];
  getObject: (id: SceneObjectId) => SceneObject | undefined;
  getChildren: (id?: SceneObjectId) => SceneObject[];
  getWorldTransform: (id: SceneObjectId) => SceneTransform | undefined;
  getWorldMatrix: (id: SceneObjectId) => SceneMatrix | undefined;
}

const ROOT_PARENT = Symbol('scene-root-parent');

export interface LoadSceneRuntimeResult {
  ok: boolean;
  runtime?: SceneRuntime;
  issues: SceneValidationIssue[];
}

export function loadSceneRuntime(document: SceneDocument): LoadSceneRuntimeResult {
  const parsed = parseSceneDocument(document);
  if (!parsed.ok || !parsed.document) {
    return {
      ok: false,
      issues: parsed.issues,
    };
  }
  const ownedDocument = parsed.document;

  const objects = new Map<SceneObjectId, SceneObject>();
  const children = new Map<SceneObjectId | typeof ROOT_PARENT, SceneObject[]>();

  for (const object of ownedDocument.objects) {
    objects.set(object.id, object);
    const parentKey = object.parentId ?? ROOT_PARENT;
    const list = children.get(parentKey) ?? [];
    list.push(object);
    children.set(parentKey, list);
  }

  const runtime: SceneRuntime = {
    document: ownedDocument,
    objects,
    children: childrenWithoutRoot(children),
    roots: children.get(ROOT_PARENT) ?? [],
    getObject: (id) => objects.get(id),
    getChildren: (id) => children.get(id ?? ROOT_PARENT) ?? [],
    getWorldTransform: (id) => {
      const object = objects.get(id);
      if (!object) return undefined;
      if (!object.parentId) return object.transform;
      return sceneMatrixToTransform(computeWorldMatrix(object, objects));
    },
    getWorldMatrix: (id) => {
      const object = objects.get(id);
      return object ? computeWorldMatrix(object, objects) : undefined;
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

export function composeSceneTransforms(
  parent: SceneTransform,
  child: SceneTransform,
): SceneTransform {
  return sceneMatrixToTransform(multiplySceneMatrices(sceneTransformToMatrix(parent), sceneTransformToMatrix(child)));
}

function computeWorldMatrix(
  object: SceneObject,
  objects: ReadonlyMap<SceneObjectId, SceneObject>,
): SceneMatrix {
  let matrix = sceneTransformToMatrix(object.transform);
  const visited = new Set([object.id]);
  let parent = object.parentId ? objects.get(object.parentId) : undefined;
  while (parent) {
    if (visited.has(parent.id)) throw new RangeError('Scene hierarchy contains a cycle.');
    visited.add(parent.id);
    matrix = multiplySceneMatrices(sceneTransformToMatrix(parent.transform), matrix);
    parent = parent.parentId ? objects.get(parent.parentId) : undefined;
  }
  return matrix;
}

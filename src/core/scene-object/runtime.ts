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

  // The runtime is an immutable snapshot and parsing rejects parent cycles, so every world matrix is computed
  // once, top-down from the nearest cached ancestor, and shared by later calls.
  const worldMatrices = new Map<SceneObjectId, SceneMatrix>();
  const worldMatrixOf = (object: SceneObject): SceneMatrix => {
    const chain: SceneObject[] = [];
    let matrix: SceneMatrix | undefined;
    for (let current: SceneObject | undefined = object; current; current = current.parentId ? objects.get(current.parentId) : undefined) {
      matrix = worldMatrices.get(current.id);
      if (matrix) break;
      chain.push(current);
    }
    for (let index = chain.length - 1; index >= 0; index--) {
      const local = sceneTransformToMatrix(chain[index]!.transform);
      matrix = Object.freeze(matrix ? multiplySceneMatrices(matrix, local) : local);
      worldMatrices.set(chain[index]!.id, matrix);
    }
    return matrix!;
  };

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
      return sceneMatrixToTransform(worldMatrixOf(object));
    },
    getWorldMatrix: (id) => {
      const object = objects.get(id);
      return object ? worldMatrixOf(object) : undefined;
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
